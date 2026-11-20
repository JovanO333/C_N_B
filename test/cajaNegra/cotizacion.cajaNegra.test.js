// PARTE 1 - PRUEBAS DE CAJA NEGRA (HU-9 cotizacion y HU-7 estados)
// Solo se usa la especificacion (entradas y salidas); no se mira el codigo interno.
const { cotizarServicio } = require('../../src/cotizacion');
const { transicionEstado } = require('../../src/estadoServicio');

const HOY = new Date('2026-11-07');
const AYER = '2026-11-06', HOY_STR = '2026-11-07', MANANA = '2026-11-08';
const cup = (porcentaje, venceEn = MANANA) => ({ porcentaje, venceEn });

describe('1. Particion de equivalencia', () => {
  test.each([
    ['CP-01', 'plomeria', 2, false, null, { subtotal: 120000, descuento: 0, total: 120000 }],
    ['CP-02', 'electricidad', 4, true, cup(10), { subtotal: 336000, descuento: 33600, total: 302400 }]
  ])('%s clases validas', (id, s, h, u, c, esperado) => {
    expect(cotizarServicio(s, h, u, c, HOY)).toEqual(esperado);
  });

  test.each([
    ['CP-03', 'pintura', 2, false, null, 'Servicio no soportado'],
    ['CP-04', 'plomeria', -2, false, null, 'Horas fuera de rango (1 a 8)'],
    ['CP-05', 'plomeria', 12, false, null, 'Horas fuera de rango (1 a 8)'],
    ['CP-06', 'plomeria', 2.5, false, null, 'Las horas deben ser un numero entero'],
    ['CP-07', 'plomeria', 2, false, cup(3), 'Porcentaje de cupon fuera de rango (5 a 50)'],
    ['CP-08', 'plomeria', 2, false, cup(70), 'Porcentaje de cupon fuera de rango (5 a 50)'],
    ['CP-09', 'plomeria', 2, false, cup(10, AYER), 'Cupon vencido'],
    ['CP-10', 'plomeria', 'abc', false, null, 'Las horas deben ser un numero entero'],
    ['CP-11', 'plomeria', 2, false, cup('abc'), 'Porcentaje de cupon fuera de rango (5 a 50)']
  ])('%s clase invalida', (id, s, h, u, c, mensaje) => {
    expect(() => cotizarServicio(s, h, u, c, HOY)).toThrow(mensaje);
  });
});

describe('2. Analisis de valores limite', () => {
  test.each([
    ['VL-01', 1, 60000], ['VL-02', 2, 120000], ['VL-03', 7, 420000], ['VL-04', 8, 480000]
  ])('%s horas=%i valida', (id, h, total) => {
    expect(cotizarServicio('plomeria', h, false, null, HOY).total).toBe(total);
  });
  test.each([['VL-05', 0], ['VL-06', 9]])('%s horas=%i invalida', (id, h) => {
    expect(() => cotizarServicio('plomeria', h, false, null, HOY)).toThrow('Horas fuera de rango');
  });

  test.each([
    ['VL-07', 5, 3000, 57000], ['VL-08', 6, 3600, 56400], ['VL-09', 49, 29400, 30600], ['VL-10', 50, 30000, 30000]
  ])('%s cupon %i%% valido', (id, p, desc, total) => {
    expect(cotizarServicio('plomeria', 1, false, cup(p), HOY)).toEqual({ subtotal: 60000, descuento: desc, total });
  });
  test.each([['VL-11', 4], ['VL-12', 51]])('%s cupon %i%% invalido', (id, p) => {
    expect(() => cotizarServicio('plomeria', 1, false, cup(p), HOY)).toThrow('Porcentaje de cupon fuera de rango');
  });

  test.each([['VL-13', HOY_STR], ['VL-14', MANANA]])('%s cupon que vence %s es vigente', (id, f) => {
    expect(cotizarServicio('plomeria', 1, false, cup(10, f), HOY).total).toBe(54000);
  });
  test('VL-15 cupon que vencio ayer es invalido', () => {
    expect(() => cotizarServicio('plomeria', 1, false, cup(10, AYER), HOY)).toThrow('Cupon vencido');
  });
});

