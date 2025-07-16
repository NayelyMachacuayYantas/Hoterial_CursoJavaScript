import { useEffect, useState } from "react";
import { useVentanas } from "../components/VentanaContext";
import "../css/ventanaFlotante.css";
import { Card, Button } from "react-bootstrap";

const VentanasFlotantes = () => {
  const { ventanas, cerrarVentana } = useVentanas();
  const [minimizadas, setMinimizadas] = useState<string[]>([]);
  
  // 🔸 Minimizar todas al montar
  useEffect(() => {
    const todosIds = ventanas.map((v) => v.id);
    setMinimizadas(todosIds);
  }, []); // ← solo una vez al cargar la página

  const toggleMinimizar = (id: string) => {
    if (minimizadas.includes(id)) {
      setMinimizadas(minimizadas.filter((m) => m !== id));
    } else {
      setMinimizadas([...minimizadas, id]);
    }
  };

  return (
    <div className="ventanas-flotantes-container">
      {ventanas
      .filter((v) => v.tipo !== "simple")
      .map((v) => (
        <div key={v.id} className="ventana-contenedor">
          {!minimizadas.includes(v.id) && (
            <Card
              className="ventana-flotante shadow"
              style={{ width: "350px", height: "500px" }}
            >
              <Card.Header className="header-flotante d-flex justify-content-between align-items-center">
                <span>{v.titulo}</span>
                <div className="opciones">
                  <Button
                    variant="light"
                    size="sm"
                    onClick={() => toggleMinimizar(v.id)}
                    className="me-1"
                  >
                    –
                  </Button>
                </div>
              </Card.Header>
              <Card.Body style={{ overflowY: "auto", padding: "0.8rem" }}>
                {v.contenido}
              </Card.Body>
            </Card>
          )}

          {/* Siempre muestra la burbuja debajo */}
          <div
            className="ventana-minimizada"
            onClick={() => toggleMinimizar(v.id)}
          >
            🗨️ {v.titulo}
          </div>
        </div>
      ))}
    </div>
  );
};

export default VentanasFlotantes;
