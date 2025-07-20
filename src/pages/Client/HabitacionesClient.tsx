import { useEffect, useState, useCallback } from "react";
import { Habitacion } from "../../types/Habitacion";
import { useVentanas } from "../../components/VentanaContext";
import "../../css/Habitacion.css";
import FormularioReserva from "./FormularioReserva";
import { habitacionService } from "../../services/habitacionService"; // Importamos el nuevo servicio

const HabitacionesClient = () => {
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);
  const { abrirVentana } = useVentanas();

  // Función para cargar las habitaciones - ¡Ahora usa el servicio!
  const cargarHabitaciones = useCallback(async () => {
    try {
      const data = await habitacionService.getHabitaciones(); // Llama al servicio
      setHabitaciones(data);
    } catch (err) {
      console.error("Error al cargar habitaciones en el componente:", err);
    }
  }, []);

  useEffect(() => {
    cargarHabitaciones();

    const handleDashboardUpdate = () => {
      console.log(
        "Evento 'dashboardUpdate' recibido en HabitacionesClient. Recargando habitaciones para UI..."
      );
      cargarHabitaciones();
    };

    window.addEventListener("dashboardUpdate", handleDashboardUpdate);

    return () => {
      window.removeEventListener("dashboardUpdate", handleDashboardUpdate);
    };
  }, [cargarHabitaciones]);

  const reservar = (habitacionId: number) => {
    abrirVentana(
      `reserva-${habitacionId}`,
      "Reserva",
      <FormularioReserva
        modoFlotante={true}
        habitacionPreseleccionada={habitacionId}
      />,
      "simple"
    );
  };
  return (
    <div className="habitaciones-fondo py-5 px-3">
      <div className="container">
        <h5 className="text-center titulo-sec mb-5">Habitaciones</h5>
        <div className="row row-cols-1 row-cols-md-3 g-4">
          {habitaciones.map((hab) => (
            <div key={hab.id} className="col">
              <div className={`card tarjeta-habitacion h-100`}>
                {hab.imagen && (
                  <img
                    src={hab.imagen}
                    alt={`Habitación ${hab.numero}`}
                    className="card-img-top imagen-habitacion"
                  />
                )}
                <div className="card-body text-center d-flex flex-column justify-content-between">
                  <h5 className="card-title nombre-habitacion">
                    Hab. {hab.numero} - {hab.tipo}
                  </h5>
                  <p className="card-text texto-secundario">
                    Capacidad: {hab.capacidad} personas
                  </p>
                  <p className="card-text texto-secundario">
                    Precio: S/ {hab.precio.toFixed(2)}
                  </p>

                  <button
                    className="btn btn-reserva mt-3"
                    onClick={() => reservar(hab.id)}
                  >
                    Reservar esta habitación
                  </button>
                </div>
              </div>
            </div>
          ))}

          {habitaciones.length === 0 && (
            <div className="text-center text-muted">
              No hay habitaciones disponibles en este momento.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HabitacionesClient;
