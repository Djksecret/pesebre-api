import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

const CODIGOS: Record<number, string> = {
  400: 'FORMATO_INVALIDO',
  401: 'NO_AUTENTICADO',
  403: 'ROL_INSUFICIENTE',
  404: 'NO_ENCONTRADO',
  409: 'CONFLICTO_DE_ESTADO',
  422: 'REGLA_DE_NEGOCIO',
  503: 'SERVICIO_EXTERNO_CAIDO',
  500: 'ERROR_INTERNO',
};

@Catch()
export class FiltroErrores implements ExceptionFilter {
  private readonly logger = new Logger(FiltroErrores.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let mensaje = 'Error interno del servidor';
    let detalles: string[] = [];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const respuesta = exception.getResponse();

      if (typeof respuesta === 'string') {
        mensaje = respuesta;
      } else {
        const cuerpo = respuesta as { message?: string | string[] };
        if (Array.isArray(cuerpo.message)) {
          // Errores de validación: van en "detalles"
          mensaje = 'La solicitud contiene datos inválidos';
          detalles = cuerpo.message;
        } else if (cuerpo.message) {
          mensaje = cuerpo.message;
        }
      }
    } else {
      // Error inesperado: se registra en consola, pero al cliente no se le filtran detalles internos
      this.logger.error(exception);
    }

    res.status(status).json({
      codigo: CODIGOS[status] ?? 'ERROR',
      mensaje,
      detalles,
      timestamp: new Date().toISOString(),
      ruta: req.originalUrl,
    });
  }
}