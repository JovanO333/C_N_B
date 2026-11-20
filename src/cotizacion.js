// Modulo de cotizacion y estados del servicio de Fixly.
// Se usa en la Guia de Trabajo Practico (caja negra y caja blanca).
//   HU-9: precio estimado, recargo por urgencia y cupon de descuento.

const TARIFAS = {
  plomeria: 60000,
  electricidad: 70000,
  cerrajeria: 50000,
  gas: 80000,
  electrodomesticos: 65000
};

// Reglas de validacion
//   servicio: uno de los 5 servicios de TARIFAS
//   horas:    entero entre 1 y 8
//   urgente:  verdadero = recargo del 20%
//   cupon:    opcional; porcentaje entre 5 y 50 y fecha de vencimiento >= hoy
function cotizarServicio(servicio, horas, urgente, cupon, hoy) {
  if (!Object.prototype.hasOwnProperty.call(TARIFAS, servicio)) {   // decision 1
    throw new Error('Servicio no soportado');
  }
  if (!Number.isInteger(horas)) {                                    // decision 2
    throw new Error('Las horas deben ser un numero entero');
  }
  if (horas < 1 || horas > 8) {                                      // decision 3 (condiciones 3a y 3b)
    throw new Error('Horas fuera de rango (1 a 8)');
  }
  let total = TARIFAS[servicio] * horas;
  if (urgente) {                                                     // decision 4
    total = Math.round(total * 1.2);
  }
  let descuento = 0;
  if (cupon) {                                                       // decision 5
    if (!(cupon.porcentaje >= 5) || !(cupon.porcentaje <= 50)) {      // decision 6 (condiciones 6a y 6b)
      throw new Error('Porcentaje de cupon fuera de rango (5 a 50)');
    }
    if (new Date(cupon.venceEn) < hoy) {                             // decision 7
      throw new Error('Cupon vencido');
    }
    descuento = Math.round((total * cupon.porcentaje) / 100);
  }
  return { subtotal: total, descuento, total: total - descuento };
}

module.exports = { cotizarServicio, TARIFAS };
