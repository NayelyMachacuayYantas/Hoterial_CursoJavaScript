import { useEffect, useState } from "react";
import { Reserva } from "../../types/Reserva";
import { Habitacion } from "../../types/Habitacion";
import { Usuario } from "../../types/Usuario";
import { useLocation } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useVentanas } from "../../components/VentanaContext";
import "../../css/Reservas.css";
import { reservaFormService } from "../../services/reservaFormService";

type Props = {
  modoFlotante?: boolean;
  habitacionPreseleccionada?: number;
};

const FormularioReserva = ({
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

  useEffect(() => {
    const user = localStorage.getItem("usuario");

    if (user) {
      const userData = JSON.parse(user);
      setUsuario(userData);

      if (habitacionPreseleccionada) {
        setForm((prev) => ({
          ...prev,
          habitacionId: habitacionPreseleccionada,
        }));
      }

      if (habitacionIdURL && !modoFlotante) {
        setForm((prev) => ({
          ...prev,
          habitacionId: parseInt(habitacionIdURL),
        }));
      }

      // Usar el servicio para obtener habitaciones disponibles
      reservaFormService
        .getAvailableHabitaciones()
        .then((data) => {
          setHabitaciones(data);
        })
        .catch((error) => {
          console.error("Error al obtener habitaciones:", error);
        });

      // Usar el servicio para obtener reservas del usuario
      reservaFormService
        .getReservasByUserId(userData.id)
        .then((data) => {
          setReservas(data);
        })
        .catch((error) => {
          console.error("Error al obtener reservas del usuario:", error);
        });
    }
  }, [
    habitacionPreseleccionada,
    habitacionIdURL,
    modoFlotante,
    location.search,
  ]);

  useEffect(() => {
    if (modoFlotante && habitacionPreseleccionada) {
      setForm((prev) => ({
        ...prev,
        habitacionId: habitacionPreseleccionada,
      }));
    }
  }, [habitacionPreseleccionada, modoFlotante]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario) return;

    const fechaIn = new Date(form.fechaIngreso);
    const fechaOut = new Date(form.fechaSalida);
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

    setErrorFecha("");

    try {
      if (editandoId) {
        const updated: Reserva = {
          ...form,
          usuarioId: usuario.id,
          id: editandoId,
        };
        const result = await reservaFormService.updateReserva(
          editandoId,
          updated
        );
        setReservas((prev) =>
          prev.map((r) => (r.id === editandoId ? result : r))
        );
        alert("Reserva actualizada correctamente.");
      } else {
        const ultimoId =
          reservas.length > 0 ? Math.max(...reservas.map((r) => r.id)) : 0;

        const nueva: Reserva = {
          ...form,
          usuarioId: usuario.id,
          id: ultimoId + 1, // Asignamos el ID aquí antes de enviarlo
        };
        const result = await reservaFormService.createReserva(nueva);
        setReservas((prev) => [...prev, result]);
        alert("Reserva creada correctamente.");

        if (modoFlotante) {
          // Disparamos un evento global para que ListaReserva se actualice
          window.dispatchEvent(new CustomEvent("dashboardUpdate"));
          cerrarVentana("reservas");
        }
      }

      // Reiniciar el formulario
      setForm({
        habitacionId: 0,
        fechaIngreso: "",
        fechaSalida: "",
        estado: "Pendiente",
      });
      setEditandoId(null);
      // Disparamos un evento global para que ListaReserva se actualice (si no estamos en modo flotante o si lo estamos y no se cerró la ventana)
      if (!modoFlotante || (modoFlotante && !cerrarVentana)) {
        // Simplificado para asegurar el dispatch si no se cierra
        window.dispatchEvent(new CustomEvent("dashboardUpdate"));
      }
    } catch (error) {
      console.error("Error al procesar la reserva:", error);
      alert("Hubo un error al procesar la reserva.");
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

  const hoy = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  return (
    <div className="p-3" style={{ width: "100%", height: "100%" }}>
      <div className="h-100 d-flex flex-column overflow-hidden">
        <h5 className="text-center mb-3 titulo-seccion">
          🛏️ Reserva tu habitación
        </h5>

        <form
          onSubmit={handleSubmit}
          className="small bg-white rounded sombra-suave borde-dorado p-3 formulario-reserva"
        >
          <div className="mb-2">
            <label
              htmlFor="habitacionId"
              className="form-label texto-dorado fw-semibold"
            >
              Habitación
            </label>
            <select
              id="habitacionId"
              name="habitacionId"
              className="form-select form-select-sm"
              value={form.habitacionId.toString()}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona una habitación</option>
              {habitaciones.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.numero} - {h.tipo}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-2">
            <label className="form-label texto-dorado fw-semibold">
              Fecha de ingreso
            </label>
            <input
              type="date"
              name="fechaIngreso"
              className="form-control form-control-sm"
              value={form.fechaIngreso}
              onChange={handleChange}
              min={hoy}
              required
              title="Selecciona la fecha de entrada"
            />
          </div>

          <div className="mb-3">
            <label className="form-label texto-dorado fw-semibold">
              Fecha de salida
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

          {errorFecha && (
            <div className="alert alert-danger py-1 px-2 small mb-3">
              {errorFecha}
            </div>
          )}

          <div className="d-grid">
            <button
              type="submit"
              className="btn btn-enviar rounded-pill fw-semibold"
            >
              <i className="bi bi-check2-circle me-1"></i>
              {editandoId ? "Actualizar reserva" : "Reservar habitación"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioReserva;
