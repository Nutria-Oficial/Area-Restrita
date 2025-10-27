import { useState } from "react";
import styles from "./styles.module.css";
import Logo from "../../components/Logo";
import Button from "../../components/Button";
import Input from "../../components/Input";
import backgroundImage from "/backgroundLogin.png";

const API_BASE =
  import.meta.env.VITE_API_BASE?.replace(/\/+$/, "") ||
  "https://api-spring-aql.onrender.com";

const BASIC = "Basic " + btoa("nutriaAdmin:nutriaAdmin123");

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    const eTrim = email.trim();
    const sTrim = senha.trim();
    if (!eTrim || !sTrim) {
      alert("Preencha e-mail e senha.");
      return;
    }

    setLoading(true);
    try {
      const user = await loginSomenteGET(eTrim, sTrim);
      localStorage.setItem("user", JSON.stringify(user));
      window.location.reload();
    } catch (err) {
      console.error("LOGIN ERR", err);
      alert(err?.message || "Falha ao logar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <img
        src={backgroundImage}
        alt="Tela de login do Nutria"
        className={styles.backgroundImage}
      />
      <div className={styles.card}>
        <div className={styles.header}>
          <Logo />
          <h2>Bem-vindo(a) de volta!</h2>
          <p>Insira suas credenciais para acessar sua conta</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Endereço de e-mail"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            id="senha"
            name="senha"
            type="password"
            placeholder="Sua senha"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  );
}

/* ---------------- helpers ---------------- */

async function loginSomenteGET(email, senha) {
  const caminho = "/admin/login";

  // 1) GET sem parâmetros: só autenticação Basic
  try {
    return await callGetSemParams(caminho);
  } catch (e1) {
    if (!isContratoErr(e1)) throw e1;
  }

  // 2) GET com ?email=&senha= (se o controller exigir)
  return await callGetComParams(caminho, { email, senha });
}

function isContratoErr(err) {
  // 400/415 = contrato diferente do que tentamos
  return err?.status === 400 || err?.status === 415;
}

async function callGetSemParams(path) {
  const res = await fetch(API_BASE + path, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: BASIC,
    },
    credentials: "include",
  });
  return await parseJsonOuErro(res);
}

async function callGetComParams(path, params) {
  const url = new URL(API_BASE + path);
  url.search = new URLSearchParams(params).toString();

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: BASIC,
    },
    credentials: "include",
  });
  return await parseJsonOuErro(res);
}

async function parseJsonOuErro(res) {
  const ct = res.headers.get("content-type") || "";
  const texto = await res.text();

  if (!res.ok) {
    // Mostra a mensagem útil do backend se houver
    const data = ct.includes("application/json") ? tentaJSON(texto) : null;
    const msg =
      (data && (data.message || data.error || data.detail || data.titulo)) ||
      (texto || `HTTP ${res.status} ${res.statusText || ""}`.trim());
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }

  if (!texto) return { status: "ok" }; // corpo vazio? beleza
  if (!ct.includes("application/json")) return { status: "ok", raw: texto };
  return tentaJSON(texto) ?? { status: "ok" };
}

function tentaJSON(t) {
  try {
    return JSON.parse(t);
  } catch {
    return null;
  }
}
