import { IsInt, Min } from 'class-validator';

export class CantidadDto {
  @IsInt()
  @Min(1)
  cantidad: number;
}