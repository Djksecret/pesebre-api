import { IsEnum, IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';
import { Especie } from '../../common/enums';

export class CrearAnimalDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsEnum(Especie)
  especie: Especie;

  @IsInt()
  @Min(1)
  @Max(10)
  racionDiaria: number;
}