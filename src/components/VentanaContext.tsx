import { createContext, useContext, useState, ReactNode } from "react";

interface Ventana {
  id: string;
  titulo: string;
  contenido: ReactNode;
  tipo?: "completa" | "simple"; // nueva propiedad
}

interface VentanaContextType {
  ventanas: Ventana[];
  abrirVentana: (
    id: string,
    titulo: string,
    contenido: ReactNode,
    tipo?: "simple" | "completa"
  ) => void;
  cerrarVentana: (id: string) => void;
  cerrarTodasLasVentanas: () => void;
}


const VentanaContext = createContext<VentanaContextType | undefined>(undefined);

export const VentanaProvider = ({ children }: { children: ReactNode }) => {
  const [ventanas, setVentanas] = useState<Ventana[]>([]);

  const abrirVentana = (
  id: string,
  titulo: string,
  contenido: React.ReactNode,
  tipo: "simple" | "completa" = "completa" // valor por defecto
) => {
  setVentanas((prev) => {
    // Si ya existe, reemplaza el contenido
    const yaExiste = prev.find((v) => v.id === id);
    if (yaExiste) {
      return prev.map((v) =>
        v.id === id ? { ...v, contenido, titulo, tipo } : v
      );
    }
    return [...prev, { id, titulo, contenido, tipo }];
  });
};


  const cerrarVentana = (id: string) => {
    setVentanas((prev) => prev.filter((v) => v.id !== id));
  };

  const cerrarTodasLasVentanas = () => {
    setVentanas([]);
  };

  return (
    <VentanaContext.Provider
      value={{ ventanas, abrirVentana, cerrarVentana, cerrarTodasLasVentanas }}
    >
      {children}
    </VentanaContext.Provider>
  );
};

export const useVentanas = () => {
  const context = useContext(VentanaContext);
  if (!context)
    throw new Error("useVentanas debe usarse dentro de VentanaProvider");
  return context;
};
