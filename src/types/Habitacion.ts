export interface Habitacion {
  id: number;
  numero: string;
  tipo: string;
  precio: number;
  estado: 'Disponible' | 'Ocupada' | 'Mantenimiento';
  capacidad: number;
  imagen?: string;
}