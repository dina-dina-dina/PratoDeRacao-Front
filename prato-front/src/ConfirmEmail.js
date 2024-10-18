// src/ConfirmEmail.js
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API_BASE_URL from "./config";

const ConfirmEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Confirmando seu email...");
  const [error, setError] = useState(null);

  // Função para extrair o token da URL
  const getTokenFromURL = () => {
    const params = new URLSearchParams(location.search);
    return params.get("token");
  };

  useEffect(() => {
    const confirmEmail = async () => {
      const token = getTokenFromURL();
      if (!token) {
        setError("Token de confirmação ausente.");
        setMessage(null);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/confirmar-email?token=${token}`, {
          method: "GET",
        });

        const data = await response.json();

        if (response.ok) {
          setMessage(data.message || "Email confirmado com sucesso!");
          // Redirecionar para a página de login após alguns segundos
          setTimeout(() => {
            navigate("/login");
          }, 3000); // 3 segundos
        } else {
          setError(data.message || "Falha na confirmação do email.");
          setMessage(null);
        }
      } catch (err) {
        console.error("Erro ao confirmar email:", err);
        setError("Erro ao confirmar email. Por favor, tente novamente mais tarde.");
        setMessage(null);
      }
    };

    confirmEmail();
  }, [location.search, navigate]);

  return (
    <div className="confirm-email-container">
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default ConfirmEmail;
