import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./styles.module.css";

const API_URL = "/api/chatbot/"; 

async function postJSON(url, body, { timeoutMs = 45000, retries = 1 } = {}) {
  const attempt = async () => {
    const controller = new AbortController();
    const to = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      let data;
      try {
        data = await res.clone().json();
      } catch {
        data = { message: await res.text() };
      }

      return { ok: res.ok, status: res.status, data };
    } finally {
      clearTimeout(to);
    }
  };

  let lastErr, lastResp;
  for (let i = 0; i <= retries; i++) {
    try {
      const resp = await attempt();
      lastResp = resp;

      if (!resp.ok && [502, 503, 504, 524].includes(resp.status) && i < retries) {
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));
        continue;
      }
      return resp;
    } catch (e) {
      lastErr = e;
      if ((e?.name === "AbortError" || e?.message?.includes("NetworkError")) && i < retries) {
        await new Promise(r => setTimeout(r, 800));
        continue;
      }
      throw e;
    }
  }
  if (lastResp) return lastResp;
  throw lastErr;
}

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      id: crypto.randomUUID(),
      role: "assistant",
      text: "Olá! Estou aqui para ajudar. Qual é a sua dúvida sobre a tabela nutricional?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef(null);

  const userId = useMemo(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      return Number(u?.id || u?.nCdUser || 999);
    } catch {
      return 999;
    }
  }, []);

  useEffect(() => {
    listRef.current?.lastElementChild?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const extractBotText = (json) => {
    if (!json || typeof json !== "object") return String(json ?? "");
    return (
      json.cResponse ||
      json.response ||
      json.answer ||
      json.message ||
      json.result ||
      json.Resposta ||
      Object.values(json).find((v) => typeof v === "string") ||
      JSON.stringify(json)
    );
  };

  const addMensagemIA = (role, text) => {
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role, text }]);
  };

  const enviar = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    setError("");
    addMensagemIA("user", trimmed);
    setInput("");
    setLoading(true);

    try {
      const resp = await postJSON(API_URL, { cPrompt: trimmed, nCdUser: Number(userId) }, { timeoutMs: 45000, retries: 1 });

      if (!resp.ok) {
        addMensagemIA(
          "assistant",
          "O servidor demorou ou falhou em processar. Tenta de novo daqui a pouco."
        );
        return;
      }

      const botText = extractBotText(resp.data) || "Sem conteúdo na resposta.";
      addMensagemIA("assistant", botText);
    } catch (e) {
      if (e?.name === "AbortError") {
        setError("Tempo esgotado falando com o serviço.");
        return;
      }
      setError("Falha de rede ou erro inesperado. Já coloquei gelo.");
    } finally {
      setLoading(false);
    }
  };

  const enter = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  };

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <h1>Chatbot</h1>
      </header>

      <main className={styles.body} ref={listRef}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`${styles.bubble} ${msg.role === "user" ? styles.user : styles.assistant}`}
          >
            <p>{msg.text}</p>
          </div>
        ))}
        {loading && (
          <div className={`${styles.bubble} ${styles.assistant} ${styles.thinking}`}>
            <p>Digitando…</p>
          </div>
        )}
        {error && <div className={styles.error}>{error}</div>}
      </main>

      <footer className={styles.footer}>
        <div className={styles.inputBox}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={enter}
            placeholder="Digite sua mensagem…"
            disabled={loading}
            rows={1}
          />
          <button
            type="button"
            onClick={enviar}
            aria-label="Enviar"
            disabled={loading || !input.trim()}
            className={styles.sendBtn}
          >
            ➤
          </button>
        </div>
      </footer>
    </div>
  );
}
