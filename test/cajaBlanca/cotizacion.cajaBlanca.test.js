// PARTE 2 - PRUEBAS DE CAJA BLANCA sobre cotizarServicio (V(G) = 10)
// Cada caso CB-xx recorre un camino basico del grafo de flujo (ver documento).
const { cotizarServicio } = require('../../src/cotizacion');

const HOY = new Date('2026-11-07');
const cup = (porcentaje, venceEn = '2026-11-08') => ({ porcentaje, venceEn });

describe('Caminos basicos de cotizarServicio', () => {
  test('CB-01 camino base: urgente + cupon valido (1-3-5-6-8-9-10-11-12-13-14-16-18-19-20)', () => {
    expect(cotizarServicio('gas', 3, true, cup(20), HOY)).toEqual({ subtotal: 288000, descuento: 57600, total: 230400 });
  });
  test('CB-02 servicio invalido (1-2-20)', () => {
    expect(() => cotizarServicio('pintura', 3, true, cup(20), HOY)).toThrow('Servicio no soportado');
  });
  test('CB-03 horas no enteras (1-3-4-20)', () => {
    expect(() => cotizarServicio('gas', 2.5, true, cup(20), HOY)).toThrow('Las horas deben ser un numero entero');
  });
  test('CB-04 horas menores a 1 (1-3-5-7-20)', () => {
    expect(() => cotizarServicio('gas', 0, true, cup(20), HOY)).toThrow('Horas fuera de rango');
  });
  test('CB-05 horas mayores a 8 (1-3-5-6-7-20)', () => {
    expect(() => cotizarServicio('gas', 9, true, cup(20), HOY)).toThrow('Horas fuera de rango');
  });
  test('CB-06 sin urgencia (1-3-5-6-8-9-11-12-13-14-16-18-19-20)', () => {
    expect(cotizarServicio('gas', 3, false, cup(20), HOY)).toEqual({ subtotal: 240000, descuento: 48000, total: 192000 });
  });
  test('CB-07 sin cupon (1-3-5-6-8-9-10-11-12-19-20)', () => {
    expect(cotizarServicio('gas', 3, true, null, HOY)).toEqual({ subtotal: 288000, descuento: 0, total: 288000 });
  });
  test('CB-08 cupon menor a 5% (1-3-5-6-8-9-10-11-12-13-15-20)', () => {
    expect(() => cotizarServicio('gas', 3, true, cup(4), HOY)).toThrow('Porcentaje de cupon fuera de rango');
  });
  test('CB-09 cupon mayor a 50% (1-3-5-6-8-9-10-11-12-13-14-15-20)', () => {
    expect(() => cotizarServicio('gas', 3, true, cup(51), HOY)).toThrow('Porcentaje de cupon fuera de rango');
  });
  test('CB-10 cupon vencido (1-3-5-6-8-9-10-11-12-13-14-16-17-20)', () => {
    expect(() => cotizarServicio('gas', 3, true, cup(20, '2026-11-06'), HOY)).toThrow('Cupon vencido');
  });
});
