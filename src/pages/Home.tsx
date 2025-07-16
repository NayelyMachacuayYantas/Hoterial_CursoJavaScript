import { useNavigate } from "react-router-dom";
import "../css/Home.css"; // ⬅️ Estilos

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-elegante">
      {/* Encabezado con fondo sutil y elegante */}
      <header className="hero-header elegante">
        <div className="overlay">
          <div className="text-center text-white hero-content">
            <h1 className="titulo-principal">Bienvenida a Hotel Relaxy</h1>
            <p className="lead subtitulo">
              Donde el descanso se convierte en arte. Elegancia, calma y
              confort.
            </p>
            <button
              onClick={() => navigate("/habitacionescliente")}
              className="btn-reserva suave"
            >
              Ver Habitaciones
            </button>
          </div>
        </div>
      </header>

      {/* Sección Nosotros */}
      <section className="seccion clara">
        <div className="container text-center">
          <h2 className="titulo-seccion">¿Quiénes somos?</h2>
          <p className="texto">
            En <strong>Relaxy</strong> te ofrecemos un escape del ritmo diario,
            con servicios que acarician tus sentidos.
          </p>
          <div className="galeria">
            {[
              { img: "/img/servicios.jpg", texto: "Spa & Bienestar" },
              { img: "/img/habitacion.jpg", texto: "Habitaciones con encanto" },
              { img: "/img/desayuno.jpg", texto: "Desayunos en la terraza" },
            ].map((item, i) => (
              <div className="tarjeta-flip" key={i}>
                <div className="contenido-flip">
                  <div className="frontal">
                    <img src={item.img} alt={item.texto} />
                  </div>
                  <div className="trasera">
                    <p>{item.texto}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Misión y Visión */}
      <section className="seccion suave">
        <div className="container row text-center mx-auto">
          <div className="col-md-6 mb-4">
            <div className="tarjeta-vision fondo-claro sombra">
              <h4 className="titulo-tarjeta">Nuestra Misión</h4>
              <p>
                Crear momentos memorables y reconfortantes para cada huésped con
                dedicación y estilo.
              </p>
            </div>
          </div>
          <div className="col-md-6 mb-4">
            <div className="tarjeta-vision fondo-claro sombra">
              <h4 className="titulo-tarjeta">Nuestra Visión</h4>
              <p>
                Ser el rincón favorito de quienes buscan calidad, detalle y
                bienestar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trayectoria */}
      <section className="seccion clara historia-section">
  <div className="container d-flex flex-column flex-md-row align-items-center gap-4">
    {/* Columna de texto */}
    <div className="flex-grow-1">
      <h2 className="titulo-seccion">Nuestra Historia</h2>
      <p className="texto">
        Desde 2008, recibimos a quienes buscan descanso auténtico.
        Más que un hotel, somos un refugio. Creamos experiencias únicas
        pensadas para tu bienestar, donde cada detalle está cuidado con cariño.
      </p>
    </div>

    {/* Columna de imagen */}
    <div className="flex-grow-1 text-center">
      <img
        src="/img/equipo.jpg"
        alt="Nuestro equipo"
        className="img-fluid img-historia sombra-historia"
      />
    </div>
  </div>
</section>



    </div>
  );
};

export default Home;
