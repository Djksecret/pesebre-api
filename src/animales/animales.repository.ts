import { Injectable } from '@nestjs/common';
import { Animal } from './animal.entity';

@Injectable()
export class AnimalesRepository {
  private animales: Animal[] = [];
  private siguienteId = 1;

  crear(datos: Omit<Animal, 'id'>): Animal {
    const animal: Animal = { id: this.siguienteId++, ...datos };
    this.animales.push(animal);
    return animal;
  }

  listar(): Animal[] {
    return [...this.animales];
  }

  buscarPorId(id: number): Animal | undefined {
    return this.animales.find((a) => a.id === id);
  }
}