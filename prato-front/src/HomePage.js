// src/HomePage.js
import React, { useEffect, useState } from "react";
import "./style.css";
import { Chart, registerables } from "chart.js";
import { Line } from "react-chartjs-2";
import API_BASE_URL from "./config";
import io from "socket.io-client";

// Registrando os componentes do Chart.js
Chart.register(...registerables);

// Inicializando a conexão com o Socket.io
const socket = io(API_BASE_URL);

const HomePage = () => {
  // Estados principais
  const [tutorInfo, setTutorInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para os modais
  const [isPetModalOpen, setIsPetModalOpen] = useState(false);
  const [isTutorModalOpen, setIsTutorModalOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Estados para formulários
  const [petInfo, setPetInfo] = useState({
    nome: "",
    raca: "",
    nascimento: "",
    peso: "",
    pesoRacao: "",
  });

  const [tutorInfoForm, setTutorInfoForm] = useState({
    nome: "",
    telefone: "",
  });

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Estados para upload de imagem
  const [selectedImage, setSelectedImage] = useState(null);

  // Estado para armazenar valores do potenciômetro
  const [potentiometerValues, setPotentiometerValues] = useState([]);

  // Função para buscar o perfil do tutor
  const fetchTutorProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/users/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTutorInfo(data); // data inclui { user, tutor, pets }
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Erro ao buscar perfil");
      }
    } catch (error) {
      setError("Erro ao buscar perfil");
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar os dados históricos do potenciômetro
  const fetchHistoricalPotentiometerValues = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/potentiometer/historical`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPotentiometerValues(data.potentiometerValues);
      } else {
        console.error("Erro ao buscar dados históricos do potenciômetro");
      }
    } catch (error) {
      console.error("Erro ao buscar dados históricos do potenciômetro:", error);
    }
  };

  // Hook para buscar o perfil e os dados históricos ao montar o componente
  useEffect(() => {
    fetchTutorProfile();
    fetchHistoricalPotentiometerValues();

    // Conectar-se ao Socket.io e escutar por novos valores do potenciômetro
    socket.on("newPotentiometerValue", (data) => {
      setPotentiometerValues((prevValues) => [data, ...prevValues.slice(0, 19)]); // Mantém apenas os 20 valores mais recentes
    });

    // Cleanup ao desmontar o componente
    return () => {
      socket.off("newPotentiometerValue");
    };
  }, []);

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

  // Handler para cadastro de pet
  const handlePetRegistration = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("nome", petInfo.nome);
      formData.append("raca", petInfo.raca);
      formData.append("nascimento", petInfo.nascimento);
      formData.append("peso", petInfo.peso);
      formData.append("pesoRacao", petInfo.pesoRacao);
      if (selectedImage) {
        formData.append("imagem", selectedImage);
      }

      const response = await fetch(`${API_BASE_URL}/api/pets`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Não definir 'Content-Type' ao usar FormData
        },
        body: formData,
      });

      if (response.ok) {
        alert("Pet cadastrado com sucesso!");
        setPetInfo({
          nome: "",
          raca: "",
          nascimento: "",
          peso: "",
          pesoRacao: "",
        });
        setSelectedImage(null);
        fetchTutorProfile();
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

  // Handler para atualização de tutor
  const handleTutorRegistration = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(tutorInfoForm),
      });

      if (response.ok) {
        alert("Informações do tutor atualizadas com sucesso!");
        setTutorInfoForm({ nome: "", telefone: "" });
        fetchTutorProfile();
        fecharFormulario("cadastroTutorModal");
      } else {
        const errorData = await response.json();
        alert(errorData.message);
      }
    } catch (error) {
      alert("Erro ao tentar atualizar o tutor.");
      console.error(error);
    }
  };

  // Handler para troca de senha
  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        setOldPassword("");
        setNewPassword("");
        setIsChangePasswordOpen(false);
      } else {
        const errorData = await response.json();
        alert(errorData.message);
      }
    } catch (error) {
      alert("Erro ao tentar trocar a senha.");
      console.error(error);
    }
  };

  // Configuração dos dados para o gráfico de potenciômetro
 // Configuração dos dados para o gráfico de potenciômetro
const potentiometerChartData = {
  labels: potentiometerValues.map((pot) =>
    new Date(pot.timestamp).toLocaleTimeString()
  ).reverse(),
  datasets: [
    {
      label: "Valor do Potenciômetro",
      data: potentiometerValues.map((pot) => pot.value).reverse(),
      fill: false,
      backgroundColor: "#0C3F8C",
      borderColor: "#0C3F8C",
    },
  ],
};


  const potentiometerChartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        max: 4095,
      },
    },
  };

  // Renderização condicional
  if (loading) {
    return <p>Carregando...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  if (!tutorInfo) {
    return <p>Nenhuma informação encontrada</p>;
  }

  return (
    <div className="home-page">
      <header className="cabecalho">
        <img src={`${API_BASE_URL}/uploads/logo.png`} alt="Logo Pet Tech" />
        <h2>Bem-vindo, {tutorInfo.tutor.nome || "Usuário"}!</h2>
      </header>
      <main className="main-content">
        <div className="container">
          <aside aria-label="Perfil do Pet">
            {tutorInfo.pets && tutorInfo.pets.length > 0 ? (
              <img
                src={`${API_BASE_URL}/uploads/${tutorInfo.pets[0].imagem}`}
                alt={`Foto de ${tutorInfo.pets[0].nome}`}
              />
            ) : (
              <img
                src={`${process.env.PUBLIC_URL}/pet.jpg`}
                alt="Nenhum Pet"
              />
            )}
            <h2>
              {tutorInfo.pets && tutorInfo.pets.length > 0
                ? tutorInfo.pets[0].nome
                : "Nenhum Pet"}
            </h2>
            <div className="info-pet">
              <section>
                <h3>Seus Pets:</h3>
                <ul>
                  {tutorInfo.pets && tutorInfo.pets.length > 0 ? (
                    tutorInfo.pets.map((pet) => (
                      <li key={pet._id}>
                        <p>Raça: {pet.raca}</p>
                        <p>Peso: {pet.peso} kg</p>
                        <p>Nascimento:{" "}
                        {new Date(tutorInfo.pets[0].nascimento).toLocaleDateString()}</p>
                      </li>
                    ))
                  ) : (
                    <p>Nenhum pet cadastrado</p>
                  )}
                </ul>
              </section>

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
              <Line data={potentiometerChartData} options={potentiometerChartOptions} />
            </div>
          </aside>
          <section>
            <h2>Relatórios Semanais</h2>
            <div className="grafico-container">
              {/* Gráfico de consumo semanal pode ser implementado aqui */}
              <Line
                data={{
                  labels: ["Semana 1", "Semana 2", "Semana 3", "Semana 4"],
                  datasets: [
                    {
                      label: "Consumo Semanal (kg)",
                      data: [6.2, 5.8, 6.5, 6.0],
                      fill: false,
                      backgroundColor: "rgba(12, 63, 140, 0.5)",
                      borderColor: "#0C3F8C",
                    },
                  ],
                }}
                options={{
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
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
                Atualizar Tutor
              </button>
              <button
                className="botoes"
                onClick={() => abrirFormulario("changePassword")}
              >
                Trocar Senha
              </button>
            </div>

            <div className="potentiometer-section">
              <h2>Valores do Potenciômetro em Tempo Real</h2>
              <Line data={potentiometerChartData} options={potentiometerChartOptions} />
              <ul>
                {potentiometerValues.map((pot, index) => (
                  <li key={index}>
                    <span>
                      {new Date(pot.timestamp).toLocaleTimeString()}:
                    </span>{" "}
                    {pot.value}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </main>

      {/* Modal de Cadastro do Pet */}
      <div className="modal" style={{ display: isPetModalOpen ? "flex" : "none" }}>
        <div className="modal-content">
          <button onClick={() => fecharFormulario("cadastroPetModal")}>X</button>
          <h3>Cadastro do Pet</h3>
          <form onSubmit={handlePetRegistration}>
            <input
              type="text"
              placeholder="Nome do Pet"
              value={petInfo.nome}
              onChange={(e) =>
                setPetInfo({ ...petInfo, nome: e.target.value })
              }
              required
            />
            <input
              type="text"
              placeholder="Raça"
              value={petInfo.raca}
              onChange={(e) =>
                setPetInfo({ ...petInfo, raca: e.target.value })
              }
              required
            />
            <input
              type="date"
              placeholder="Data de Nascimento"
              value={petInfo.nascimento}
              onChange={(e) =>
                setPetInfo({ ...petInfo, nascimento: e.target.value })
              }
              required
            />
            <input
              type="number"
              placeholder="Peso (kg)"
              value={petInfo.peso}
              onChange={(e) =>
                setPetInfo({ ...petInfo, peso: e.target.value })
              }
              required
            />
            <input
              type="number"
              placeholder="Quantidade de Ração (kg)"
              value={petInfo.pesoRacao}
              onChange={(e) =>
                setPetInfo({ ...petInfo, pesoRacao: e.target.value })
              }
              required
            />
            {/* Campo para upload de imagem */}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedImage(e.target.files[0])}
            />
            <button type="submit">Cadastrar Pet</button>
          </form>
        </div>
      </div>

      {/* Modal de Atualização do Tutor */}
      <div className="modal" style={{ display: isTutorModalOpen ? "flex" : "none" }}>
        <div className="modal-content">
          <button onClick={() => fecharFormulario("cadastroTutorModal")}>X</button>
          <h3>Atualizar Informações do Tutor</h3>
          <form onSubmit={handleTutorRegistration}>
            <input
              type="text"
              placeholder="Nome"
              value={tutorInfoForm.nome}
              onChange={(e) =>
                setTutorInfoForm({ ...tutorInfoForm, nome: e.target.value })
              }
              required
            />
            <input
              type="tel"
              placeholder="Telefone"
              value={tutorInfoForm.telefone}
              onChange={(e) =>
                setTutorInfoForm({
                  ...tutorInfoForm,
                  telefone: e.target.value,
                })
              }
              required
            />
            <button type="submit">Atualizar Tutor</button>
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
