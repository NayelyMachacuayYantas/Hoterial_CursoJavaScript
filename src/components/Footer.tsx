import "../css/Footer.css";
const Footer = () => (
  <footer className="footer-elegante text-center">
    <div className="container">
      <h3 className="footer-titulo">Hotel Relaxy</h3>
      <hr className="footer-linea" />
      <p className="footer-copy">
        © 2025 Hotel Relaxy. Todos los derechos reservados.
      </p>
      <div className="footer-iconos mt-4">
        <a href="#" className="icono-footer facebook">
          <i className="bi bi-facebook"></i>
        </a>
        <a href="#" className="icono-footer instagram">
          <i className="bi bi-instagram"></i>
        </a>
        <a href="#" className="icono-footer twitter">
          <i className="bi bi-twitter-x"></i>
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;
