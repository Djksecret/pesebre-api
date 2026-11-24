import { Module } from '@nestjs/common';
import { RecursosModule } from '../recursos/recursos.module';
import { AnimalesController } from './animales.controller';
import { AnimalesRepository } from './animales.repository';
import { AnimalesService } from './animales.service';

@Module({
  imports: [RecursosModule],
  controllers: [AnimalesController],
  providers: [AnimalesService, AnimalesRepository],
})
export class AnimalesModule {}