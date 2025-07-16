import  Navbar  from "../components/Navbar";
import { Outlet } from "react-router-dom";
import Footer from "../components/Footer";
import VentanasFlotantes from "../components/VentanasFlotantes";
import { useVentanas } from "../components/VentanaContext";
import { useAuth } from "./AuthContext";
import { useEffect } from "react";
import ReservasClient from "../pages/Client/ReservasClient";
import ServiciosClient from "../pages/Client/ServiciosClient";
import Contacto from "../pages/Client/Contacto";
import VentanasSimples from "../components/VentanasSimples";


const Layout = () => {
    const { abrirVentana, cerrarTodasLasVentanas } = useVentanas();
  const { usuario } = useAuth();

   useEffect(() => {
    if (usuario) {
      abrirVentana(
        "reservas",
        "Mis Reservas",
        <ReservasClient modoFlotante={true} />,
        "completa"
      );
      abrirVentana(
        "servicios",
        "Mis servicio",
        <ServiciosClient modoFlotante={true} />,
        "completa"
      );
      abrirVentana(
        "Contactar",
        "Contactanos",
        <Contacto modoFlotante={true} />,
        "completa"
      );
    } else {
      cerrarTodasLasVentanas();
      abrirVentana(
        "Contactar",
        "Contactanos",
        <Contacto modoFlotante={true} />,
        
      ); // 👈 cerrar ventanas si no hay usuario
    }
  }, [usuario]);
    return(
        <>
        <Navbar />
        <Outlet />
        <VentanasFlotantes />
        <VentanasSimples />
        <Footer />
        </>
    );
};
export default Layout;