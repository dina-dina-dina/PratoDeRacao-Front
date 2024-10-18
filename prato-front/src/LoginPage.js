// src/LoginPage.js
import React, { useState } from "react";
import "./login.css";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "./config";

const LoginPage = () => {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // Adicionado
  const [nome, setNome] = useState(""); // Novo estado para nome
  const [telefone, setTelefone] = useState(""); // Novo estado para telefone
  const [error, setError] = useState(""); // Novo estado para mensagens de erro

  const handleLogin = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('userEmail', email);
        navigate('/home');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erro no login');
      }
    } catch (error) {
      setError('Erro ao tentar fazer login.');
      console.error('Login error:', error);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, nome, telefone }), // Enviando nome e telefone
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        setIsRegister(false); // Volta para a tela de login após registro bem-sucedido
        setEmail("");
        setPassword(""); // Limpar campos após registro
        setNome("");
        setTelefone("");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Erro no registro.");
      }
    } catch (error) {
      console.error("Erro ao registrar:", error);
      setError("Erro ao tentar registrar. Por favor, tente novamente mais tarde.");
    }
  };

  return (
    <div className="login-page">
      <div className="logo-container">
        <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="Pet Tech Logo" />
      </div>
      <div className="login-container">
        {error && <p className="error-message">{error}</p>}
        {isRegister ? (
          <>
            <h2>Primeiro Acesso</h2>
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label htmlFor="nome">Nome:</label>
                <input
                  type="text"
                  id="nome"
                  placeholder="Digite seu nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="telefone">Telefone:</label>
                <input
                  type="tel"
                  id="telefone"
                  placeholder="Digite seu telefone"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input
                  type="email"
                  id="email"
                  placeholder="Digite seu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Senha:</label>
                <input
                  type="password"
                  id="password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit">Cadastrar</button>
            </form>
            <button onClick={() => setIsRegister(false)}>
              Voltar ao Login
            </button>
          </>
        ) : (
          <>
            <h2>Login</h2>
            <div className="form-group">
              <label htmlFor="username">Usuário:</label>
              <input
                type="text"
                id="username"
                placeholder="Digite seu usuário"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required // Adicionado para garantir que o campo seja preenchido
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Senha:</label>
              <input
                type="password"
                id="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button onClick={handleLogin}>Entrar</button>
            <button onClick={() => setIsRegister(true)}>Primeiro Acesso</button>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
