import { useEffect, useState } from "react";
import { Reserva } from "../../types/Reserva";
import { Habitacion } from "../../types/Habitacion";
import { Usuario } from "../../types/Usuario";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useVentanas } from "../../components/VentanaContext";
import "../../css/Reservas.css";

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

      axios.get("http://localhost:3001/habitaciones").then((res) => {
        setHabitaciones(
          res.data.filter((h: Habitacion) => h.estado === "Disponible")
        );
      });

      axios
        .get("http://localhost:3001/reservas?usuarioId=" + userData.id)
        .then((res) => {
          setReservas(res.data);
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

    if (editandoId) {
      const updated = {
        ...form,
        usuarioId: usuario.id,
        id: editandoId,
      };
      await axios.put(`http://localhost:3001/reservas/${editandoId}`, updated);
      setReservas((prev) =>
        prev.map((r) => (r.id === editandoId ? updated : r))
      );
    } else {
      const ultimoId =
        reservas.length > 0 ? Math.max(...reservas.map((r) => r.id)) : 0;

      const nueva = {
        ...form,
        usuarioId: usuario.id,
        id: ultimoId + 1,
      };
      await axios.post("http://localhost:3001/reservas", nueva);
      setReservas((prev) => [...prev, nueva]);

      // if (modoFlotante) cerrarVentana("reservas");
    }

    setForm({
      habitacionId: 0,
      fechaIngreso: "",
      fechaSalida: "",
      estado: "Pendiente",
    });
    setEditandoId(null);
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