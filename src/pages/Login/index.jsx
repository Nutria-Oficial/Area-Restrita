import styles from "./styles.module.css";
import Logo from "../../components/Logo";
import Button from "../../components/Button";
import Input from "../../components/Input";
import backgroundImage from "/backgroundLogin.png";

export default function Login() {
  async function handleSubmit(e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    const url =
      `https://api-spring-aql.onrender.com/admin/login` +
      `?email=${encodeURIComponent(email)}` +
      `&senha=${encodeURIComponent(senha)}`;

    const basic = btoa("nutriaAdmin:nutriaAdmin123");

    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Basic ${basic}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("HTTP", res.status, text);
        alert(`Erro ${res.status}: ${text || "Falha ao logar"}`);
        return;
      }

      const user = await res.json();
      localStorage.setItem("user", JSON.stringify(user));
      window.location.reload(); 
    } catch (err) {
      console.error("NETWORK ERR", err);
      alert(err?.message || "Falha ao conectar");
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
          <Input id="email" type="email" placeholder="Endereço de e-mail" required />
          <Input id="senha" type="password" placeholder="Sua senha" required />
          <Button type="submit">Entrar</Button>
        </form>
      </div>
    </div>
  );
}
