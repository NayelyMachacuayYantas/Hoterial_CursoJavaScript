import axios from 'axios';
import { Habitacion } from '../types/Habitacion'; 

const API_URL = "http://localhost:3001/habitaciones"; 

/**
 * Servicio para interactuar con la API de habitaciones.
 */
export const habitacionService = {
  /**
   * Obtiene todas las habitaciones desde la API.
   * Por defecto, las marca visualmente como 'Disponible'.
   * @returns {Promise<Habitacion[]>} Una promesa que resuelve con un array de habitaciones.
   */
  getHabitaciones: async (): Promise<Habitacion[]> => {
    try {
      const res = await axios.get<Habitacion[]>(API_URL);

      // Mapea las habitaciones para mostrarlas visualmente como "Disponible" en el cliente
      const habitacionesDisponiblesVisualmente: Habitacion[] = res.data.map(hab => ({
        ...hab,
        estado: "Disponible" as Habitacion['estado'] // Forzamos el estado para la UI del cliente
      }));

      console.log("Habitaciones cargadas por el servicio y preparadas para la UI.");
      return habitacionesDisponiblesVisualmente;
    } catch (error) {
      console.error("Error en habitacionService.getHabitaciones:", error);
      throw error; // Propaga el error para que el componente que llama pueda manejarlo
    }
  },

 
};