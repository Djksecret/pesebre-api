import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { Roles } from '../auth/roles.decorator';
import { Rol } from '../auth/roles';
import { CantidadDto } from './dto/cantidad.dto';
import { CrearRecursoDto } from './dto/crear-recurso.dto';
import { ListarRecursosQueryDto } from './dto/listar-recursos-query.dto';
import { RecursosService } from './recursos.service';

@Controller('recursos')
export class RecursosController {
  constructor(private readonly service: RecursosService) {}

  @Post()
  @Roles(Rol.ENCARGADO_PESEBRE)
  crear(@Body() dto: CrearRecursoDto) {
    return this.service.crear(dto);
  }

  @Get()
  listar(@Query() filtros: ListarRecursosQueryDto) {
    return this.service.listar(filtros);
  }

  @Get(':id')
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.service.obtener(id);
  }

  @Patch(':id/consumo')
  @Roles(Rol.ENCARGADO_PESEBRE)
  consumir(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CantidadDto,
  ) {
    return this.service.consumir(id, dto.cantidad);
  }

  @Patch(':id/reabastecimiento')
  @Roles(Rol.ENCARGADO_PESEBRE)
  async reabastecer(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CantidadDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const resultado = await this.service.reabastecer(id, dto.cantidad);
    // 200 si se reabasteció, 202 si quedó pendiente por falla del Mercado
    res.status(resultado.confirmado ? 200 : 202);
    return resultado;
  }

  @Delete(':id')
  @Roles(Rol.ENCARGADO_PESEBRE)
  @HttpCode(204)
  eliminar(@Param('id', ParseIntPipe) id: number) {
    this.service.eliminar(id);
  }
}