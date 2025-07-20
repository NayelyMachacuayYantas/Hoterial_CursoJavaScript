
import axios from "axios";
import { Reserva } from "../types/Reserva";
import { Habitacion } from "../types/Habitacion";

const API_BASE_URL = "http://localhost:3001"; 

export const reservaService = {
  /**
   * Obtiene todos los datos de las habitaciones.
   * @returns Una promesa que se resuelve en un array de objetos Habitacion.
   */
  getHabitaciones: async (): Promise<Habitacion[]> => {
    const response = await axios.get(`${API_BASE_URL}/habitaciones`);
    return response.data;
  },

  /**
   * Obtiene las reservas para un usuario específico.
   * @param userId El ID del usuario.
   * @returns Una promesa que se resuelve en un array de objetos Reserva.
   */
  getReservasByUserId: async (userId: string | number): Promise<Reserva[]> => {
    const response = await axios.get(`${API_BASE_URL}/reservas?usuarioId=${userId}`);
    return response.data;
  },

  /**
   * Actualiza el estado de una reserva a "Cancelada".
   * @param id El ID de la reserva a cancelar.
   * @param reserva El objeto de reserva con el estado actualizado.
   * @returns Una promesa que se resuelve en el objeto Reserva actualizado.
   */
  cancelarReserva: async (id: string | number, reserva: Reserva): Promise<Reserva> => {
    const actualizada: Reserva = { ...reserva, estado: "Cancelada" };
    const response = await axios.put(`${API_BASE_URL}/reservas/${id}`, actualizada);
    return response.data;
  },

  /**
   * Elimina una reserva.
   * @param id El ID de la reserva a eliminar.
   * @returns Una promesa que se resuelve cuando la eliminación es exitosa.
   */
  eliminarReserva: async (id: string | number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/reservas/${id}`);
  },
};