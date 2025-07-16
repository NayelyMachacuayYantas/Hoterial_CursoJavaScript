import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Usuario } from "../types/Usuario";
import { useAuth } from "../context/AuthContext";
import "../css/Login.css"; // ⬅️ Estilos

//INSTALAR EL SERVIDOR : npm install -g json-server
//CORRER EL JSON
//json-server --watch db.json --port 3001
const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // 💡 USAMOS CONTEXTO

  const [form, setForm] = useState({ nombre: "", correo: "", password: "" });
  const [esNuevo, setEsNuevo] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const usuario = localStorage.getItem("usuario");
    if (usuario) navigate("/dashboardcliente");
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.get<Usuario[]>("http://localhost:3001/usuarios");
      const usuarios = res.data;

      if (esNuevo) {
        const existe = usuarios.find(
          (u) => u.nombre === form.nombre || u.correo === form.correo
        );
        if (existe) {
          setError("El nombre de usuario o correo ya está en uso.");
          return;
        }

        const nuevoUsuario: Usuario = {
          id: Date.now(),
          nombre: form.nombre,
          correo: form.correo,
          contrasena: form.password,
          rol: "cliente",
        };

        await axios.post("http://localhost:3001/usuarios", nuevoUsuario);
        login(nuevoUsuario); // 💡 en vez de localStorage directamente
        navigate("/dashboardcliente");
      } else {
        const encontrado = usuarios.find(
          (u) => u.correo === form.correo && u.contrasena === form.password
        );
        if (encontrado) {
          login(encontrado); // 💡 aquí también
          navigate("/dashboardcliente");
        } else {
          setError("Usuario o contraseña incorrectos.");
        }
      }
    } catch (err) {
      setError("Ocurrió un problema al conectar con el servidor.");
      console.error(err);
    }
  };

  // JSX igual...
  return (
    <div className="vh-100 vw-100 d-flex justify-content-center align-items-center fondo-login">
      <div
        className="contenedor-formulario"
        style={{ maxWidth: 400, width: "100%" }}
      >
        <div className="text-center mb-3">
          <i className="bi bi-door-open-fill display-6 texto-dorado"></i>
          <h4 className="titulo-seccion mt-2">Bienvenido al Hotel Relaxy</h4>
        </div>

        <h6 className="text-center subtitulo-seccion mb-3">
          {esNuevo ? "Crear Cuenta" : "Iniciar Sesión"}
        </h6>

        {error && <div className="alert alert-danger small">{error}</div>}

        <form onSubmit={handleSubmit} className="small">
          <div className="mb-3">
            <label className="form-label texto-dorado">Correo Usuario</label>
            <input
              type="email"
              name="correo"
              className="form-control"
              value={form.correo}
              onChange={handleChange}
              required
              placeholder="ejemplo@correo.com"
            />
          </div>

          {esNuevo && (
            <div className="mb-3">
              <label className="form-label texto-dorado">
                Nombre y Apellido
              </label>
              <input
                type="text"
                name="nombre"
                className="form-control"
                value={form.nombre}
                onChange={handleChange}
                required
                placeholder="Ej. Luis Lopez"
              />
            </div>
          )}

          <div className="mb-3">
            <label className="form-label texto-dorado">Contraseña</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="********"
            />
          </div>

          <div className="d-grid mb-3">
            <button className="btn btn-login rounded-pill">
              {esNuevo ? "Crear Cuenta" : "Iniciar Sesión"}
            </button>
          </div>

          <div className="text-center">
            <small className="text-muted">
              {esNuevo ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}{" "}
              <button
                type="button"
                className="btn btn-link p-0"
                onClick={() => {
                  setEsNuevo(!esNuevo);
                  setError("");
                }}
              >
                {esNuevo ? "Inicia sesión" : "Crea una cuenta"}
              </button>
            </small>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
