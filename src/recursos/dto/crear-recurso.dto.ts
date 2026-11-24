import { IsEnum, IsInt, IsNotEmpty, IsString, Length, Min } from 'class-validator';
import { Categoria } from '../../common/enums';

export class CrearRecursoDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 60)
  nombre: string;

  @IsEnum(Categoria)
  categoria: Categoria;

  @IsInt()
  @Min(0)
  cantidad: number;

  @IsInt()
  @Min(1)
  stockMinimo: number;
}