import axios from 'axios';
import { ContactoForm } from '../types/Contacto'; 
const API_URL = "http://localhost:3001/contactos"; 

/**
 * Servicio para enviar mensajes del formulario de contacto a la API.
 */
export const contactoService = {
  /**
   * Envía los datos de un formulario de contacto a la API.
   * @param {ContactoForm} data - Los datos del formulario de contacto a enviar.
   * @returns {Promise<ContactoForm>} Una promesa que resuelve con los datos del contacto creado.
   */
  enviarMensaje: async (data: ContactoForm): Promise<ContactoForm> => {
    try {
      const res = await axios.post<ContactoForm>(API_URL, data);
      console.log("Mensaje enviado exitosamente a la API:", res.data);
      return res.data;
    } catch (error) {
      console.error("Error en contactoService.enviarMensaje:", error);
      throw error; // Propaga el error para que el componente que llama pueda manejarlo
    }
  },

 
};