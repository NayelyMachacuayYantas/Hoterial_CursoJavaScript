import { useVentanas } from "./VentanaContext";
import { Card, Button } from "react-bootstrap";
import "../css/ventanaFlotante.css";

const VentanasSimples = () => {
  const { ventanas, cerrarVentana } = useVentanas();

  return (
    <div className="ventanas-flotantes-container">
      {ventanas
        .filter((v) => v.tipo === "simple")
        .map((v) => (
          <div key={v.id} className="ventana-contenedor">
            <Card className="ventana-flotante shadow" style={{ width: "350px", height: "500px" }}>
              <Card.Header className="header-flotante d-flex justify-content-between align-items-center">
                <span>{v.titulo}</span>
                <Button variant="danger" size="sm" onClick={() => cerrarVentana(v.id)}>
                  ✖
                </Button>
              </Card.Header>
              <Card.Body style={{ overflowY: "auto", padding: "0.8rem" }}>
                {v.contenido}
              </Card.Body>
            </Card>
          </div>
        ))}
    </div>
  );
};

export default VentanasSimples;
