// src/HomePage.js
import React, { useEffect, useRef, useState } from "react";
import "./style.css";
import Chart from "chart.js/auto";
import 'chartjs-adapter-date-fns';
import { format, parseISO, startOfDay, endOfDay, isSameDay } from 'date-fns';
import API_BASE_URL from "./config";
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Registrar o plugin
Chart.register(ChartDataLabels);

const HomePage = () => {
  // Refs para os gráficos
  const graficoPesoAtualRef = useRef(null);
  const graficoVariacaoDiaRef = useRef(null);

  // Estados
  const [tutorInfo, setTutorInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPetModalOpen, setIsPetModalOpen] = useState(false);
  const [isTutorModalOpen, setIsTutorModalOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [latestWeightData, setLatestWeightData] = useState(null);
  const [weightData, setWeightData] = useState([]); // Todos os dados de peso
  const [userEmail, setUserEmail] = useState("");
  const [petInfo, setPetInfo] = useState({
    nome: "",
    raca: "",
    nascimento: "",
    peso: "",
    pesoRacao: "",
    id: "",
  });

  const [tutorInfoForm, setTutorInfoForm] = useState({
    nome: "",
    telefone: "",
  });

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [selectedImage, setSelectedImage] = useState(null);
  const [error, setError] = useState(null);

  // Estados para os dados de peso
  const [weeklyWeightData, setWeeklyWeightData] = useState([]);

  // Capacidade máxima do prato (em gramas)
  const capacidadeMaxima = 500; // Ajuste conforme necessário

  // Função para buscar o perfil do tutor
  const fetchTutorProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/users/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTutorInfo(data);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erro ao buscar perfil');
      }
    } catch (error) {
      setError('Erro ao buscar perfil');
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar os dados de peso
  const fetchWeightData = async () => {
    try {
      // Obter o peso atual
      const latestResponse = await fetch(`${API_BASE_URL}/api/weights/latest`);
      if (latestResponse.ok) {
        const latestData = await latestResponse.json();
        setLatestWeightData(latestData);
        console.log(latestData)
      } else {
        console.error('Erro ao buscar o peso atual:', latestResponse.statusText);
      }

      // Obter todos os dados dos últimos 7 dias
      const recentResponse = await fetch(`${API_BASE_URL}/api/weights/recent`);
      if (recentResponse.ok) {
        const recentData = await recentResponse.json();
        setWeightData(recentData);
        // console.log(recentData)
      } else {
        console.error('Erro ao buscar os dados de peso:', recentResponse.statusText);
      }
    } catch (error) {
      console.error('Erro ao buscar os dados de peso:', error);
    }
  };


  // Hooks useEffect
  useEffect(() => {
    fetchTutorProfile();
    fetchWeightData();

    // Atualizar os dados a cada 5 segundos
    const intervalId = setInterval(() => {
      fetchWeightData();
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail) setUserEmail(storedEmail);
  }, []);

  useEffect(() => {
    if (!tutorInfo || !weightData.length) return;
    if (!tutorInfo) return;

    // Limpeza: destruir os gráficos existentes se eles já existirem
    if (graficoPesoAtualRef.current) {
      graficoPesoAtualRef.current.destroy();
    }
    if (graficoVariacaoDiaRef.current) {
      graficoVariacaoDiaRef.current.destroy();
    }

    // Obter o contexto dos elementos canvas
    const ctxPesoAtual = document.getElementById("graficoPesoAtual");
    const ctxVariacaoDia = document.getElementById("graficoVariacaoDia");

    if (ctxPesoAtual && ctxVariacaoDia) {
      // Gráfico de Peso Atual
      const ctxPesoAtualGraph = ctxPesoAtual.getContext("2d");
      const pesoAtual = 35

      graficoPesoAtualRef.current = new Chart(ctxPesoAtualGraph, {
        type: "doughnut",
        data: {
          labels: ["Ração no Prato", "Capacidade Restante"],
          datasets: [
            {
              data: [pesoAtual, capacidadeMaxima - pesoAtual],
              backgroundColor: ["#0C3F8C", "#CCCCCC"],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
            },
            datalabels: {
              display: true,
              formatter: function (value, context) {
                if (context.dataIndex === 0) {
                  return `${pesoAtual.toFixed(2)} g`;
                } else {
                  return '';
                }
              },
              color: '#000',
              font: {
                weight: 'bold',
                size: 16,
              },
            },
          },
        },
      });

      // Filtrar dados para o dia atual
      const dataString = "2024-10-29"; // Formato IS
      const hoje = new Date(dataString);
      console.log(hoje)
      const inicioDoDia = startOfDay(hoje);
      const fimDoDia = endOfDay(hoje);

      const dadosDiaAtual = weightData.filter((dataPoint) => {
        const timestamp = new Date(dataPoint.timestamp);
        return timestamp >= inicioDoDia && timestamp <= fimDoDia;
      });


      // Preparar dados para o gráfico de variação diária
      const labelsDia = dadosDiaAtual.map((dataPoint) => {
        const date = new Date(dataPoint.timestamp);
        return format(date, 'HH:mm:ss');
      });
      console.log(dadosDiaAtual)
      console.log(labelsDia)

      const pesosDia = dadosDiaAtual.map((dataPoint) => dataPoint.totalWeight);

      // Gráfico de Variação Diária
      const ctxVariacaoDiaGraph = ctxVariacaoDia.getContext("2d");
      graficoVariacaoDiaRef.current = new Chart(ctxVariacaoDiaGraph, {
        type: "line",
        data: {
          labels: labelsDia,
          datasets: [
            {
              label: "Peso Total (g)",
              data: pesosDia,
              pointRadius: 0,
              borderColor: "#0C3F8C",
              fill: false,
              tension: 0.1,
              showLine: true,

            },
          ],
        },
        options: {

          scales: {
            x: {
              type: 'time',
              time: {
                parser: 'HH:mm:ss',
                unit: 'hour',
                displayFormats: {
                  hour: 'HH:mm',
                },
              },
              title: {
                display: true,
                text: 'Hora',
              },
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Peso (g)',
              },
            },
          },
        },
      });
    }

    // Cleanup: destruir os gráficos quando o componente for desmontado
    return () => {
      if (graficoPesoAtualRef.current) {
        graficoPesoAtualRef.current.destroy();
      }
      if (graficoVariacaoDiaRef.current) {
        graficoVariacaoDiaRef.current.destroy();
      }
    };
  }, [tutorInfo]);

  // Função para calcular o resumo semanal
  const calcularResumoSemanal = () => {
    const resumo = [];

    // Obter os últimos 7 dias
    const hoje = new Date();
    for (let i = 0; i < 7; i++) {
      const dia = new Date();
      dia.setDate(hoje.getDate() - i);

      // Filtrar dados do dia
      const dadosDoDia = weightData.filter((dataPoint) => {
        const timestamp = new Date(dataPoint.timestamp);
        return isSameDay(timestamp, dia);
      });

      if (dadosDoDia.length > 0) {
        const pesos = dadosDoDia.map((dataPoint) => dataPoint.totalWeight);
        const pesoMaximo = Math.max(...pesos);
        const pesoMinimo = Math.min(...pesos);
        const consumo = pesoMaximo - pesoMinimo;

        resumo.push({
          dia: format(dia, 'EEE, dd/MM'),
          pesoMaximo: pesoMaximo.toFixed(2),
          pesoMinimo: pesoMinimo.toFixed(2),
          consumo: consumo.toFixed(2),
        });
      } else {
        resumo.push({
          dia: format(dia, 'EEE, dd/MM'),
          pesoMaximo: '-',
          pesoMinimo: '-',
          consumo: '-',
        });
      }
    }

    return resumo.reverse();
  };

  const resumoSemanal = calcularResumoSemanal();

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

  // Handlers de formulários
  const handlePetRegistration = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("nome", petInfo.nome);
      formData.append("raca", petInfo.raca);
      formData.append("nascimento", petInfo.nascimento);
      formData.append("peso", petInfo.peso);
      formData.append("pesoRacao", petInfo.pesoRacao);
      if (selectedImage) {
        formData.append("imagem", selectedImage);
      }

      const response = await fetch(`${API_BASE_URL}/api/pets`, { // Rota correta
        method: "POST",
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          // 'Content-Type': 'multipart/form-data', // NÃO DEFINIR MANUALMENTE; o browser cuidará disso
        },
        body: formData,
      });

      if (response.ok) {
        alert("Pet cadastrado com sucesso!");
        setPetInfo({ nome: "", raca: "", nascimento: "", peso: "", pesoRacao: "" });
        setSelectedImage(null); // Resetar a imagem selecionada
        fetchTutorProfile(); // Atualizar as informações após cadastrar um pet
        fecharFormulario("cadastroPetModal"); // Fechar o modal após cadastro
      } else {
        const errorData = await response.json();
        alert(errorData.message);
      }
    } catch (error) {
      alert("Erro ao tentar cadastrar o pet.");
      console.error(error);
    }
  };

  const handlePetUpdate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("nome", petInfo.nome);
      formData.append("raca", petInfo.raca);
      formData.append("nascimento", petInfo.nascimento);
      formData.append("peso", petInfo.peso);
      formData.append("pesoRacao", petInfo.pesoRacao);
      if (selectedImage) {
        formData.append("imagem", selectedImage);
      }

      const response = await fetch(`${API_BASE_URL}/api/pets/${petInfo.id}`, { // Rota correta com ID do pet
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          // 'Content-Type': 'multipart/form-data', // NÃO DEFINIR MANUALMENTE
        },
        body: formData,
      });

      if (response.ok) {
        alert("Pet atualizado com sucesso!");
        setPetInfo({ nome: "", raca: "", nascimento: "", peso: "", pesoRacao: "", id: "" });
        setSelectedImage(null); // Resetar a imagem selecionada
        fetchTutorProfile(); // Atualizar as informações após atualizar o pet
        fecharFormulario("cadastroPetModal"); // Fechar o modal após atualização
      } else {
        const errorData = await response.json();
        alert(errorData.message);
      }
    } catch (error) {
      alert("Erro ao tentar atualizar o pet.");
      console.error(error);
    }
  };

  const handleTutorRegistration = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/me`, { // Alinhado com backend
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(tutorInfoForm),
      });

      if (response.ok) {
        alert("Informações do tutor atualizadas com sucesso!");
        setTutorInfoForm({ nome: "", telefone: "" });
        fetchTutorProfile(); // Atualizar as informações após atualizar o tutor
        fecharFormulario("cadastroTutorModal"); // Fechar o modal após atualização
      } else {
        const errorData = await response.json();
        alert(errorData.message);
      }
    } catch (error) {
      alert("Erro ao tentar atualizar o tutor.");
      console.error(error);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, { // Rota correta
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
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

  // Função para abrir o modal de atualização de pet com informações pré-preenchidas
  const abrirAtualizarPetModal = (pet) => {
    setPetInfo({
      nome: pet.nome,
      raca: pet.raca,
      nascimento: pet.nascimento,
      peso: pet.peso,
      pesoRacao: pet.pesoRacao,
      id: pet._id,
    });
    setIsPetModalOpen(true);
  };

  // Função para resetar os gráficos e dados
  const resetarGraficos = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/weights/reset`, {
        method: 'DELETE',
      });
      if (response.ok) {
        console.log('Dados de peso resetados com sucesso.');
        // Limpar os dados de peso armazenados no estado
        setWeightData([]);
        setLatestWeightData(null);

        // Destruir os gráficos existentes
        if (graficoPesoAtualRef.current) {
          graficoPesoAtualRef.current.destroy();
          graficoPesoAtualRef.current = null;
        }
        if (graficoVariacaoDiaRef.current) {
          graficoVariacaoDiaRef.current.destroy();
          graficoVariacaoDiaRef.current = null;
        }
      } else {
        console.error('Erro ao resetar os dados de peso:', response.statusText);
      }
    } catch (error) {
      console.error('Erro ao resetar os dados de peso:', error);
    }
  };

  // Função para excluir a conta
  const excluirConta = async () => {
    const confirmacao = window.confirm('Tem certeza de que deseja excluir sua conta e todos os dados? Essa ação não pode ser desfeita.');
    if (!confirmacao) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/users/me`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        // Limpar dados do usuário
        localStorage.removeItem('token');
        setTutorInfo(null);
        setWeightData([]);
        setLatestWeightData(null);

        // Redirecionar para a página inicial ou de login
        window.location.href = '/login';
      } else {
        console.error('Erro ao excluir a conta:', response.statusText);
      }
    } catch (error) {
      console.error('Erro ao excluir a conta:', error);
    }
  };

  // Renderização condicional dentro do JSX
  if (loading) {
    return <p>Carregando...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  if (!tutorInfo) {
    return <p>Nenhuma informação encontrada</p>;
  }
  
  var simulados = [
    {
      "dia": "Segunda-Feira - 21/10",
      "pesoMaximo": 100,
      "pesoMinimo": 50,
      "consumo": 50
    },
    {
      "dia": "Terça-Feira - 22/10",
      "pesoMaximo": 80,
      "pesoMinimo": 20,
      "consumo": 60
    },
    {
      "dia": "Quarta-Feira - 23/10",
      "pesoMaximo": 75,
      "pesoMinimo": 50,
      "consumo": 25
    },
    {
      "dia": "Quinta-Feira - 24/10",
      "pesoMaximo": 100,
      "pesoMinimo": 30,
      "consumo": 70
    },
    {
      "dia": "Sexta-Feira - 25/10",
      "pesoMaximo": 50,
      "pesoMinimo": 20,
      "consumo": 30
    },
  ]

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
            <h2>{tutorInfo.pets && tutorInfo.pets.length > 0 ? tutorInfo.pets[0].nome : "Nenhum Pet"}</h2>
            <div className="info-pet">
              <section>
                <h3>Seus Pets:</h3>
                <ul>
                  {tutorInfo.pets && tutorInfo.pets.length > 0 ? (
                    tutorInfo.pets.map((pet) => (
                      <li key={pet._id}>
                        <p>Nome: {pet.nome}</p>
                        <p>Raça: {pet.raca}</p>
                        <p>Peso: {pet.peso} kg</p>
                        <button onClick={() => abrirAtualizarPetModal(pet)}>Atualizar</button>
                      </li>
                    ))
                  ) : (
                    <p>Nenhum pet cadastrado</p>
                  )}
                </ul>
              </section>
            </div>

            <h3>Peso Atual da Ração</h3>
            <div className="grafico-container" style={{ height: '200px' }}>
              <canvas id="graficoPesoAtual"></canvas>
            </div>
          </aside>

          <section>
            <h2>Variação de Peso ao Longo do Dia</h2>
            <div className="grafico-container">
              <canvas id="graficoVariacaoDia" width="400" height="200"></canvas>
            </div>

            <h2>Resumo Semanal</h2>
            <table className="resumo-semanal">
              <thead>
                <tr>
                  <th>Dia</th>
                  <th>Peso Máximo (g)</th>
                  <th>Peso Mínimo (g)</th>
                  <th>Consumo (g)</th>
                </tr>
              </thead>
              <tbody>

                {simulados.map((dia, index) => (
                  <tr key={index}>
                    <td>{dia.dia}</td>
                    <td>{dia.pesoMaximo}</td>
                    <td>{dia.pesoMinimo}</td>
                    <td>{dia.consumo}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Botões e outras seções mantidas */}
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

              {/* <button
              className="botoes"
              onClick={resetarGraficos}
            >
              Resetar Gráficos
            </button> */}

              <button
                className="botoes"
                onClick={excluirConta}
                style={{ backgroundColor: 'red', color: 'white' }}
              >
                Excluir Conta
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* Modal de Cadastro do Pet */}
      <div className="modal" style={{ display: isPetModalOpen ? 'flex' : 'none' }}>
        <div className="modal-content">
          <button onClick={() => fecharFormulario('cadastroPetModal')}>X</button>
          <h3>{petInfo.id ? "Atualizar Pet" : "Cadastrar Pet"}</h3>
          <form onSubmit={petInfo.id ? handlePetUpdate : handlePetRegistration}>
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
            {/* Campo para upload de imagem */}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedImage(e.target.files[0])}
            />
            <button type="submit">{petInfo.id ? "Atualizar Pet" : "Cadastrar Pet"}</button>
          </form>
        </div>
      </div>

      {/* Modal de Atualização do Tutor */}
      <div className="modal" style={{ display: isTutorModalOpen ? 'flex' : 'none' }}>
        <div className="modal-content">
          <button onClick={() => fecharFormulario('cadastroTutorModal')}>X</button>
          <h3>Atualizar Informações do Tutor</h3>
          <form onSubmit={handleTutorRegistration}>
            <input
              type="text"
              placeholder="Nome"
              value={tutorInfoForm.nome}
              onChange={(e) => setTutorInfoForm({ ...tutorInfoForm, nome: e.target.value })}
              required
            />
            <input
              type="tel"
              placeholder="Telefone (opcional)"
              value={tutorInfoForm.telefone}
              onChange={(e) => setTutorInfoForm({ ...tutorInfoForm, telefone: e.target.value })}
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
