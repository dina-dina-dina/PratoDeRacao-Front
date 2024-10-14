import React, { useState } from 'react';
import './login.css';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from './config';

const LoginPage = () => {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);

// frontend/src/LoginPage.js
const handleLogin = async () => {
  const email = document.getElementById("username").value; // Considerando email como username
  const password = document.getElementById("password").value;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      alert(data.message);
      localStorage.setItem('token', data.token); // Armazena o token JWT
      navigate("/home"); // Redireciona para a página principal
    } else {
      const errorData = await response.json();
      alert(errorData.message || 'Erro no login');
    }
  } catch (error) {
    alert('Erro ao tentar fazer login. Por favor, tente novamente mais tarde.');
    console.error(error);
  }
};


  const handleRegister = async () => {
    const email = document.getElementById("email").value;

    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        setIsRegister(false); // Retorna para o formulário de login
      } else {
        const errorData = await response.json();
        alert(errorData.message);
      }
    } catch (error) {
      alert('Erro ao tentar registrar. Por favor, tente novamente mais tarde.');
      console.error(error);
    }
  };

  return (
    <div className="login-page">
      <div className="logo-container">
        <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="Pet Tech Logo" />
      </div>
      <div className="login-container">
        {isRegister ? (
          <>
            <h2>Primeiro Acesso</h2>
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input type="email" id="email" placeholder="Digite seu email" required />
            </div>
            <button onClick={handleRegister}>Cadastrar</button>
            <button onClick={() => setIsRegister(false)}>Voltar ao Login</button>
          </>
        ) : (
          <>
            <h2>Login</h2>
            <div className="form-group">
              <label htmlFor="username">Usuário:</label>
              <input type="text" id="username" placeholder="Digite seu usuário" />
            </div>
            <div className="form-group">
              <label htmlFor="password">Senha:</label>
              <input type="password" id="password" placeholder="Digite sua senha" />
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
