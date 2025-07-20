import { useEffect, useState } from "react";
import { Opinion } from "../types/Opinion";
import { Usuario } from "../types/Usuario";
import { useAuth } from "../context/AuthContext";
import "../css/Opinion.css"; // ⬅️ Estilos
import axios from "axios";

const Opiniones = () => {
  const [db, setDb] = useState<any>(null);
  const [opiniones, setOpiniones] = useState<Opinion[]>([]);
  const [comentario, setComentario] = useState("");
  const [calificacion, setCalificacion] = useState(5);
  const { usuario } = useAuth();

  useEffect(() => {
  axios.get("http://localhost:3001/opiniones")
    .then((res) => {
      setOpiniones(res.data);
    })
    .catch((error) => {
      console.error("Error al cargar opiniones:", error);
    });
}, []);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!usuario) return;

  const nuevaOpinion: Opinion = {
    id: Date.now(),
    usuarioId: usuario.id,
    comentario,
    calificacion,
  };

  try {
    await axios.post("http://localhost:3001/opiniones", nuevaOpinion);
    setOpiniones((prev) => [...prev, nuevaOpinion]);
    setComentario("");
    setCalificacion(5);
  } catch (error) {
    console.error("Error al enviar opinión:", error);
  }
};

  return (
    <div className="min-vh-100 bg-light p-4">
      <div className="container">
        <h2 className="text-center mb-4 titulo-sec">
          Opiniones de Huéspedes
        </h2>

        {/* Mostrar opiniones (sin scroll) */}
        <div className="row row-cols-1 row-cols-md-2 g-4 mb-5">
          {opiniones.map((op) => (
            <div key={op.id} className="col">
              <div className="card opinion-card sombra-suave borde-dorado">
                <div className="card-body">
                  <h5 className="card-title mb-2 text-warning">
                    {"⭐".repeat(op.calificacion)}{" "}
                    <span className="small text-muted">
                      ({op.calificacion}/5)
                    </span>
                  </h5>
                  <p className="card-text">{op.comentario}</p>
                  <p className="card-text small text-muted fst-italic">
                    {db?.usuarios.find((u: any) => u.id === op.usuarioId)
                      ?.nombre || "Anónimo"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Formulario elegante para agregar opinión */}
        {usuario && (
          <div className="formulario-opinion sombra-suave borde-dorado bg-white p-4 rounded-3">
            <h4 className="subtitulo-seccion text-dark mb-3">
              📝 Agrega tu Opinión
            </h4>
            <form onSubmit={handleSubmit} className="row g-3 small">
              <div className="col-12">
                <label className="form-label texto-dorado fw-semibold">
                  ✍️ Comentario
                </label>
                <textarea
                  className="form-control"
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  required
                  placeholder="Escribe tu experiencia..."
                  rows={3}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label texto-dorado fw-semibold">
                  ⭐ Calificación (1-5)
                </label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  className="form-control"
                  value={calificacion}
                  onChange={(e) => setCalificacion(Number(e.target.value))}
                  title="Calificaciòn"
                  required
                />
              </div>
              <div className="col-md-8 d-flex align-items-end">
                <button
                  type="submit"
                  className="btn btn-enviar w-100 rounded-pill fw-semibold"
                >
                  <i className="bi bi-send-fill me-1"></i> Enviar Opinión
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Opiniones;
