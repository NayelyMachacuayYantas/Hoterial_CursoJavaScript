import { useState, useEffect } from "react";
import { ContactoForm } from "../../types/Contacto";
import { contactoService } from "../../services/contactoService"; // Importamos el nuevo servicio

type Props = {
  modoFlotante?: boolean;
};

const Contacto = ({ modoFlotante = false }: Props) => {
  const [formData, setFormData] = useState<ContactoForm>({
    id: Date.now(), // Genera un ID único para cada mensaje
    nombre: "",
    correo: "",
    mensaje: "",
  });

  const [db, setDb] = useState<any>(null);

  useEffect(() => {
    const fetchDB = async () => {
      const stored = localStorage.getItem("db");
      if (stored) {
        setDb(JSON.parse(stored));
      } else {
        const res = await fetch("/db.json");
        const data = await res.json();
        localStorage.setItem("db", JSON.stringify(data));
        setDb(data);
      }
    };
    fetchDB();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Evita que recargue la página al enviar el form

    try {
      // ¡Aquí llamas al servicio para enviar los datos!
      await contactoService.enviarMensaje(formData);

      alert("Mensaje enviado correctamente");

      // Limpias el formulario después del envío
      setFormData({
        id: Date.now(),
        nombre: "",
        correo: "",
        mensaje: "",
      });
    } catch (err) {
      alert(
        "Hubo un error al enviar el mensaje. Por favor, inténtalo de nuevo."
      );
      console.error("Error en el componente Contacto al enviar:", err);
    }
  };

  return (
    <div className="p-3" style={{ width: "100%", height: "100%" }}>
      <div className="h-100 d-flex flex-column overflow-hidden">
        <h5 className="text-center mb-3 titulo-seccion">📬 Contáctanos</h5>

        <form
          onSubmit={handleSubmit}
          className="small bg-white rounded sombra-suave borde-dorado p-3"
        >
          <div className="mb-2">
            <label className="form-label texto-dorado fw-semibold">
              Nombre
            </label>
            <input
              type="text"
              name="nombre"
              className="form-control form-control-sm"
              value={formData.nombre}
              onChange={handleChange}
              required
              placeholder="Tu nombre completo"
            />
          </div>

          <div className="mb-2">
            <label className="form-label texto-dorado fw-semibold">
              Correo electrónico
            </label>
            <input
              type="email"
              name="correo"
              className="form-control form-control-sm"
              value={formData.correo}
              onChange={handleChange}
              required
              placeholder="tucorreo@ejemplo.com"
            />
          </div>

          <div className="mb-3">
            <label className="form-label texto-dorado fw-semibold">
              Mensaje
            </label>
            <textarea
              name="mensaje"
              rows={3}
              className="form-control form-control-sm"
              value={formData.mensaje}
              onChange={handleChange}
              required
              placeholder="Escribe tu mensaje aquí..."
            />
          </div>

          <div className="d-grid">
            <button
              type="submit"
              className="btn btn-enviar rounded-pill fw-semibold"
            >
              <i className="bi bi-send me-1"></i>Enviar mensaje
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Contacto;
