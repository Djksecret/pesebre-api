import { Especie } from '../common/enums';

export interface Animal {
  id: number;
  nombre: string;
  especie: Especie;
  racionDiaria: number;
  ultimaAlimentacion: string | null;
}