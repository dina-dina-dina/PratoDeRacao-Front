import React, { useEffect, useRef, useState } from "react";
import "./style.css";
import Chart from "chart.js/auto";
import API_BASE_URL from "./config";

const HomePage = () => {
  // Definindo estados e referências
  const graficoRef = useRef(null);
  const graficoResumoRef = useRef(null);

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
  });

  const [tutorInfo, setTutorInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Efeito para buscar perfil do tutor ao carregar a página
  useEffect(() => {
    const fetchTutorProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(`${API_BASE_URL}/tutors/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setTutorInfo(data);
        } else {
          console.error("Erro ao buscar perfil:", await response.json());
        }
      } catch (error) {
        console.error("Erro ao buscar perfil:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTutorProfile();
  }, []); // Efeito chamado uma vez, ao carregar o componente

  // Efeito para obter o email do usuário logado do localStorage
  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail) {
      setUserEmail(storedEmail);
    }
  }, []);

  // Efeito para criar ou destruir gráficos
  useEffect(() => {
    if (graficoRef.current) {
      graficoRef.current.destroy();
    }
    if (graficoResumoRef.current) {
      graficoResumoRef.current.destroy();
    }

    const ctx = document.getElementById("grafico");
    const ctxResumo = document.getElementById("graficoResumo");

    if (ctx && ctxResumo) {
      graficoRef.current = new Chart(ctx.getContext("2d"), {
        type: "bar",
        data: {
          labels: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
          datasets: [{ label: "Consumo (g)", data: [200, 180, 220, 190, 170, 160, 210], backgroundColor: "#0C3F8C" }],
        },
        options: { scales: { y: { beginAtZero: true } } },
      });

      graficoResumoRef.current = new Chart(ctxResumo.getContext("2d"), {
        type: "line",
        data: {
          labels: ["Semana 1", "Semana 2", "Semana 3", "Semana 4"],
          datasets: [{ label: "Consumo (kg)", data: [6.2, 5.8, 6.5, 6.0], backgroundColor: "rgba(12, 63, 140, 0.5)", borderColor: "#0C3F8C", fill: true }],
        },
        options: { scales: { y: { beginAtZero: true } } },
      });
    }

    return () => {
      if (graficoRef.current) graficoRef.current.destroy();
      if (graficoResumoRef.current) graficoResumoRef.current.destroy();
    };
  }, []);

  if (loading) return <p>Carregando...</p>;
  if (!tutorInfo) return <p>Nenhuma informação encontrada</p>;

  const handlePetRegistration = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/pets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(petInfo),
      });

      if (response.ok) {
        const newPet = await response.json();
        alert("Pet cadastrado com sucesso!");
        setTutorInfo((prev) => ({ ...prev, pets: [...prev.pets, newPet] }));
        setPetInfo({ nome: "", raca: "", nascimento: "", peso: "", pesoRacao: "" });
        setIsPetModalOpen(false);
      } else {
        const errorData = await response.json();
        alert(errorData.message);
      }
    } catch (error) {
      alert("Erro ao cadastrar o pet.");
      console.error(error);
    }
  };

  const handleTutorRegistration = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/tutors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tutorInfo),
      });

      if (response.ok) {
        alert("Tutor cadastrado com sucesso!");
        setTutorInfo({ nome: "", email: "", telefone: "" });
        setIsTutorModalOpen(false);
      } else {
        const errorData = await response.json();
        alert(errorData.message);
      }
    } catch (error) {
      alert("Erro ao cadastrar tutor.");
      console.error(error);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, oldPassword, newPassword }),
      });

      if (response.ok) {
        alert("Senha alterada com sucesso!");
        setIsChangePasswordOpen(false);
      } else {
        const errorData = await response.json();
        alert(errorData.message);
      }
    } catch (error) {
      alert("Erro ao trocar a senha.");
      console.error(error);
    }
  };

  return (
    <div className="home-page">
      <header className="cabecalho">
        <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="Logo Pet Tech" />
        <h2>Bem-vindo, {tutorInfo.nome}!</h2>
      </header>
      <main>
        <h3>Seus Pets:</h3>
        <ul>
          {tutorInfo.pets.map((pet) => (
            <li key={pet._id}>{pet.nome} - {pet.raca}</li>
          ))}
        </ul>
        {/* Botões e Modais */}
      </main>
    </div>
  );
};

export default HomePage;
