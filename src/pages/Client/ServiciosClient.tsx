import { useEffect, useState, useCallback } from "react"; // Agregamos useCallback para optimización
import { Servicio } from "../../types/Servicio";
import { Usuario } from "../../types/Usuario";
import "../../css/Servicios.css";

type Props = {
  modoFlotante?: boolean;
};

const ServiciosClient = ({ modoFlotante = false }: Props) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [serviciosAgregados, setServiciosAgregados] = useState<Servicio[]>([]);

  // Función para cargar los servicios agregados del localStorage
  const cargarServiciosAgregados = useCallback((userId: number) => {
    const serviciosCliente = JSON.parse(
      localStorage.getItem(`servicios-${userId}`) || "[]"
    );
    setServiciosAgregados(serviciosCliente);
  }, []);

  useEffect(() => {
    const db = localStorage.getItem("db");
    const user = localStorage.getItem("usuario");

    if (db && user) {
      const data = JSON.parse(db);
      const userData = JSON.parse(user);
      setUsuario(userData);
      setServicios(data.servicios);

      // Cargar los servicios agregados al inicio
      cargarServiciosAgregados(userData.id);

      //  Listener para el evento 'dashboardUpdate'
      // Esto permite que el componente de servicios reaccione si el dashboard o
      // las reservas (u otros componentes) indican que algo ha cambiado y
      // necesita una recarga de datos.
      const handleDashboardUpdate = () => {
        console.log("Evento 'dashboardUpdate' recibido en ServiciosClient. Recargando servicios agregados...");
        if (userData.id) {
          cargarServiciosAgregados(userData.id);
        }
      };

      window.addEventListener("dashboardUpdate", handleDashboardUpdate);

      return () => {
        window.removeEventListener("dashboardUpdate", handleDashboardUpdate);
      };
    }
  }, [cargarServiciosAgregados]); // Dependencia de useCallback

  const agregarServicio = (servicio: Servicio) => {
    if (!usuario) {
      console.error("Usuario no autenticado para agregar servicio.");
      return;
    }
    if (!serviciosAgregados.some((s) => s.id === servicio.id)) {
      const nuevos = [...serviciosAgregados, servicio];
      setServiciosAgregados(nuevos);
      localStorage.setItem(`servicios-${usuario.id}`, JSON.stringify(nuevos));
      //  Disparar evento para actualizar el dashboard
      window.dispatchEvent(new CustomEvent("dashboardUpdate"));
      console.log(`Servicio agregado y evento 'dashboardUpdate' disparado.`);
    }
  };

  const quitarServicio = (id: number) => {
    if (!usuario) {
      console.error("Usuario no autenticado para quitar servicio.");
      return;
    }
    const nuevos = serviciosAgregados.filter((s) => s.id !== id);
    setServiciosAgregados(nuevos);
    localStorage.setItem(`servicios-${usuario.id}`, JSON.stringify(nuevos));
    //  Disparar evento para actualizar el dashboard
    window.dispatchEvent(new CustomEvent("dashboardUpdate"));
    console.log(`Servicio eliminado y evento 'dashboardUpdate' disparado.`);
  };

  const totalServicios = serviciosAgregados.reduce(
    (total, s) => total + s.precio,
    0
  );

  return (
    <div className="p-3" style={{ maxHeight: "100%", overflowY: "auto" }}>
      <h5 className="text-center mb-4 titulo-seccion">
        🛎️ Servicios Adicionales
      </h5>

      {/* Servicios Disponibles */}
      <div className="mb-4">
        <div className="bg-white p-3 rounded sombra-suave borde-dorado">
          <h6 className="mb-3 subtitulo-seccion text-primary">Disponibles</h6>
          {servicios.map((s) => (
            <div
              key={s.id}
              className="d-flex justify-content-between align-items-center border-bottom py-2"
            >
              <div>
                <strong className="texto-dorado">{s.nombre}</strong>
                <p className="m-0 text-muted small">{s.descripcion}</p>
                <span className="badge bg-warning text-dark">
                  S/ {s.precio}
                </span>
              </div>
              <button
                className="btn btn-sm btn-success rounded-pill px-3"
                onClick={() => agregarServicio(s)}
                title="Agregar servicio"
              >
                <i className="bi bi-plus-circle me-1"></i>Agregar
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Servicios Agregados */}
      <div>
        <div className="bg-white p-3 rounded sombra-suave borde-dorado">
          <h6 className="mb-3 subtitulo-seccion text-success">Mis Servicios</h6>
          {serviciosAgregados.length === 0 ? (
            <p className="text-muted small">No has agregado servicios aún.</p>
          ) : (
            <>
              {serviciosAgregados.map((s) => (
                <div
                  key={s.id}
                  className="d-flex justify-content-between align-items-center border-bottom py-2"
                >
                  <div>
                    <strong className="texto-dorado">{s.nombre}</strong>
                    <p className="m-0 text-muted small">{s.descripcion}</p>
                    <span className="badge bg-secondary">S/ {s.precio}</span>
                  </div>
                  <button
                    className="btn btn-sm btn-danger rounded-pill px-3"
                    onClick={() => quitarServicio(s.id)}
                    title="Eliminar servicio"
                  >
                    <i className="bi bi-trash me-1"></i>Eliminar
                  </button>
                </div>
              ))}

              <div className="mt-3 p-2 bg-light rounded d-flex justify-content-between align-items-center border-top pt-3">
                <h6 className="m-0">Total Servicios:</h6>
                <span className="fw-bold text-success fs-6">
                  S/ {totalServicios}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiciosClient;