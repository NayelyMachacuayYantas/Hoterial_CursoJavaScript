import { Link, useNavigate } from "react-router-dom";
import { Navbar as BsNavbar, Nav, Container, Button } from "react-bootstrap";
import { useAuth } from "../context/AuthContext"; // 👈 usar el contexto
import { useVentanas } from "./VentanaContext";
import Reservascliente from "../pages/Client/ReservasClient";
import "../css/Navbar.css";
import "../css/ventanaFlotante.css";

const Navbar = () => {
  const { usuario, logout } = useAuth(); // 👈 obtener usuario y logout
  const navigate = useNavigate();
  const { abrirVentana } = useVentanas();

  const abrirReservasVentana = () => {
    abrirVentana(
      "reservas",
      "Mis Reservas",
      <Reservascliente modoFlotante={true} />
    );
  };
  const registrarse = () => {
    logout();
    navigate("/login");
  };

  return (
    <BsNavbar className="navbar-custom" expand="lg">
      <Container>
        <BsNavbar.Brand as={Link} to="/">
          Hotel Relaxy
        </BsNavbar.Brand>
        <BsNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BsNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {usuario && (
              <>
                <Nav.Link as={Link} to="/dashboardcliente">
                  Resumen
                </Nav.Link>
                <Nav.Link as={Link} to="/reservascliente">
                  Historial
                </Nav.Link>
              </>
            )}
            <Nav.Link as={Link} to="/habitacionescliente">
              Habitaciones
            </Nav.Link>
            <Nav.Link as={Link} to="/opiniones">
              Opiniones
            </Nav.Link>
            ;
          </Nav>
          {usuario ? (
            <div className="d-flex align-items-center gap-2">
              <span className="text-white small">Hola, {usuario.nombre}</span>
              <Button variant="outline-danger" size="sm" onClick={registrarse}>
                Cerrar sesión
              </Button>
            </div>
          ) : (
            <div>
              <Button variant="outline-danger" size="sm" onClick={registrarse}>
                Ingresar
              </Button>
            </div>
          )}
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
};

export default Navbar;
