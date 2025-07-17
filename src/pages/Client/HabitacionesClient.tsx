import { useEffect, useState, useCallback } from "react";
import { Habitacion } from "../../types/Habitacion";
import axios from "axios";
import { useVentanas } from "../../components/VentanaContext";
import "../../css/Habitacion.css";
import FormularioReserva from "./FormularioReserva";

const HabitacionesClient = () => {
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);
  const { abrirVentana } = useVentanas();

  // Función para cargar las habitaciones
  const cargarHabitaciones = useCallback(async () => {
    try {
      const res = await axios.get<Habitacion[]>("http://localhost:3001/habitaciones");

      
      const habitacionesDisponiblesVisualmente: Habitacion[] = res.data.map(hab => ({
        ...hab,
        estado: "Disponible" as Habitacion['estado'] 
      }));
      setHabitaciones(habitacionesDisponiblesVisualmente);
      console.log("Habitaciones cargadas y mostradas como Disponibles en la UI.");
    } catch (err) {
      console.error("Error al cargar habitaciones:", err);
    }
  }, []);

  useEffect(() => {
    cargarHabitaciones();

    const handleDashboardUpdate = () => {
      console.log("Evento 'dashboardUpdate' recibido en HabitacionesClient. Recargando habitaciones para UI...");
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
      <FormularioReserva modoFlotante={true} habitacionPreseleccionada={habitacionId} />,
      "simple"
    );
  };


  return (
    <div className="habitaciones-fondo py-5 px-3">
      <div className="container">
        <h5 className="text-center titulo-sec mb-5">
          Habitaciones
        </h5>
        <div className="row row-cols-1 row-cols-md-3 g-4">
          {habitaciones.map((hab) => (
            <div key={hab.id} className="col">
              <div
                className={`card tarjeta-habitacion h-100`}
              >
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