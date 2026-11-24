import { Categoria, EstadoRecurso } from '../common/enums';

export interface Recurso {
  id: number;
  nombre: string;
  categoria: Categoria;
  cantidad: number;
  stockMinimo: number;
  estado: EstadoRecurso;
}