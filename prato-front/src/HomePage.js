import React, { useEffect, useRef, useState } from "react";
import "./style.css";
import Chart from "chart.js/auto";
import API_BASE_URL from "./config";

const HomePage = () => {
  // Use refs para armazenar as instâncias dos gráficos
  const graficoRef = useRef(null);
  const graficoResumoRef = useRef(null);

  const [isPetModalOpen, setIsPetModalOpen] = useState(false);
  const [isTutorModalOpen, setIsTutorModalOpen] = useState(false);

  const [userEmail, setUserEmail] = useState("");
  const [petInfo, setPetInfo] = useState({
    nome: "",
    raca: "",
    nascimento: "",
    peso: "",
    pesoRacao: "",
  });
  const [tutorInfo, setTutorInfo] = useState(null); // Armazena as informações do tutor
  const [loading, setLoading] = useState(true); // Controla o carregamento

  const fetchTutorProfile = async () => {
    try {
      const token = localStorage.getItem('token'); // Pega o token do usuário logado

      const response = await fetch(`${API_BASE_URL}/tutors/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, // Passa o token na requisição
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTutorInfo(data); // Armazena as informações do tutor
      } else {
        console.error('Erro ao buscar perfil:', await response.json());
      }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
    } finally {
      setLoading(false); // Conclui o carregamento
    }
  };

  useEffect(() => {
    fetchTutorProfile();
  }, []);

  if (loading) return <p>Carregando...</p>;

  if (!tutorInfo) return <p>Nenhuma informação encontrada</p>;


  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Funções para abrir e fechar os modais
  const abrirFormulario = (tipo) => {
    if (tipo === "cadastroPetModal") setIsPetModalOpen(true);
    if (tipo === "cadastroTutorModal") setIsTutorModalOpen(true);
    if (tipo === "changePassword") setIsChangePasswordOpen(true);
  };

  const fecharFormulario = (tipo) => {
    if (tipo === "cadastroPetModal") setIsPetModalOpen(false);
    if (tipo === "cadastroTutorModal") setIsTutorModalOpen(false);
    if (tipo === "changePassword") {
      setIsChangePasswordOpen(false);
      setOldPassword("");
      setNewPassword("");
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

    useEffect(() => {
      const storedEmail = localStorage.getItem("userEmail");
      if (storedEmail) setUserEmail(storedEmail);
    }, []);

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
          labels: [
            "Domingo",
            "Segunda",
            "Terça",
            "Quarta",
            "Quinta",
            "Sexta",
            "Sábado",
          ],
          datasets: [
            {
              label: "Consumo de Ração (g)",
              data: [200, 180, 220, 190, 170, 160, 210],
              backgroundColor: "#0C3F8C",
            },
          ],
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
          datasets: [
            {
              label: "Consumo Semanal (kg)",
              data: [6.2, 5.8, 6.5, 6.0],
              backgroundColor: "rgba(12, 63, 140, 0.5)",
              borderColor: "#0C3F8C",
              borderWidth: 2,
              fill: true,
            },
          ],
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

  const handlePetRegistration = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/pets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(petInfo),
      });
  
      if (response.ok) {
        const newPet = await response.json(); // Recebe o novo pet cadastrado
        alert("Pet cadastrado com sucesso!");
  
        // Atualiza o estado com o novo pet
        setPetInfo(newPet);
        fecharFormulario("cadastroPetModal");
      } else {
        const errorData = await response.json();
        alert(errorData.message);
      }
    } catch (error) {
      alert("Erro ao tentar cadastrar o pet.");
      console.error(error);
    }
  };
  

  const handleTutorRegistration = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/tutors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tutorInfo),
      });
  
      if (response.ok) {
        const newTutor = await response.json(); // Recebe o novo tutor cadastrado
        alert("Tutor cadastrado com sucesso!");
  
        // Atualiza o estado do tutor
        setTutorInfo(newTutor);
        fecharFormulario("cadastroTutorModal");
      } else {
        const errorData = await response.json();
        alert(errorData.message);
      }
    } catch (error) {
      alert("Erro ao tentar cadastrar o tutor.");
      console.error(error);
    }
  };
  
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!userEmail) {
      alert("Erro: Email do usuário não encontrado.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: userEmail, oldPassword, newPassword }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        fecharFormulario("changePassword");
      } else {
        const errorData = await response.json();
        alert(errorData.message);
      }
    } catch (error) {
      alert(
        "Erro ao tentar trocar a senha. Por favor, tente novamente mais tarde."
      );
      console.error(error);
    }
  };

  // Obter o email do usuário logado
  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail) {
      setUserEmail(storedEmail);
    }
  }, []);

  return (
    <div className="home-page">
      <header className="cabecalho">
        <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="Logo Pet Tech" />
        <h2>Bem-vindo, {tutorInfo.nome}!</h2>
      </header>
      <main className="main-content">
        <div className="container">
          <aside aria-label="Perfil do Pet">
            <img
              src={`${process.env.PUBLIC_URL}/pet.jpg`}
              alt="Foto de Mimi, o Labrador"
            />
            <h2>Mimi</h2>
            <div className="info-pet">
            <section>
          <h3>Seus Pets:</h3>
          <ul>
            {tutorInfo.pets.map((pet) => (
              <li key={pet._id}>
                <p>Nome: {pet.nome}</p>
                <p>Raça: {pet.raca}</p>
                <p>Peso: {pet.peso} kg</p>
              </li>
            ))}
          </ul>
        </section>
              <p>
                <i className="fas fa-paw"></i> Raça: Labrador
              </p>
              <p>
                <i className="fas fa-birthday-cake"></i> Nascimento: 01/01/2020
              </p>
              <p>
                <i className="fas fa-weight"></i> Peso Atual: 12kg
              </p>
            </div>
            <h3>Consumo Diário de Ração</h3>
            <p>
              Total consumido: <strong>5/25kg</strong>
            </p>
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
              <button
                className="botoes"
                onClick={() => abrirFormulario("cadastroPetModal")}
              >
                Cadastrar Pet
              </button>
              <button
                className="botoes"
                onClick={() => abrirFormulario("cadastroTutorModal")}
              >
                Cadastrar Tutor
              </button>
              <button
                className="botoes"
                onClick={() => abrirFormulario("changePassword")}
              >
                Trocar Senha
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* Modal de Cadastro do Pet */}
      <div className="modal" style={{ display: isPetModalOpen ? 'flex' : 'none' }}>
        <div className="modal-content">
          <button onClick={() => fecharFormulario('cadastroPetModal')}>X</button>
          <h3>Cadastro do Pet</h3>
          <form onSubmit={handlePetRegistration}>
            <input
              type="text"
              placeholder="Nome do Pet"
              value={petInfo.nome}
              onChange={(e) => setPetInfo({ ...petInfo, nome: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Raça"
              value={petInfo.raca}
              onChange={(e) => setPetInfo({ ...petInfo, raca: e.target.value })}
              required
            />
            <input
              type="date"
              placeholder="Data de Nascimento"
              value={petInfo.nascimento}
              onChange={(e) => setPetInfo({ ...petInfo, nascimento: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Peso (kg)"
              value={petInfo.peso}
              onChange={(e) => setPetInfo({ ...petInfo, peso: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Quantidade de Ração (kg)"
              value={petInfo.pesoRacao}
              onChange={(e) => setPetInfo({ ...petInfo, pesoRacao: e.target.value })}
              required
            />
            <button type="submit">Cadastrar Pet</button>
          </form>
        </div>
      </div>

      {/* Modal de Cadastro do Tutor */}
      <div className="modal" style={{ display: isTutorModalOpen ? 'flex' : 'none' }}>
        <div className="modal-content">
          <button onClick={() => fecharFormulario('cadastroTutorModal')}>X</button>
          <h3>Cadastro do Tutor</h3>
          <form onSubmit={handleTutorRegistration}>
            <input
              type="text"
              placeholder="Nome"
              value={tutorInfo.nome}
              onChange={(e) => setTutorInfo({ ...tutorInfo, nome: e.target.value })}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={tutorInfo.email}
              onChange={(e) => setTutorInfo({ ...tutorInfo, email: e.target.value })}
              required
            />
            <input
              type="tel"
              placeholder="Telefone"
              value={tutorInfo.telefone}
              onChange={(e) => setTutorInfo({ ...tutorInfo, telefone: e.target.value })}
              required
            />
            <button type="submit">Cadastrar Tutor</button>
          </form>
        </div>
      </div>

      {/* Modal de Troca de Senha */}
      <div
        id="changePasswordModal"
        className="modal"
        style={{ display: isChangePasswordOpen ? "flex" : "none" }}
      >
        <div className="modal-content formulario">
          <button
            className="close-modal"
            onClick={() => fecharFormulario("changePassword")}
          >
            X
          </button>
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
            <button className="botoes-inside" type="submit">
              Alterar Senha
            </button>
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
