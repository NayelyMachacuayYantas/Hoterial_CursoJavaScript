import { useEffect, useState } from "react";
import { Reserva } from "../../types/Reserva";
import { Habitacion } from "../../types/Habitacion";
import { Usuario } from "../../types/Usuario";
import "bootstrap-icons/font/bootstrap-icons.css";
import { reservaService } from "../../services/reservaService";

const ListaReserva = () => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);

  const cargarDatos = async (userId: string | number) => {
    try {
      const [habitacionesData, reservasData] = await Promise.all([
        reservaService.getHabitaciones(),
        reservaService.getReservasByUserId(userId),
      ]);
      setHabitaciones(habitacionesData);
      setReservas(reservasData);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    }
  };

  useEffect(() => {
    const user = localStorage.getItem("usuario");
    if (user) {
      const userData = JSON.parse(user);
      setUsuario(userData);
      cargarDatos(userData.id);

      const handleDashboardUpdate = () => {
        console.log(
          "Evento 'dashboardUpdate' recibido en ListaReserva. Recargando datos..."
        );
        cargarDatos(userData.id);
      };
      window.addEventListener("dashboardUpdate", handleDashboardUpdate);

      return () => {
        window.removeEventListener("dashboardUpdate", handleDashboardUpdate);
      };
    }
  }, []);

  const cancelarReserva = async (id: string | number) => {
    if (!confirm("¿Estás seguro de pagar esta reserva?")) return;

    const reserva = reservas.find((r) => r.id === id);
    if (!reserva) {
      console.error("Reserva no encontrada para cancelar.");
      return;
    }

    try {
      await reservaService.cancelarReserva(id, reserva);
      alert("Reserva pagada correctamente.");
      setReservas((prev) =>
        prev.map((r) => (r.id === id ? { ...r, estado: "Cancelada" } : r))
      );
      window.dispatchEvent(new CustomEvent("dashboardUpdate"));
    } catch (error) {
      console.error("Error al cancelar la reserva:", error);
      alert("Hubo un error al cancelar la reserva.");
    }
  };

  const eliminarReserva = async (id: string | number) => {
    if (
      !confirm(
        "¿Estás seguro de que quieres eliminar esta reserva? Esta acción es irreversible."
      )
    )
      return;
    try {
      await reservaService.eliminarReserva(id);
      alert("Reserva eliminada correctamente.");
      setReservas((prev) => prev.filter((r) => r.id !== id));
      window.dispatchEvent(new CustomEvent("dashboardUpdate"));
    } catch (error) {
      console.error("Error eliminando reserva:", error);
      alert("Hubo un error al eliminar la reserva.");
    }
  };

  return (
    <div className="container py-3">
      <h5 className="text-center mb-4 text-primary">
        <i className="bi bi-calendar-week me-2"></i>Mis Reservas
      </h5>

      <div className="list-group">
        {reservas.length === 0 && (
          <p className="text-muted text-center py-3">No tienes reservas aún.</p>
        )}

        {reservas.map((res) => {
          const hab = habitaciones.find(
            (h) => h.id?.toString() === res.habitacionId?.toString()
          );
          const usuarioAsociado = usuario;

          return (
            <div
              key={res.id}
              className="list-group-item list-group-item-action d-flex flex-column flex-md-row mb-3 shadow-sm rounded-3 overflow-hidden"
            >
              {hab?.imagen && (
                <img
                  src={hab.imagen}
                  alt={`Habitación ${hab.numero || res.habitacionId}`}
                  className="img-fluid rounded-start me-md-3 mb-2 mb-md-0"
                  style={{
                    maxWidth: "150px",
                    height: "auto",
                    objectFit: "cover",
                  }}
                />
              )}

              <div className="p-3 flex-grow-1">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h6 className="mb-0 fw-bold text-dark">Reserva #{res.id}</h6>
                  <span
                    className={`badge text-uppercase py-2 px-3 rounded-pill ${
                      res.estado === "Confirmada"
                        ? "bg-success"
                        : res.estado === "Cancelada"
                        ? "bg-danger"
                        : "bg-warning text-dark"
                    }`}
                  >
                    {res.estado}
                  </span>
                </div>

                {hab ? (
                  <>
                    <p className="mb-1">
                      <strong>Habitación:</strong> {hab.numero} ({hab.tipo})
                    </p>
                    <p className="mb-1">
                      <strong>Capacidad:</strong> {hab.capacidad} personas
                    </p>
                    <p className="mb-1">
                      <strong>Precio por noche:</strong> S/.
                      {hab.precio?.toFixed(2)}
                    </p>
                  </>
                ) : (
                  <p className="mb-1 text-muted">
                    Habitación no disponible o eliminada.
                  </p>
                )}

                <p className="mb-1">
                  <strong>Check-in:</strong> {res.fechaIngreso}
                </p>
                <p className="mb-2">
                  <strong>Check-out:</strong> {res.fechaSalida}
                </p>

                {usuarioAsociado && (
                  <p className="small text-muted mb-2">
                    Reservado por: {usuarioAsociado.nombre} (
                    {usuarioAsociado.correo})
                  </p>
                )}

                {res.estado !== "Cancelada" && (
                  <div className="d-flex gap-2 mt-3 flex-wrap">
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => cancelarReserva(res.id)}
                      title="Cancelar esta reserva"
                    >
                      <i className="bi bi-x-circle me-1"></i> Cancelar
                    </button>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => eliminarReserva(res.id)}
                      title="Eliminar esta reserva permanentemente"
                    >
                      <i className="bi bi-trash me-1"></i> Eliminar
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ListaReserva;
