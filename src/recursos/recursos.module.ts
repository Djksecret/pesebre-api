import { Module } from '@nestjs/common';
import { MercadoAdapter } from '../mercado/mercado.adapter';
import { RecursosController } from './recursos.controller';
import { RecursosRepository } from './recursos.repository';
import { RecursosService } from './recursos.service';

@Module({
  controllers: [RecursosController],
  providers: [RecursosService, RecursosRepository, MercadoAdapter],
  exports: [RecursosService],
})
export class RecursosModule {}