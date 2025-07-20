import axios from "axios";
import { Habitacion } from "../types/Habitacion";
import { Reserva } from "../types/Reserva";

const API_BASE_URL = "http://localhost:3001";

export const reservasClientService = {
  /**
   * Obtiene todas las habitaciones disponibles.
   * @returns Una promesa que resuelve con un array de objetos Habitacion.
   */
  getAvailableHabitaciones: async (): Promise<Habitacion[]> => {
    const response = await axios.get(`${API_BASE_URL}/habitaciones`);
    return response.data.filter((h: Habitacion) => h.estado === "Disponible");
  },

  /**
   * Obtiene las reservas de un usuario específico.
   * @param userId El ID del usuario.
   * @returns Una promesa que resuelve con un array de objetos Reserva.
   */
  getReservasByUserId: async (userId: number): Promise<Reserva[]> => {
    const response = await axios.get(`${API_BASE_URL}/reservas?usuarioId=${userId}`);
    return response.data;
  },

  /**
   * Elimina una reserva por su ID.
   * @param id El ID de la reserva a eliminar.
   */
  deleteReserva: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/reservas/${id}`);
  },

  /**
   * Crea una nueva reserva.
   * @param newReserva El objeto de la nueva reserva.
   * @returns Una promesa que resuelve con la reserva creada.
   */
  createReserva: async (newReserva: Omit<Reserva, "id">): Promise<Reserva> => {
    const response = await axios.post(`${API_BASE_URL}/reservas`, newReserva);
    return response.data;
  },

  /**
   * Actualiza una reserva existente.
   * @param id El ID de la reserva a actualizar.
   * @param updatedReserva El objeto de reserva actualizado.
   * @returns Una promesa que resuelve con la reserva actualizada.
   */
  updateReserva: async (id: number, updatedReserva: Reserva): Promise<Reserva> => {
    const response = await axios.put(`${API_BASE_URL}/reservas/${id}`, updatedReserva);
    return response.data;
  },
};