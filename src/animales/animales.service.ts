import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Categoria } from '../common/enums';
import { RecursosService } from '../recursos/recursos.service';
import { Animal } from './animal.entity';
import { AnimalesRepository } from './animales.repository';
import { CrearAnimalDto } from './dto/crear-animal.dto';
import { ListarAnimalesQueryDto } from './dto/listar-animales-query.dto';

const fechaLocal = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-CA'); // formato YYYY-MM-DD

@Injectable()
export class AnimalesService {
  constructor(
    private readonly repo: AnimalesRepository,
    private readonly recursosService: RecursosService,
  ) {}

  crear(dto: CrearAnimalDto): Animal {
    return this.repo.crear({ ...dto, ultimaAlimentacion: null });
  }

  listar(filtros: ListarAnimalesQueryDto): Animal[] {
    return this.repo
      .listar()
      .filter((a) => !filtros.especie || a.especie === filtros.especie);
  }

  obtener(id: number): Animal {
    const animal = this.repo.buscarPorId(id);
    if (!animal) {
      throw new NotFoundException(`No existe el animal con id ${id}`);
    }
    return animal;
  }

  alimentar(id: number): Animal {
    const animal = this.obtener(id);

    // Regla 4: no se alimenta dos veces el mismo día (422)
    const ahora = new Date().toISOString();
    if (
      animal.ultimaAlimentacion &&
      fechaLocal(animal.ultimaAlimentacion) === fechaLocal(ahora)
    ) {
      throw new UnprocessableEntityException(
        `"${animal.nombre}" ya fue alimentado hoy`,
      );
    }

    // Regla 3: se descuenta la ración del alimento; si no alcanza, 409 y no se descuenta nada
    const alimento = this.recursosService.buscarPorCategoria(
      Categoria.ALIMENTO_ANIMALES,
    );
    if (!alimento || alimento.cantidad < animal.racionDiaria) {
      throw new ConflictException(
        `No hay alimento suficiente para la ración de ${animal.racionDiaria} unidades`,
      );
    }
    this.recursosService.consumir(alimento.id, animal.racionDiaria);

    animal.ultimaAlimentacion = ahora;
    return animal;
  }
}