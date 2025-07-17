import { useEffect, useState, useCallback } from "react";
import { Usuario } from "../../types/Usuario";
import { Reserva } from "../../types/Reserva";
import { Habitacion } from "../../types/Habitacion";
import { Servicio } from "../../types/Servicio";
import axios from "axios";
import "../../css/Resumen.css";

// Interfaz para agrupar reserva y su habitación asociada para facilitar el renderizado
interface ReservaConHabitacion extends Reserva {
  detalleHabitacion?: Habitacion; // Propiedad opcional para guardar la habitación
}

const DashboardClient = () => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  // Ahora almacenaremos todas las reservas del usuario
  const [reservasDelUsuario, setReservasDelUsuario] = useState<ReservaConHabitacion[]>([]);
  
  const [serviciosAdicionales, setServiciosAdicionales] = useState<Servicio[]>([]);
  // El total general ahora podría ser el total de todas las reservas activas + servicios
  const [totalGeneral, setTotalGeneral] = useState<number>(0);

  const cargarDatos = useCallback(async (userId: number) => {
    try {
      // 1. Obtener TODAS las reservas del usuario (excluyendo las canceladas)
      const resReservas = await axios.get<Reserva[]>(
        `http://localhost:3001/reservas?usuarioId=${userId}&estado_ne=Cancelada`
      );
      const userReservas = resReservas.data;

      // Array para almacenar las habitaciones asociadas a las reservas
      const habitacionesObtenidas: Habitacion[] = [];
      const reservasConDetalle: ReservaConHabitacion[] = [];
      let sumaTotalReservas = 0;

      // 2. Para cada reserva, obtener los detalles de la habitación
      for (const reserva of userReservas) {
        try {
          const resHabitacion = await axios.get<Habitacion>(
            `http://localhost:3001/habitaciones/${reserva.habitacionId}`
          );
          const habitacionDetalle = resHabitacion.data;
          reservasConDetalle.push({ ...reserva, detalleHabitacion: habitacionDetalle });
          habitacionesObtenidas.push(habitacionDetalle);
          sumaTotalReservas += habitacionDetalle.precio; // Sumar precio de la habitación
        } catch (habError) {
          console.error(`Error al cargar habitación ${reserva.habitacionId} para reserva ${reserva.id}:`, habError);
          // Si falla, al menos muestra la reserva sin detalle de habitación
          reservasConDetalle.push(reserva); 
        }
      }
      setReservasDelUsuario(reservasConDetalle);

      // 3. Obtener los servicios del localStorage (asumimos que son servicios generales para el usuario)
      const serviciosGuardados = localStorage.getItem(`servicios-${userId}`);
      const serviciosCargados = serviciosGuardados ? JSON.parse(serviciosGuardados) : [];
      setServiciosAdicionales(serviciosCargados);

      // 4. Calcular el total general
      const totalServicios = serviciosCargados.reduce((sum: number, s: Servicio) => sum + s.precio, 0);
      setTotalGeneral(sumaTotalReservas + totalServicios); // Total de todas las habitaciones reservadas + servicios

    } catch (error) {
      console.error("Error al cargar datos en DashboardClient:", error);
      // Limpiar estados en caso de error
      setReservasDelUsuario([]);
      setServiciosAdicionales([]);
      setTotalGeneral(0);
    }
  }, []); // Dependencias vacías: la función se crea una sola vez

  // --- Efecto para la carga inicial de datos y escucha de eventos ---
  useEffect(() => {
    const userRaw = localStorage.getItem("usuario");
    if (!userRaw) return;
    const user = JSON.parse(userRaw);
    setUsuario(user);

    // Carga inicial
    cargarDatos(user.id);

    // Escuchar el evento 'dashboardUpdate' para recargar los datos
    const handleDashboardUpdate = () => {
      console.log("Evento 'dashboardUpdate' recibido en DashboardClient. Recargando datos...");
      if (user.id) { // Asegurarse de que el ID del usuario está disponible
        cargarDatos(user.id);
      }
    };

    // Escuchar cambios en localStorage (ej. cuando se añaden/quitan servicios)
    const handleStorageChange = (e: StorageEvent) => {
      // Solo recargar si el cambio es relevante para nuestros datos (ej. servicios del usuario)
      if (e.key && e.key.startsWith(`servicios-${user.id}`)) {
          handleDashboardUpdate();
      }
    };

    window.addEventListener("dashboardUpdate", handleDashboardUpdate);
    window.addEventListener("storage", handleStorageChange); 

    // Función de limpieza al desmontar el componente
    return () => {
      window.removeEventListener("dashboardUpdate", handleDashboardUpdate);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [cargarDatos]); // Dependencia: cargarDatos

  return (
    <div className="resumen-fondo py-5">
      <div className="container">
        <h2 className="text-center titulo-sec mb-2">Resumen del Cliente</h2>

        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card resumen-card shadow-lg p-4 rounded-4">
              {usuario ? (
                <>
                  <h4 className="subtitulo mb-3">Información del Cliente</h4>
                  <p><strong>👤 Nombre:</strong> {usuario.nombre}</p>
                  <p><strong>📧 Correo:</strong> {usuario.correo}</p>

                  <h4 className="subtitulo mt-4 mb-3">Mis Reservas</h4>
                  {reservasDelUsuario.length === 0 ? (
                    <p className="text-muted text-center">No tienes reservas activas.</p>
                  ) : (
                    reservasDelUsuario.map((res, index) => (
                      <div key={res.id || `reserva-${index}`} className="mb-4 p-3 border rounded">
                        <p><strong>📅 Fechas:</strong> {res.fechaIngreso} → {res.fechaSalida}</p>
                        <p><strong>📊 Estado:</strong> <span className={`fw-bold ${
                            res.estado === "Confirmada" ? "text-success" : 
                            res.estado === "Pendiente" ? "text-warning" : 
                            "text-danger" // Para Cancelada, aunque filtramos canceladas
                          }`}>{res.estado}</span></p>

                        {res.detalleHabitacion ? (
                          <>
                            <h6 className="subtitulo mt-3 mb-2">Detalle de la Habitación</h6>
                            <p><strong>🔢 Número:</strong> {res.detalleHabitacion.numero}</p>
                            <p><strong>🛏️ Tipo:</strong> {res.detalleHabitacion.tipo}</p>
                            <p><strong>💰 Precio:</strong> S/ {res.detalleHabitacion.precio}</p>
                          </>
                        ) : (
                          <p className="text-muted">Detalles de la habitación no disponibles.</p>
                        )}
                      </div>
                    ))
                  )}

                  <h4 className="subtitulo mt-4 mb-3">Servicios Adicionales (Generales del Usuario)</h4>
                  {serviciosAdicionales.length === 0 ? (
                    <p className="text-muted">No se agregaron servicios generales.</p>
                  ) : (
                    <ul className="list-group mb-3 rounded-3 overflow-hidden">
                      {serviciosAdicionales.map((s) => (
                        <li
                          key={s.id}
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          {s.nombre}
                          <span className="badge bg-warning text-dark">S/ {s.precio}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="text-end mt-4">
                    <h5 className="fw-bold total-final">
                      Total General de Reservas Activas y Servicios: <span className="text-success">S/ {totalGeneral.toFixed(2)}</span>
                    </h5>
                  </div>
                </>
              ) : (
                <p className="text-muted text-center">Inicia sesión para ver tu resumen.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardClient;