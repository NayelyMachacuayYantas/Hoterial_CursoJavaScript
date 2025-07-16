import { createContext, useContext, useEffect, useState } from "react";

interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  contrasena: string;
  rol: string;
}

interface AuthContextType {
  usuario: Usuario | null;
  login: (user: Usuario) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    const guardado = localStorage.getItem("usuario");
    if (guardado) setUsuario(JSON.parse(guardado));
  }, []);

  const login = (user: Usuario) => {
    localStorage.setItem("usuario", JSON.stringify(user));
    setUsuario(user);
  };

  const logout = () => {
    localStorage.removeItem("usuario");
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
};
