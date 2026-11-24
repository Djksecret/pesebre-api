const http = require('http');

const respuesta = (resultado) => `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:mb="http://belen.beatlech/mercado"><soap:Body><mb:ConsultarExistenciasResponse><mb:resultado>${resultado}</mb:resultado></mb:ConsultarExistenciasResponse></soap:Body></soap:Envelope>`;

const fault = `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><soap:Fault><faultcode>soap:Server</faultcode><faultstring>Mercado cerrado</faultstring></soap:Fault></soap:Body></soap:Envelope>`;

http
  .createServer((req, res) => {
    let cuerpo = '';
    req.on('data', (c) => (cuerpo += c));
    req.on('end', () => {
      const cantidad = (cuerpo.match(/<(?:\w+:)?cantidad>\s*(\d+)/) || [])[1];
      const categoria = (cuerpo.match(/<(?:\w+:)?categoria>\s*([^<\s]+)/) || [])[1];
      res.setHeader('Content-Type', 'text/xml; charset=utf-8');

      if (cantidad === '999') {            // Fault
        res.statusCode = 500;
        return res.end(fault);
      }
      if (cantidad === '888') {            // Simula un mercado muy lento (timeout)
        return setTimeout(() => res.end(respuesta('DISPONIBLE')), 5000);
      }
      if (categoria === 'LAMPARA_ACEITE') { // Simula que no hay existencias
        return res.end(respuesta('SIN_EXISTENCIAS'));
      }
      res.end(respuesta('DISPONIBLE'));
    });
  })
  .listen(4000, () => console.log('Mock Mercado de Belén en http://localhost:4000/mercado'));