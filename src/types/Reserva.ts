export interface Reserva {
  id: number;
  usuarioId: number;
  habitacionId: number;
  fechaIngreso: string;
  fechaSalida: string;
  estado: 'Confirmada' | 'Pendiente' | 'Cancelada';
}