import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap-icons/font/bootstrap-icons.css';
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from './context/AuthContext'
import { VentanaProvider } from "./components/VentanaContext";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <VentanaProvider>
        <App />
      </VentanaProvider>
      
    </AuthProvider>
  </React.StrictMode>
)