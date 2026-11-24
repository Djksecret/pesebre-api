import { IsEnum, IsOptional } from 'class-validator';
import { Especie } from '../../common/enums';

export class ListarAnimalesQueryDto {
  @IsOptional()
  @IsEnum(Especie)
  especie?: Especie;
}