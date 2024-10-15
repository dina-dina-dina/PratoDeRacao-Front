import React, { useState } from 'react';
import './login.css';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from './config';

const LoginPage = () => {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');  // Estado para armazenar o email
  const [password, setPassword] = useState('');  // Estado para armazenar a senha

  // Função para lidar com o login
  const handleLogin = async () => {
    if (!email.includes('@')) {
      alert('Por favor, insira um e-mail válido.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),  // Usando diretamente o valor dos estados
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        localStorage.setItem('token', data.token);  // Armazena o token JWT
        navigate("/home");  // Redireciona para a página principal
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Erro no login');
      }
    } catch (error) {
      alert('Erro ao tentar fazer login. Por favor, tente novamente mais tarde.');
      console.error(error);
    }
  };

  // Função para lidar com o registro
  const handleRegister = async () => {
    if (!email.includes('@')) {
      alert('Por favor, insira um e-mail válido.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),  // Usando diretamente o estado do email
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        setIsRegister(false);  // Retorna para o formulário de login
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
              <input
                type="email"
                id="email"
                placeholder="Digite seu email"
                value={email}  // Bind do estado
                onChange={(e) => setEmail(e.target.value)}  // Atualiza o estado
                required
              />
            </div>
            <button onClick={handleRegister}>Cadastrar</button>
            <button onClick={() => setIsRegister(false)}>Voltar ao Login</button>
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
                value={email}  // Bind do estado
                onChange={(e) => setEmail(e.target.value)}  // Atualiza o estado
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Senha:</label>
              <input
                type="password"
                id="password"
                placeholder="Digite sua senha"
                value={password}  // Bind do estado
                onChange={(e) => setPassword(e.target.value)}  // Atualiza o estado
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
