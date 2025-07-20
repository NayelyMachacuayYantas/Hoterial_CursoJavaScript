import axios from 'axios';
import { Usuario } from '../types/Usuario'; 
import { Reserva } from '../types/Reserva';
import { Habitacion } from '../types/Habitacion';
import { Servicio } from '../types/Servicio';

// Interfaz para agrupar reserva y su habitación asociada para facilitar el renderizado
export interface ReservaConHabitacion extends Reserva {
  detalleHabitacion?: Habitacion; 
}

/**
 * Servicio para obtener todos los datos necesarios para el dashboard del cliente.
 */
export const dashboardService = {
  /**
   * Carga todos los datos del dashboard para un ID de usuario dado.
   * Esto incluye: reservas activas del usuario, detalles de las habitaciones asociadas,
   * servicios adicionales del localStorage y calcula el total.
   * @param userId El ID del usuario para el que se cargarán los datos.
   * @returns Una promesa que se resuelve con un objeto que contiene
   * las reservas, los servicios adicionales y el total general.
   */
  loadClientDashboardData: async (userId: number): Promise<{
    reservas: ReservaConHabitacion[];
    servicios: Servicio[];
    total: number;
  }> => {
    let totalGeneralCalculado = 0;
    const userReservasConDetalle: ReservaConHabitacion[] = [];
    let loadedServiciosAdicionales: Servicio[] = [];

    try {
      // 1. Obtener TODAS las reservas del usuario (excluyendo las canceladas)
      const resReservas = await axios.get<Reserva[]>(
        `http://localhost:3001/reservas?usuarioId=${userId}&estado_ne=Cancelada`
      );
      const userReservas = resReservas.data;

      let sumaTotalReservas = 0;

      // 2. Para cada reserva, obtener los detalles de la habitación
      for (const reserva of userReservas) {
        try {
          const resHabitacion = await axios.get<Habitacion>(
            `http://localhost:3001/habitaciones/${reserva.habitacionId}`
          );
          const habitacionDetalle = resHabitacion.data;
          userReservasConDetalle.push({ ...reserva, detalleHabitacion: habitacionDetalle });
          sumaTotalReservas += habitacionDetalle.precio; // Sumar precio de la habitación
        } catch (habError) {
          console.error(`Error al cargar habitación ${reserva.habitacionId} para reserva ${reserva.id}:`, habError);
          // Si falla, al menos muestra la reserva sin el detalle de la habitación
          userReservasConDetalle.push(reserva);
        }
      }

      // 3. Obtener los servicios del localStorage (asumimos que son servicios generales para el usuario)
      const serviciosGuardados = localStorage.getItem(`servicios-${userId}`);
      loadedServiciosAdicionales = serviciosGuardados ? JSON.parse(serviciosGuardados) : [];

      // 4. Calcular el total general
      const totalServicios = loadedServiciosAdicionales.reduce((sum: number, s: Servicio) => sum + s.precio, 0);
      totalGeneralCalculado = sumaTotalReservas + totalServicios; // Total de todas las habitaciones reservadas + servicios

      return {
        reservas: userReservasConDetalle,
        servicios: loadedServiciosAdicionales,
        total: totalGeneralCalculado,
      };

    } catch (error) {
      console.error("Error en dashboardService.loadClientDashboardData:", error);
      // Es una buena práctica relanzar el error para que el componente que llama pueda manejarlo
      throw error;
    }
  },


};