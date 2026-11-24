import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Categoria, EstadoRecurso } from '../common/enums';
import {
  MercadoAdapter,
  MercadoNoDisponibleError,
} from '../mercado/mercado.adapter';
import type { Existencia } from '../mercado/mercado.adapter';
import { CrearRecursoDto } from './dto/crear-recurso.dto';
import { ListarRecursosQueryDto } from './dto/listar-recursos-query.dto';
import { Recurso } from './recurso.entity';
import { RecursosRepository } from './recursos.repository';

export interface ResultadoReabastecimiento {
  confirmado: boolean;
  mensaje: string;
  recurso: Recurso;
}

@Injectable()
export class RecursosService {
  constructor(
    private readonly repo: RecursosRepository,
    private readonly mercado: MercadoAdapter,
  ) {}

  // Regla 1: el estado lo calcula el sistema
  private calcularEstado(cantidad: number, stockMinimo: number): EstadoRecurso {
    if (cantidad === 0) return EstadoRecurso.AGOTADO;
    if (cantidad < stockMinimo) return EstadoRecurso.BAJO_STOCK;
    return EstadoRecurso.DISPONIBLE;
  }

  crear(dto: CrearRecursoDto): Recurso {
    if (this.repo.buscarPorNombre(dto.nombre)) {
      throw new ConflictException(`Ya existe un recurso llamado "${dto.nombre}"`);
    }
    return this.repo.crear({
      ...dto,
      estado: this.calcularEstado(dto.cantidad, dto.stockMinimo),
    });
  }

  listar(filtros: ListarRecursosQueryDto): Recurso[] {
    return this.repo
      .listar()
      .filter(
        (r) =>
          (!filtros.categoria || r.categoria === filtros.categoria) &&
          (!filtros.estado || r.estado === filtros.estado),
      );
  }

  obtener(id: number): Recurso {
    const recurso = this.repo.buscarPorId(id);
    if (!recurso) {
      throw new NotFoundException(`No existe el recurso con id ${id}`);
    }
    return recurso;
  }

  buscarPorCategoria(categoria: Categoria): Recurso | undefined {
    return this.repo.buscarPorCategoria(categoria);
  }

  // Regla 2: un consumo no puede dejar la cantidad en negativo (409)
  consumir(id: number, cantidad: number): Recurso {
    const recurso = this.obtener(id);
    if (recurso.cantidad - cantidad < 0) {
      throw new ConflictException(
        `No hay suficiente "${recurso.nombre}": disponible ${recurso.cantidad}, pedido ${cantidad}`,
      );
    }
    recurso.cantidad -= cantidad;
    recurso.estado = this.calcularEstado(recurso.cantidad, recurso.stockMinimo);
    return recurso;
  }

  // Regla 5: reabastecer consultando al Mercado (SOAP)
  async reabastecer(
    id: number,
    cantidad: number,
  ): Promise<ResultadoReabastecimiento> {
    const recurso = this.obtener(id);

    let existencia: Existencia;
    try {
      existencia = await this.mercado.consultarExistencias(
        recurso.categoria,
        cantidad,
      );
    } catch (error) {
      if (error instanceof MercadoNoDisponibleError) {
        // Fallo del servicio externo: queda pendiente y la cantidad NO cambia
        recurso.estado = EstadoRecurso.REABASTECIMIENTO_PENDIENTE;
        return {
          confirmado: false,
          mensaje:
            'El Mercado de Belén no respondió. El reabastecimiento quedó pendiente y se confirmará después.',
          recurso,
        };
      }
      throw error;
    }

    if (existencia === 'SIN_EXISTENCIAS') {
      throw new UnprocessableEntityException(
        `El Mercado no tiene existencias de ${recurso.categoria}`,
      );
    }

    recurso.cantidad += cantidad;
    recurso.estado = this.calcularEstado(recurso.cantidad, recurso.stockMinimo);
    return {
      confirmado: true,
      mensaje: `Se agregaron ${cantidad} unidades a "${recurso.nombre}"`,
      recurso,
    };
  }

  // Regla 6: no se elimina un recurso con cantidad > 0 (409)
  eliminar(id: number): void {
    const recurso = this.obtener(id);
    if (recurso.cantidad > 0) {
      throw new ConflictException(
        `No se puede eliminar "${recurso.nombre}" porque aún tiene ${recurso.cantidad} unidades`,
      );
    }
    this.repo.eliminar(id);
  }
}