import styles from "./styles.module.css";

export default function Organograma() {
  const desenvolvedores = [
    {
      nome: "Beatriz Marioti",
      cargo: "Scrum Master",
      idade: "17 anos",
      foto: "/beatriz.png",
    },
    {
      nome: "Lívia Izidório",
      cargo: "Product Owner",
      idade: "16 anos",
      foto: "/livia.png",
    },
    {
      nome: "Giulia Galeote",
      cargo: "Desenvolvedora",
      idade: "17 anos",
      foto: "/giulia.png",
    },
    {
      nome: "Marcos Araújo",
      cargo: "Desenvolvedor",
      idade: "16 anos",
      foto: "/marcos.png",
    },
  ];

  const analistas = [
    {
      nome: "Gabriel Teixeira",
      cargo: "Scrum Master",
      idade: "16 anos",
      foto: "/Gabriel.png",
    },
    {
      nome: "Luke Pereira",
      cargo: "Product Owner",
      idade: "17 anos",
      foto: "/luke.png",
    },
    {
      nome: "Caio Garcia",
      cargo: "Analista",
      idade: "17 anos",
      foto: "/caio.png",
    },
  ];

  const renderGrupo = (titulo, membros) => (
    <section className={styles.grupo}>
      <h2>{titulo}</h2>
      <div className={styles.cards}>
        {membros.map((pessoa) => (
          <div key={pessoa.nome} className={styles.card}>
            <img src={pessoa.foto} alt={pessoa.nome} />
            <h3>{pessoa.nome}</h3>
            <p className={styles.cargo}>{pessoa.cargo}</p>
            <p className={styles.idade}>{pessoa.idade}</p>
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <div className={styles.organograma}>
      {renderGrupo("Desenvolvedores", desenvolvedores)}
      {renderGrupo("Analistas", analistas)}
    </div>
  );
}
