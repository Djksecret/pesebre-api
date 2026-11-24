import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ROLES_KEY } from './roles.decorator';
import { Rol } from './roles';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const rolesRequeridos = this.reflector.getAllAndOverride<Rol[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Sin @Roles() el endpoint es público
    if (!rolesRequeridos || rolesRequeridos.length === 0) return true;

    const req = context.switchToHttp().getRequest<Request>();
    const [tipo, token] = req.headers['authorization']?.split(' ') ?? [];

    // Sin token -> 401
    if (tipo !== 'Bearer' || !token) {
      throw new UnauthorizedException('Falta el token de autenticación');
    }

    let payload: { rol?: Rol };
    try {
      payload = this.jwt.verify<{ rol?: Rol }>(token);
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    // Token válido pero rol distinto -> 403
    if (!payload.rol || !rolesRequeridos.includes(payload.rol)) {
      throw new ForbiddenException('Tu rol no tiene permiso para esta acción');
    }
    return true;
  }
}