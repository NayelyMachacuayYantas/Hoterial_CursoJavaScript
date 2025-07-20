import { useEffect, useState, useCallback } from "react";
import { Reserva } from "../../types/Reserva";
import { Habitacion } from "../../types/Habitacion";
import { Usuario } from "../../types/Usuario";
import { useLocation } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useVentanas } from "../../components/VentanaContext";
import "../../css/Reservas.css";
import { reservasClientService } from "../../services/reservasClientService";

type Props = {
  modoFlotante?: boolean;
  habitacionPreseleccionada?: number;
};

const ReservasClient = ({
  modoFlotante = false,
  habitacionPreseleccionada,
}: Props) => {
  const { cerrarVentana } = useVentanas();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);
  const [errorFecha, setErrorFecha] = useState("");
  const [form, setForm] = useState<Omit<Reserva, "id" | "usuarioId">>({
    habitacionId: habitacionPreseleccionada || 0,
    fechaIngreso: "",
    fechaSalida: "",
    estado: "Pendiente",
  });
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const location = useLocation();
  const habitacionIdURL = new URLSearchParams(location.search).get(
    "habitacionId"
  );

  // Función para cargar habitaciones disponibles (optimizada con useCallback)
  const cargarHabitaciones = useCallback(async () => {
    try {
      const data = await reservasClientService.getAvailableHabitaciones();
      setHabitaciones(data);
    } catch (error) {
      console.error("Error al cargar habitaciones:", error);
    }
  }, []);

  // Función para cargar las reservas del usuario actual (optimizada con useCallback)
  const cargarReservas = useCallback(async (userId: number) => {
    try {
      const data = await reservasClientService.getReservasByUserId(userId);
      setReservas(data);
    } catch (error) {
      console.error("Error al cargar reservas:", error);
    }
  }, []);

  useEffect(() => {
    const userRaw = localStorage.getItem("usuario");

    if (userRaw) {
      const userData = JSON.parse(userRaw);
      setUsuario(userData);

      // Cargar habitaciones y reservas del usuario al montar el componente
      cargarHabitaciones();
      cargarReservas(userData.id);

      // Si llega habitacionPreseleccionada (desde prop), actualizar form
      if (habitacionPreseleccionada) {
        setForm((prev) => ({
          ...prev,
          habitacionId: habitacionPreseleccionada,
        }));
      }

      // Si llega desde URL (solo si no es flotante)
      if (habitacionIdURL && !modoFlotante) {
        setForm((prev) => ({
          ...prev,
          habitacionId: parseInt(habitacionIdURL),
        }));
      }

      // Nuevo: Listener para el evento 'dashboardUpdate'
      const handleDashboardUpdate = () => {
        console.log(
          "Evento 'dashboardUpdate' recibido en ReservasClient. Recargando datos..."
        );
        if (userData.id) {
          
          cargarHabitaciones(); // Posiblemente una habitación cambió de estado
          cargarReservas(userData.id);
        }
      };

      window.addEventListener("dashboardUpdate", handleDashboardUpdate);

      // Función de limpieza para remover el listener al desmontar el componente
      return () => {
        window.removeEventListener("dashboardUpdate", handleDashboardUpdate);
      };
    }
  }, [
    habitacionPreseleccionada,
    habitacionIdURL,
    modoFlotante,
    location.search,
    cargarHabitaciones,
    cargarReservas,
  ]);

  // Este efecto adicional se asegura de que cuando cambia la prop habitacionPreseleccionada, actualice el form
  useEffect(() => {
    if (
      modoFlotante &&
      habitacionPreseleccionada &&
      form.habitacionId !== habitacionPreseleccionada
    ) {
      setForm((prev) => ({
        ...prev,
        habitacionId: habitacionPreseleccionada,
      }));
    }
  }, [habitacionPreseleccionada, modoFlotante, form.habitacionId]);

  const eliminar = async (id: number) => {
    if (!confirm("¿Estás segura de eliminar esta reserva?")) return;

    try {
      await reservasClientService.deleteReserva(id); // Usar el servicio
      alert("Reserva eliminada correctamente.");
      // Actualiza el estado local y dispara el evento para el dashboard
      if (usuario) {
        cargarReservas(usuario.id);
        cargarHabitaciones();
      }
      window.dispatchEvent(new CustomEvent("dashboardUpdate"));
    } catch (error) {
      console.error("Error al eliminar reserva:", error);
      alert("Hubo un error al intentar eliminar la reserva.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario) return;

    const fechaIn = new Date(form.fechaIngreso + "T00:00:00");
    const fechaOut = new Date(form.fechaSalida + "T00:00:00");
    const hoyDate = new Date();
    hoyDate.setHours(0, 0, 0, 0);

    if (fechaIn < hoyDate) {
      setErrorFecha("La fecha de ingreso no puede ser anterior a hoy.");
      return;
    }

    if (fechaOut <= fechaIn) {
      setErrorFecha("La fecha de salida debe ser posterior a la de ingreso.");
      return;
    }

    // Validación para asegurar que se selecciona una habitación
    if (form.habitacionId === 0) {
      setErrorFecha("Por favor, selecciona una habitación.");
      return;
    }

    setErrorFecha("");

    try {
      if (editandoId) {
        const updated: Reserva = {
          ...form,
          usuarioId: usuario.id,
          id: editandoId,
        };
        await reservasClientService.updateReserva(editandoId, updated); // Usar el servicio
        alert("Reserva actualizada correctamente.");
      } else {
        const nueva: Omit<Reserva, "id"> = {
          // `Omit` porque el ID se genera en el backend
          ...form,
          usuarioId: usuario.id,
        };
        await reservasClientService.createReserva(nueva); // Usar el servicio
        alert("Reserva creada correctamente.");

        if (modoFlotante) {
          cerrarVentana("reservas"); // Si está en modo flotante y se creó, cierra la ventana
        }
      }

      // Después de cada operación (crear/actualizar), recargar los datos
      if (usuario) {
        cargarReservas(usuario.id);
        cargarHabitaciones();
      }
      // Disparar evento para actualizar el dashboard y *otros* componentes que escuchen
      window.dispatchEvent(new CustomEvent("dashboardUpdate"));

      // Limpiar formulario y estado de edición
      setForm({
        habitacionId: 0,
        fechaIngreso: "",
        fechaSalida: "",
        estado: "Pendiente",
      });
      setEditandoId(null);
    } catch (error) {
      console.error("Error al procesar la reserva:", error);
      alert(
        "Hubo un error al guardar/actualizar la reserva. Revisa la consola."
      );
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "habitacionId" ? parseInt(value) : value,
    }));
  };

  const editar = (reserva: Reserva) => {
    setForm({
      habitacionId: reserva.habitacionId,
      fechaIngreso: reserva.fechaIngreso,
      fechaSalida: reserva.fechaSalida,
      estado: reserva.estado,
    });
    setEditandoId(reserva.id);
  };

  const cancelar = async (id: number) => {
    const reserva = reservas.find((r) => r.id === id);
    if (!reserva) return;

    if (!confirm("¿Estás segura de que quieres cancelar esta reserva?")) {
      return;
    }

    const actualizada: Reserva = {
      ...reserva,
      estado: "Cancelada",
    };

    try {
      await reservasClientService.updateReserva(id, actualizada); // Usar el servicio
      alert("Reserva cancelada correctamente.");
      // Actualiza el estado local y dispara el evento para el dashboard
      if (usuario) {
        cargarReservas(usuario.id);
        cargarHabitaciones();
      }
      window.dispatchEvent(new CustomEvent("dashboardUpdate"));
    } catch (error) {
      console.error("Error al cancelar la reserva:", error);
      alert("Hubo un error al cancelar la reserva.");
    }
  };

  const hoy = new Date().toISOString().split("T")[0];
  return (
    <div className="p-2" style={{ width: "100%", height: "100%" }}>
      <div className="h-100 d-flex flex-column overflow-hidden">
        {/* Título */}
        <h6 className="fw-bold titulo-seccion text-center mb-3 texto-dorado">
          <i className="bi bi-calendar2-week me-1"></i>Mis Reservas
        </h6>

        {/* Formulario */}
        <div className="bg-white p-3 rounded sombra-suave borde-dorado mb-2 small">
          <form onSubmit={handleSubmit}>
            <label
              htmlFor="habitacionId"
              className="form-label small mb-1 fw-semibold texto-dorado"
            >
              Habitación
            </label>
            <select
              id="habitacionId"
              name="habitacionId"
              className="form-select form-select-sm mb-2"
              value={form.habitacionId.toString()}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona</option>
              {habitaciones.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.numero} - {h.tipo}
                </option>
              ))}
            </select>

            <div className="d-flex gap-2 mb-2">
              <div className="flex-fill">
                <label className="form-label small mb-1 texto-dorado">
                  Ingreso
                </label>
                <input
                  type="date"
                  name="fechaIngreso"
                  className="form-control form-control-sm"
                  value={form.fechaIngreso}
                  onChange={handleChange}
                  min={hoy}
                  required
                  title="Selecciona la fecha de ingreso"
                />
              </div>
              <div className="flex-fill">
                <label className="form-label small mb-1 texto-dorado">
                  Salida
                </label>
                <input
                  type="date"
                  name="fechaSalida"
                  className="form-control form-control-sm"
                  value={form.fechaSalida}
                  onChange={handleChange}
                  min={form.fechaIngreso || hoy}
                  required
                  title="Selecciona la fecha de salida"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-success btn-sm w-100 rounded-pill fw-semibold"
            >
              {editandoId ? "Actualizar" : "Reservar"}
            </button>

            {errorFecha && (
              <div className="alert alert-danger mt-2 py-1 px-2 small">
                {errorFecha}
              </div>
            )}
          </form>
        </div>

        {/* Lista de reservas */}
        <div className="reservas-scrollable">
          {reservas.length === 0 && (
            <p className="text-muted small text-center">
              No tienes reservas aún.
            </p>
          )}

          {reservas.map((r) => {
            const hab = habitaciones.find((h) => h.id === r.habitacionId);
            return (
              <div
                key={r.id}
                className="card sombra-suave mb-2 p-2 borde-dorado small"
              >
                <strong className="texto-dorado">Reserva #{r.id}</strong>
                <div>Hab: {hab?.numero || r.habitacionId}</div>
                <div>
                  {r.fechaIngreso} → {r.fechaSalida}
                </div>
                <div
                  className={`fw-bold mt-1 ${
                    r.estado === "Confirmada"
                      ? "text-success"
                      : r.estado === "Cancelada"
                      ? "text-danger"
                      : "text-warning"
                  }`}
                >
                  {r.estado}
                </div>
                {r.estado !== "Cancelada" && (
                  <div className="d-flex gap-1 mt-2">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => editar(r)}
                      title="Editar reserva"
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => cancelar(r.id)}
                      title="Cancelar reserva"
                    >
                      <i className="bi bi-x-circle"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => eliminar(r.id)}
                      title="Eliminar reserva"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ReservasClient;
