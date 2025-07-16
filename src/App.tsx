import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Home from "./pages/Home";
import HabitacionesClient from "./pages/Client/HabitacionesClient";
import ReservasClient from "./pages/Client/ReservasClient";
import Contacto from "./pages/Client/Contacto";
import ServiciosClient from "./pages/Client/ServiciosClient";
import Opiniones from "./pages/Opiniones";
import Login from "./pages/Login";
import DashboardClient from "./pages/Client/DashboardClient";
import { useEffect } from "react";
import Layout from "./context/Layout";
import ListaReserva from "./pages/Client/ListaReserva";
import VentanasFlotantes from "./components/VentanasFlotantes";
import VentanasSimples from "./components/VentanasSimples";
//para carjar el json server
//npx json-server --watch db.json --port 3001



const router = createBrowserRouter ([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/login", element: <Login /> },
      { path: "/habitacionescliente", element: <HabitacionesClient />},
      { path: "/reservascliente", element: <ListaReserva /> },
      { path: "/contacto", element: <Contacto /> },
      { path: "/servicioscliente", element: <ServiciosClient /> },
      { path: "/opiniones", element: <Opiniones /> },
      { path: "/dashboardcliente", element: <DashboardClient /> },
    ],
  },
]);

function App() {
  useEffect(() => {
    const db = localStorage.getItem("db");
    if (!db) {
      fetch("/db.json")
        .then((res) => res.json())
        .then((data) => {
          localStorage.setItem("db", JSON.stringify(data));
          window.location.reload(); // recarga la app para aplicar datos
        })
        .catch((err) => console.error("Error cargando db.json", err));
    }
  }, []);
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
