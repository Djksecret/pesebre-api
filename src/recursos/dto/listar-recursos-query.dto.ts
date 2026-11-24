import { IsEnum, IsOptional } from 'class-validator';
import { Categoria, EstadoRecurso } from '../../common/enums';

export class ListarRecursosQueryDto {
  @IsOptional()
  @IsEnum(Categoria)
  categoria?: Categoria;

  @IsOptional()
  @IsEnum(EstadoRecurso)
  estado?: EstadoRecurso;
}