describe('3. Tabla de decision', () => {
  test.each([
    ['R1 servicio invalido', 'pintura', 2, false, null, 'ERROR', 'Servicio no soportado'],
    ['R2 horas invalidas', 'plomeria', 9, false, null, 'ERROR', 'Horas fuera de rango'],
    ['R3 sin recargo ni cupon', 'plomeria', 2, false, null, { subtotal: 120000, descuento: 0, total: 120000 }, null],
    ['R4 solo recargo', 'plomeria', 2, true, null, { subtotal: 144000, descuento: 0, total: 144000 }, null],
    ['R5 solo descuento', 'plomeria', 2, false, cup(10), { subtotal: 120000, descuento: 12000, total: 108000 }, null],
    ['R6 recargo y descuento', 'plomeria', 2, true, cup(10), { subtotal: 144000, descuento: 14400, total: 129600 }, null],
    ['R7 cupon invalido sin urgencia', 'plomeria', 2, false, cup(70), 'ERROR', 'Porcentaje de cupon fuera de rango'],
    ['R8 cupon vencido con urgencia', 'plomeria', 2, true, cup(10, AYER), 'ERROR', 'Cupon vencido']
  ])('DT %s', (nombre, s, h, u, c, esperado, mensaje) => {
    if (esperado === 'ERROR') {
      expect(() => cotizarServicio(s, h, u, c, HOY)).toThrow(mensaje);
    } else {
      expect(cotizarServicio(s, h, u, c, HOY)).toEqual(esperado);
    }
  });
});

describe('4. Transicion de estados (HU-7)', () => {
  test.each([
    ['TE-01', 'solicitado', 'aceptar', 'en camino'],
    ['TE-02', 'en camino', 'iniciar', 'en curso'],
    ['TE-03', 'en curso', 'finalizar', 'finalizado']
  ])('%s transicion valida %s --%s--> %s', (id, estado, evento, esperado) => {
    expect(transicionEstado(estado, evento)).toBe(esperado);
  });

  test.each([
    ['TE-04', 'solicitado', 'iniciar'], ['TE-05', 'solicitado', 'finalizar'],
    ['TE-06', 'en camino', 'aceptar'], ['TE-07', 'en camino', 'finalizar'],
    ['TE-08', 'en curso', 'aceptar'], ['TE-09', 'en curso', 'iniciar'],
    ['TE-10', 'finalizado', 'aceptar'], ['TE-11', 'finalizado', 'iniciar'], ['TE-12', 'finalizado', 'finalizar']
  ])('%s transicion invalida %s --%s--', (id, estado, evento) => {
    expect(() => transicionEstado(estado, evento)).toThrow('Transicion invalida');
  });

  test('TE-13 estado desconocido', () => {
    expect(() => transicionEstado('cancelado', 'aceptar')).toThrow('Estado desconocido');
  });
  test('TE-14 evento desconocido', () => {
    expect(() => transicionEstado('solicitado', 'pagar')).toThrow('Evento desconocido');
  });
});

describe('4b. Secuencias de estados (HU-7)', () => {
  const recorrer = (inicio, eventos) => eventos.reduce((e, ev) => transicionEstado(e, ev), inicio);

  test('TS-01 flujo completo: solicitado -> en camino -> en curso -> finalizado', () => {
    const visitados = ['solicitado'];
    let e = 'solicitado';
    ['aceptar', 'iniciar', 'finalizar'].forEach(ev => { e = transicionEstado(e, ev); visitados.push(e); });
    expect(visitados).toEqual(['solicitado', 'en camino', 'en curso', 'finalizado']);
  });
  test('TS-02 secuencia que falla a mitad: en camino no puede finalizar', () => {
    expect(() => recorrer('solicitado', ['aceptar', 'finalizar'])).toThrow('Transicion invalida');
  });
  test('TS-03 estado final: despues de finalizado no hay mas transiciones', () => {
    expect(() => recorrer('solicitado', ['aceptar', 'iniciar', 'finalizar', 'aceptar'])).toThrow('Transicion invalida');
  });
});
