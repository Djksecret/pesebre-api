import { Injectable } from '@nestjs/common';
import { Categoria } from '../common/enums';
import { Recurso } from './recurso.entity';

@Injectable()
export class RecursosRepository {
  private recursos: Recurso[] = [];
  private siguienteId = 1;

  crear(datos: Omit<Recurso, 'id'>): Recurso {
    const recurso: Recurso = { id: this.siguienteId++, ...datos };
    this.recursos.push(recurso);
    return recurso;
  }

  listar(): Recurso[] {
    return [...this.recursos];
  }

  buscarPorId(id: number): Recurso | undefined {
    return this.recursos.find((r) => r.id === id);
  }

  buscarPorNombre(nombre: string): Recurso | undefined {
    return this.recursos.find(
      (r) => r.nombre.toLowerCase() === nombre.toLowerCase(),
    );
  }

  buscarPorCategoria(categoria: Categoria): Recurso | undefined {
    return this.recursos.find((r) => r.categoria === categoria);
  }

  eliminar(id: number): void {
    this.recursos = this.recursos.filter((r) => r.id !== id);
  }
}