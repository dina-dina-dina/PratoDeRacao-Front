// src/HomePage.js
import React, { useEffect, useRef, useState } from "react";
import "./style.css";
import Chart from "chart.js/auto";
import API_BASE_URL from "./config";

const HomePage = () => {
  // Refs para os gráficos
  const graficoRef = useRef(null);
  const graficoResumoRef = useRef(null);

  // Estados
  const [tutorInfo, setTutorInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPetModalOpen, setIsPetModalOpen] = useState(false);
  const [isTutorModalOpen, setIsTutorModalOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const [userEmail, setUserEmail] = useState("");
  const [petInfo, setPetInfo] = useState({
    nome: "",
    raca: "",
    nascimento: "",
    peso: "",
    pesoRacao: "",
    id: "", // Adicionado para identificar o pet na atualização
  });

  const [tutorInfoForm, setTutorInfoForm] = useState({
    nome: "",
    telefone: "",
  });

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [selectedImage, setSelectedImage] = useState(null); // Adicionado para manipular a imagem selecionada
  const [error, setError] = useState(null); // Novo estado para erros

  // Função para buscar o perfil do tutor
  const fetchTutorProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token); // Verifique se o token está correto
      const response = await fetch(`${API_BASE_URL}/api/users/me`, { // Alinhado com backend
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Dados do perfil atualizados:', data); // Adicionado para depuração
        setTutorInfo(data); // data agora inclui { user, tutor, pets }
      } else {
        const errorData = await response.json();
        console.error('Erro ao buscar perfil:', errorData);
        setError(errorData.message || 'Erro ao buscar perfil');
      }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      setError('Erro ao buscar perfil');
    } finally {
      setLoading(false);
    }
  };

  // Hooks useEffect
  useEffect(() => {
    fetchTutorProfile();
  }, []);

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail) setUserEmail(storedEmail);
  }, []);

  useEffect(() => {
    if (!tutorInfo) return;

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
  }, [tutorInfo]); // Adicione tutorInfo como dependência para recriar os gráficos quando os dados forem atualizados

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

  // Handle Pet Registration com form-data para upload de imagem
  const handlePetRegistration = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
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
          'Authorization': `Bearer ${token}`,
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

  // Handle Pet Update com form-data para upload de imagem
  const handlePetUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
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
          'Authorization': `Bearer ${token}`,
          // 'Content-Type': 'multipart/form-data', // NÃO DEFINIR MANUALMENTE
        },
        body: formData,
      });

      if (response.ok) {
        alert("Pet atualizado com sucesso!");
        setPetInfo({ nome: "", raca: "", nascimento: "", peso: "", pesoRacao: "", id: "" });
        setSelectedImage(null); // Resetar a imagem selecionada
        fetchTutorProfile(); // Atualizar as informações após atualizar o pet
        fecharFormulario("atualizarPetModal"); // Fechar o modal após atualização
      } else {
        const errorData = await response.json();
        alert(errorData.message);
      }
    } catch (error) {
      alert("Erro ao tentar atualizar o pet.");
      console.error(error);
    }
  };

  // Handle Tutor Registration (Atualização)
  const handleTutorRegistration = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/users/me`, { // Alinhado com backend
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`,
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

  // Handle Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, { // Rota correta
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`, // Adicionado para autenticação
        },
        body: JSON.stringify({ oldPassword, newPassword }), // Removido email
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

  return (
    <div className="home-page">
      <header className="cabecalho">
        <img src={`${API_BASE_URL}/uploads/logo.png`} alt="Logo Pet Tech" /> {/* Ajuste para buscar logo do backend */}
        <h2>Bem-vindo, {tutorInfo.tutor.nome || "Usuário"}!</h2>
      </header>
      <main className="main-content">
        <div className="container">
          <aside aria-label="Perfil do Pet">
            {tutorInfo.pets && tutorInfo.pets.length > 0 ? (
              <img
                src={`${API_BASE_URL}/uploads/${tutorInfo.pets[0].imagem}`} // Fetch da imagem do backend
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
                Atualizar Tutor
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
