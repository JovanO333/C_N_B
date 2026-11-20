// Ciclo de vida de una solicitud de servicio de Fixly (HU-7).
// Se usa en la Guia de Trabajo Practico (caja negra: diagrama de transicion de estados).

// HU-7: estados y eventos del servicio
//   solicitado --aceptar--> en camino --iniciar--> en curso --finalizar--> finalizado
const ESTADOS = ['solicitado', 'en camino', 'en curso', 'finalizado'];
const EVENTOS = ['aceptar', 'iniciar', 'finalizar'];
const TRANSICIONES = {
  'solicitado|aceptar': 'en camino',
  'en camino|iniciar': 'en curso',
  'en curso|finalizar': 'finalizado'
};

function transicionEstado(estado, evento) {
  if (!ESTADOS.includes(estado)) throw new Error('Estado desconocido');
  if (!EVENTOS.includes(evento)) throw new Error('Evento desconocido');
  const siguiente = TRANSICIONES[estado + '|' + evento];
  if (!siguiente) throw new Error('Transicion invalida');
  return siguiente;
}

module.exports = { transicionEstado, ESTADOS, EVENTOS };
