import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Categoria } from '../common/enums';

export type Existencia = 'DISPONIBLE' | 'SIN_EXISTENCIAS';

export class MercadoNoDisponibleError extends Error {}

const TIMEOUT_MS = 3000;

@Injectable()
export class MercadoAdapter {
  private readonly logger = new Logger(MercadoAdapter.name);

  constructor(private readonly config: ConfigService) {}

  async consultarExistencias(
    categoria: Categoria,
    cantidad: number,
  ): Promise<Existencia> {
    const url = this.config.get<string>('MERCADO_URL');
    if (!url) {
      throw new MercadoNoDisponibleError('MERCADO_URL no está configurada');
    }

    const controller = new AbortController();
    const temporizador = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const respuesta = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          SOAPAction: '"ConsultarExistencias"',
        },
        body: this.construirSolicitud(categoria, cantidad),
        signal: controller.signal,
      });
      const xml = await respuesta.text();
      return this.interpretarRespuesta(xml);
    } catch (error) {
      if (error instanceof MercadoNoDisponibleError) throw error;
      // Timeout, conexión rechazada, red caída, etc.
      this.logger.warn(`Falla al consultar el Mercado: ${String(error)}`);
      throw new MercadoNoDisponibleError('No se pudo contactar al Mercado de Belén');
    } finally {
      clearTimeout(temporizador);
    }
  }

  // Objeto de dominio -> XML
  private construirSolicitud(categoria: Categoria, cantidad: number): string {
    return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:mb="http://belen.beatlech/mercado">
  <soapenv:Body>
    <mb:ConsultarExistenciasRequest>
      <mb:categoria>${categoria}</mb:categoria>
      <mb:cantidad>${cantidad}</mb:cantidad>
    </mb:ConsultarExistenciasRequest>
  </soapenv:Body>
</soapenv:Envelope>`;
  }

  // XML -> objeto de dominio
  private interpretarRespuesta(xml: string): Existencia {
    if (/<(?:\w+:)?faultcode>/i.test(xml)) {
      throw new MercadoNoDisponibleError('El Mercado respondió con un Fault');
    }
    const coincidencia = xml.match(
      /<(?:\w+:)?resultado>\s*([^<]+?)\s*<\/(?:\w+:)?resultado>/i,
    );
    const resultado = coincidencia?.[1];
    if (resultado === 'DISPONIBLE' || resultado === 'SIN_EXISTENCIAS') {
      return resultado;
    }
    throw new MercadoNoDisponibleError('Respuesta del Mercado no reconocida');
  }
}