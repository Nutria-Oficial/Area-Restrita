import { NavLink } from "react-router-dom";
import styles from "./styles.module.css";

import dashboardIcon from "/icons/dashboard.png";
import organogramaIcon from "/icons/organograma.png";
import chatIcon from "/icons/chat.png";
import logoutIcon from "/icons/logout.png";
import defaultAvatar from "/icons/fotopadrao.png";

const items = [
  { to: "/dashboard", label: "Dashboards", icon: dashboardIcon },
  { to: "/organograma", label: "Organograma", icon: organogramaIcon },
  { to: "/chat", label: "Chat", icon: chatIcon },
];

export default function Sidebar() {
  // pega o usuário salvo após o login
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // ajusta a origem da imagem
  const avatarSrc = user?.foto || user?.imagem
    ? (user.foto?.startsWith("http") || user.imagem?.startsWith("http")
        ? user.foto || user.imagem
        : `/icons/${user.foto || user.imagem}`)
    : defaultAvatar;

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.reload();
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>Nutria</div>

      <div className={styles.user}>
        <img src={avatarSrc} alt="Avatar" className={styles.avatar} />
        <div className={styles.userInfo}>
          <div className={styles.nome}>{user?.nome || "Usuário"}</div>
          <div className={styles.cargo}>{user?.cargo || "Administrador"}</div>
        </div>
      </div>

      <nav className={styles.nav}>
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive ? `${styles.link} ${styles.active}` : styles.link
            }
            end
          >
            <img src={item.icon} alt={item.label} className={styles.icon} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.footer}>
        <button className={styles.logout} type="button" onClick={handleLogout}>
          <img src={logoutIcon} alt="Logout" className={styles.icon} />
          Encerrar sessão
        </button>
      </div>
    </aside>
  );
}
