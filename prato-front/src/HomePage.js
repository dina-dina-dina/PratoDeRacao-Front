import React, { useEffect, useRef, useState } from 'react';
import './style.css';
import Chart from 'chart.js/auto';
import API_BASE_URL from './config';

const HomePage = () => {
  // Use refs para armazenar as instâncias dos gráficos
  const graficoRef = useRef(null);
  const graficoResumoRef = useRef(null);

  // Estados para controlar visibilidade dos modais
  const [isPetModalOpen, setIsPetModalOpen] = useState(false);
  const [isTutorModalOpen, setIsTutorModalOpen] = useState(false);

  // Estado para armazenar o email do usuário logado
  const [userEmail, setUserEmail] = useState('');

  // Estados para troca de senha
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Funções para abrir e fechar os modais
  const abrirFormulario = (tipo) => {
    if (tipo === 'cadastroPetModal') {
      setIsPetModalOpen(true);
    } else if (tipo === 'cadastroTutorModal') {
      setIsTutorModalOpen(true);
    } else if (tipo === 'changePassword') {
      setIsChangePasswordOpen(true);
    }
  };

  const fecharFormulario = (tipo) => {
    if (tipo === 'cadastroPetModal') {
      setIsPetModalOpen(false);
    } else if (tipo === 'cadastroTutorModal') {
      setIsTutorModalOpen(false);
    } else if (tipo === 'changePassword') {
      setIsChangePasswordOpen(false);
      setOldPassword('');
      setNewPassword('');
    }
  };

  useEffect(() => {
    // Limpeza: destruir os gráficos se eles já existirem
    if (graficoRef.current) {
      graficoRef.current.destroy();
    }
    if (graficoResumoRef.current) {
      graficoResumoRef.current.destroy();
    }

    // Obter o contexto dos elementos canvas
    const ctx = document.getElementById("grafico");
    const ctxResumo = document.getElementById("graficoResumo");

    // Verifica se os elementos canvas estão no DOM antes de continuar
    if (ctx && ctxResumo) {
      const ctxGraph = ctx.getContext("2d");
      const ctxResumoGraph = ctxResumo.getContext("2d");

      // Criação do gráfico semanal
      graficoRef.current = new Chart(ctxGraph, {
        type: "bar",
        data: {
          labels: ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"],
          datasets: [{
            label: "Consumo de Ração (g)",
            data: [200, 180, 220, 190, 170, 160, 210],
            backgroundColor: "#0C3F8C",
          }],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });

      // Criação do gráfico mensal
      graficoResumoRef.current = new Chart(ctxResumoGraph, {
        type: "line",
        data: {
          labels: ["Semana 1", "Semana 2", "Semana 3", "Semana 4"],
          datasets: [{
            label: "Consumo Semanal (kg)",
            data: [6.2, 5.8, 6.5, 6.0],
            backgroundColor: "rgba(12, 63, 140, 0.5)",
            borderColor: "#0C3F8C",
            borderWidth: 2,
            fill: true,
          }],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }

    // Cleanup: destruir os gráficos quando o componente for desmontado
    return () => {
      if (graficoRef.current) {
        graficoRef.current.destroy();
      }
      if (graficoResumoRef.current) {
        graficoResumoRef.current.destroy();
      }
    };
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!userEmail) {
      alert('Erro: Email do usuário não encontrado.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail, oldPassword, newPassword }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        fecharFormulario('changePassword');
      } else {
        const errorData = await response.json();
        alert(errorData.message);
      }
    } catch (error) {
      alert('Erro ao tentar trocar a senha. Por favor, tente novamente mais tarde.');
      console.error(error);
    }
  };

  // Obter o email do usuário logado
  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail) {
      setUserEmail(storedEmail);
    }
  }, []);

  return (
    <div className="home-page">
      <header className="cabecalho">
        <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="Logo Pet Tech" />
      </header>
      <main className="main-content">
        <div className="container">
          <aside aria-label="Perfil do Pet">
            <img src={`${process.env.PUBLIC_URL}/pet.jpg`} alt="Foto de Mimi, o Labrador" />
            <h2>Mimi</h2>
            <div className="info-pet">
              <p><i className="fas fa-paw"></i> Raça: Labrador</p>
              <p><i className="fas fa-birthday-cake"></i> Nascimento: 01/01/2020</p>
              <p><i className="fas fa-weight"></i> Peso Atual: 12kg</p>
            </div>
            <h3>Consumo Diário de Ração</h3>
            <p>Total consumido: <strong>5/25kg</strong></p>
            <div className="barra-habilidade">
              <span style={{ width: "20%" }}></span>
            </div>
            <div className="grafico-resumo grafico-container">
              <h3>Resumo Mensal do Consumo</h3>
              <canvas id="graficoResumo" width="400" height="200"></canvas>
            </div>
          </aside>
          <section>
            <h2>Relatórios Semanais</h2>
            <div className="grafico-container">
              <canvas id="grafico" width="400" height="200"></canvas>
            </div>

            <div className="formulario-botoes">
              <button className="botoes" onClick={() => abrirFormulario('cadastroPetModal')}>Cadastrar Pet</button>
              <button className="botoes" onClick={() => abrirFormulario('cadastroTutorModal')}>Cadastrar Tutor</button>
              <button className="botoes" onClick={() => abrirFormulario('changePassword')}>Trocar Senha</button>
            </div>
          </section>
        </div>
      </main>

      {/* Modal de Cadastro do Pet */}
      <div id="cadastroPetModal" className="modal" style={{ display: isPetModalOpen ? 'flex' : 'none' }}>
        <div className="modal-content formulario">
          <button className="close-modal" onClick={() => fecharFormulario('cadastroPetModal')}>X</button>
          <h3>Cadastro do Pet</h3>
          <form>
            <label htmlFor="nomePet">Nome do Pet:</label>
            <input type="text" id="nomePet" placeholder="Ex: Mimi" required />
            <label htmlFor="racaPet">Raça:</label>
            <input type="text" id="racaPet" placeholder="Ex: Labrador" required/>
            <label htmlFor="nascPet">Data de Nascimento:</label>
            <input type="date" id="nascPet" required />
            <label htmlFor="pesoPet">Peso (kg):</label>
            <input type="number" id="pesoPet" placeholder="Ex: 15" required />
            <label htmlFor="pesoRacao">Quantidade Total de Ração (kg):</label>
            <input type="number" id="pesoRacao" placeholder="Ex: 20" required />
            <button className="botoes-inside" type="submit">Cadastrar Pet</button>
          </form>
        </div>
      </div>

      {/* Modal de Cadastro do Tutor */}
      <div id="cadastroTutorModal" className="modal" style={{ display: isTutorModalOpen ? 'flex' : 'none' }}>
        <div className="modal-content formulario">
          <button className="close-modal" onClick={() => fecharFormulario('cadastroTutorModal')}>X</button>
          <h3>Cadastro do Tutor</h3>
          <form>
            <label htmlFor="nomeTutor">Nome:</label>
            <input type="text" id="nomeTutor" placeholder="Ex: João" required/>
            <label htmlFor="emailTutor">Email:</label>
            <input type="email" id="emailTutor" placeholder="Ex: joao@gmail.com" required/>
            <label htmlFor="telefoneTutor">Telefone:</label>
            <input type="tel" id="telefoneTutor" placeholder="Ex: (11) 99999-9999" required/>
            <button className="botoes-inside" type="submit">Cadastrar Tutor</button>
          </form>
        </div>
      </div>

      {/* Modal de Troca de Senha */}
      <div id="changePasswordModal" className="modal" style={{ display: isChangePasswordOpen ? 'flex' : 'none' }}>
        <div className="modal-content formulario">
          <button className="close-modal" onClick={() => fecharFormulario('changePassword')}>X</button>
          <h3>Trocar Senha</h3>
          <form onSubmit={handleChangePassword}>
            <label htmlFor="oldPassword">Senha Atual:</label>
            <input
              type="password"
              id="oldPassword"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Digite sua senha atual"
              required
            />
            <label htmlFor="newPassword">Nova Senha:</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Digite sua nova senha"
              required
            />
            <button className="botoes-inside" type="submit">Alterar Senha</button>
          </form>
        </div>
      </div>

      <footer>
        <p>
          Contato: contato@pettracker.com <br />
          Telefone: (11) 12345-6789 <br />
          &copy; 2024 Pet Tech Tracker
        </p>
      </footer>
    </div>
  );
};

export default HomePage;
