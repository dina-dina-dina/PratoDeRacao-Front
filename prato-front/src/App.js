// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./LoginPage";
import HomePage from "./HomePage";
import ConfirmEmail from "./ConfirmEmail"; // Importe o componente

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/confirmar-email" element={<ConfirmEmail />} /> {/* Adicione a rota */}
        <Route path="*" element={<LoginPage />} /> {/* Redireciona qualquer rota desconhecida para Login */}
      </Routes>
    </Router>
  );
};

export default App;
