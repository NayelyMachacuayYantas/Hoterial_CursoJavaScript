import axios from "axios";
import { Usuario } from "../types/Usuario"; 

const API_BASE_URL = "http://localhost:3001";

export const loginService = { 
  /**
   * Obtiene todos los usuarios del sistema.
   * @returns Una promesa que resuelve con un array de objetos Usuario.
   */
  getUsers: async (): Promise<Usuario[]> => {
    const response = await axios.get<Usuario[]>(`${API_BASE_URL}/usuarios`);
    return response.data;
  },

  /**
   * Registra un nuevo usuario en el sistema.
   * @param newUser El objeto Usuario a registrar (sin id, ya que el backend lo asigna).
   * @returns Una promesa que resuelve con el objeto Usuario creado.
   */
  registerUser: async (newUser: Omit<Usuario, "id">): Promise<Usuario> => {
    const response = await axios.post<Usuario>(`${API_BASE_URL}/usuarios`, newUser);
    return response.data;
  },
};