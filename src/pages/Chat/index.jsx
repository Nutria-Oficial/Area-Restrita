import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./styles.module.css";

const URL_API =
  import.meta.env.VITE_API_BASE ||
  "https://nutria-fast-api.koyeb.app/chatbot/";

const TEMPO_LIMITE_MS = 45000;
const TENTATIVAS = 1;

//erro de timeout
async function enviarJSON(
  urlAbsoluta,
  corpo,
  { timeoutMs = TEMPO_LIMITE_MS, retries = TENTATIVAS } = {}
) {
  const tentar = async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const resposta = await fetch(urlAbsoluta, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(corpo),
        signal: controller.signal,
      });

      let dados;
      try {
        dados = await resposta.clone().json();
      } catch {
        dados = { message: await resposta.text() };
      }

      return { ok: resposta.ok, status: resposta.status, data: dados };
    } finally {
      clearTimeout(timer);
    }
  };
//erros
  let ultimoErro, ultimaResposta;

  for (let i = 0; i <= retries; i++) {
    try {
      const resp = await tentar();
      ultimaResposta = resp;

      if (!resp.ok && [502, 503, 504, 524].includes(resp.status) && i < retries) {
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));
        continue;
      }
      return resp;
    } catch (e) {
      ultimoErro = e;
      const erroDeRede =
        e?.name === "AbortError" || e?.message?.includes("NetworkError");
      if (erroDeRede && i < retries) {
        await new Promise(r => setTimeout(r, 800));
        continue;
      }
      throw e;
    }
  }

  if (ultimaResposta) return ultimaResposta;
  throw ultimoErro;
}

function extrairTextoDoBot(json) {
  if (!json || typeof json !== "object") return String(json ?? "");
  return (
    json.cResponse ||
    json.response ||
    json.answer ||
    json.message ||
    json.result ||
    json.Resposta ||
    Object.values(json).find(v => typeof v === "string") ||
    JSON.stringify(json)
  );
}

export default function Chat() {
  const [mensagens, setMensagens] = useState([
    {
      id: crypto.randomUUID(),
      role: "assistant",
      text: "Olá! Estou aqui para ajudar. Qual é a sua dúvida sobre a tabela nutricional?",
    },
  ]);

  const [texto, setTexto] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const listaRef = useRef(null);

  const idUsuario = useMemo(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      return Number(u?.id || u?.nCdUser || 999);
    } catch {
      return 999;
    }
  }, []);

  useEffect(() => {
    listaRef.current?.lastElementChild?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens, carregando]);

  const adicionarMensagem = (papel, conteudo) => {
    setMensagens(prev => [...prev, { id: crypto.randomUUID(), role: papel, text: conteudo }]);
  };

  const enviarMensagem = async () => {
    const conteudo = texto.trim();
    if (!conteudo || carregando) return;

    setErro("");
    adicionarMensagem("user", conteudo);
    setTexto("");
    setCarregando(true);

    try {
      const payload = { cPrompt: conteudo, nCdUser: Number(idUsuario) };
      // Chamada direta ao backend, sem proxy do Vite
      const resp = await enviarJSON(URL_API, payload);

      if (!resp.ok) {
        adicionarMensagem(
          "assistant",
          "O servidor demorou ou falhou em processar. Tente novamente mais tarde."
        );
        return;
      }

      const textoBot = extrairTextoDoBot(resp.data) || "Sem conteúdo na resposta.";
      adicionarMensagem("assistant", textoBot);
    } catch (e) {
      if (e?.name === "AbortError") {
        setErro("Tempo esgotado falando com o serviço.");
      } else {
        setErro("Falha de rede ou erro inesperado. Já coloquei gelo.");
      }
    } finally {
      setCarregando(false);
    }
  };

  const aoPressionarEnter = e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviarMensagem();
    }
  };

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <h1>Chatbot</h1>
      </header>

      <main className={styles.body} ref={listaRef}>
        {mensagens.map(msg => (
          <div
            key={msg.id}
            className={`${styles.bubble} ${msg.role === "user" ? styles.user : styles.assistant}`}
          >
            <p>{msg.text}</p>
          </div>
        ))}

        {carregando && (
          <div className={`${styles.bubble} ${styles.assistant} ${styles.thinking}`}>
            <p>Digitando…</p>
          </div>
        )}

        {erro && <div className={styles.error}>{erro}</div>}
      </main>

      <footer className={styles.footer}>
        <div className={styles.inputBox}>
          <textarea
            value={texto}
            onChange={e => setTexto(e.target.value)}
            onKeyDown={aoPressionarEnter}
            placeholder="Digite sua mensagem…"
            disabled={carregando}
            rows={1}
          />
          <button
            type="button"
            onClick={enviarMensagem}
            aria-label="Enviar"
            disabled={carregando || !texto.trim()}
            className={styles.sendBtn}
          >
            ➤
          </button>
        </div>
      </footer>
    </div>
  );
}
