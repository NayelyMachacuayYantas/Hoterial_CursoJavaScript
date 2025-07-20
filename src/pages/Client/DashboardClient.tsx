import { useEffect, useState, useCallback } from "react";
import { Usuario } from "../../types/Usuario";
import { Servicio } from "../../types/Servicio";
import "../../css/Resumen.css";

import {
  dashboardService,
  ReservaConHabitacion,
} from "../../services/dashboardService";

const DashboardClient = () => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [reservasDelUsuario, setReservasDelUsuario] = useState<
    ReservaConHabitacion[]
  >([]);
  const [serviciosAdicionales, setServiciosAdicionales] = useState<Servicio[]>(
    []
  );
  const [totalGeneral, setTotalGeneral] = useState<number>(0);

  // Esta función `cargarDatos` ahora simplemente llama al servicio
  const cargarDatos = useCallback(async (userId: number) => {
    try {
      const data = await dashboardService.loadClientDashboardData(userId);
      setReservasDelUsuario(data.reservas);
      setServiciosAdicionales(data.servicios);
      setTotalGeneral(data.total);
    } catch (err) {
      console.error(
        "Error al cargar datos en el componente DashboardClient:",
        err
      );
      // Limpiar estados en caso de error para reflejar que no hay datos
      setReservasDelUsuario([]);
      setServiciosAdicionales([]);
      setTotalGeneral(0);
    }
  }, []); // Dependencias vacías: esta función se crea una sola vez

  // --- Efecto para la carga inicial de datos y escucha de eventos ---
  useEffect(() => {
    const userRaw = localStorage.getItem("usuario");
    if (!userRaw) {
      setUsuario(null); // Asegurarse de que el usuario sea nulo si no hay datos
      return;
    }
    const user = JSON.parse(userRaw);
    setUsuario(user);

    // Carga inicial de datos del dashboard
    cargarDatos(user.id);

    // Escuchar el evento 'dashboardUpdate' para recargar los datos
    const handleDashboardUpdate = () => {
      console.log(
        "Evento 'dashboardUpdate' recibido en DashboardClient. Recargando datos..."
      );
      if (user.id) {
        // Asegurarse de que el ID del usuario está disponible
        cargarDatos(user.id);
      }
    };

    // Escuchar cambios en localStorage (ej. cuando se añaden/quitan servicios desde otra ventana/tab)
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
  }, [cargarDatos]); // `cargarDatos` es una dependencia porque `useEffect` la usa

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
                  <p>
                    <strong>👤 Nombre:</strong> {usuario.nombre}
                  </p>
                  <p>
                    <strong>📧 Correo:</strong> {usuario.correo}
                  </p>

                  <h4 className="subtitulo mt-4 mb-3">Mis Reservas</h4>
                  {reservasDelUsuario.length === 0 ? (
                    <p className="text-muted text-center">
                      No tienes reservas activas.
                    </p>
                  ) : (
                    reservasDelUsuario.map((res, index) => (
                      <div
                        key={res.id || `reserva-${index}`}
                        className="mb-4 p-3 border rounded"
                      >
                        <p>
                          <strong>📅 Fechas:</strong> {res.fechaIngreso} →{" "}
                          {res.fechaSalida}
                        </p>
                        <p>
                          <strong>📊 Estado:</strong>{" "}
                          <span
                            className={`fw-bold ${
                              res.estado === "Confirmada"
                                ? "text-success"
                                : res.estado === "Pendiente"
                                ? "text-warning"
                                : "text-danger" // Para Cancelada, aunque las filtramos
                            }`}
                          >
                            {res.estado}
                          </span>
                        </p>

                        {res.detalleHabitacion ? (
                          <>
                            <h6 className="subtitulo mt-3 mb-2">
                              Detalle de la Habitación
                            </h6>
                            <p>
                              <strong>🔢 Número:</strong>{" "}
                              {res.detalleHabitacion.numero}
                            </p>
                            <p>
                              <strong>🛏️ Tipo:</strong>{" "}
                              {res.detalleHabitacion.tipo}
                            </p>
                            <p>
                              <strong>💰 Precio:</strong> S/{" "}
                              {res.detalleHabitacion.precio.toFixed(2)}
                            </p>
                          </>
                        ) : (
                          <p className="text-muted">
                            Detalles de la habitación no disponibles.
                          </p>
                        )}
                      </div>
                    ))
                  )}

                  <h4 className="subtitulo mt-4 mb-3">
                    Servicios Adicionales (Generales del Usuario)
                  </h4>
                  {serviciosAdicionales.length === 0 ? (
                    <p className="text-muted">
                      No se agregaron servicios generales.
                    </p>
                  ) : (
                    <ul className="list-group mb-3 rounded-3 overflow-hidden">
                      {serviciosAdicionales.map((s) => (
                        <li
                          key={s.id}
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          {s.nombre}
                          <span className="badge bg-warning text-dark">
                            S/ {s.precio.toFixed(2)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="text-end mt-4">
                    <h5 className="fw-bold total-final">
                      Total General de Reservas Activas y Servicios:{" "}
                      <span className="text-success">
                        S/ {totalGeneral.toFixed(2)}
                      </span>
                    </h5>
                  </div>
                </>
              ) : (
                <p className="text-muted text-center">
                  Inicia sesión para ver tu resumen.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardClient;
