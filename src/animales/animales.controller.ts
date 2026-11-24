import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AnimalesService } from './animales.service';
import { CrearAnimalDto } from './dto/crear-animal.dto';
import { ListarAnimalesQueryDto } from './dto/listar-animales-query.dto';

@Controller('animales')
export class AnimalesController {
  constructor(private readonly service: AnimalesService) {}

  @Post()
  crear(@Body() dto: CrearAnimalDto) {
    return this.service.crear(dto);
  }

  @Get()
  listar(@Query() filtros: ListarAnimalesQueryDto) {
    return this.service.listar(filtros);
  }

  @Patch(':id/alimentacion')
  alimentar(@Param('id', ParseIntPipe) id: number) {
    return this.service.alimentar(id);
  }
}