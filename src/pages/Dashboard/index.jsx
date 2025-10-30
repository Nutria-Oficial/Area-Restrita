import styles from "./styles.module.css";

export default function Dashboard() {
  return (
    <div className={styles.container}>
      <iframe
        title="BI-Expotech"
        src="https://app.powerbi.com/view?r=eyJrIjoiNGU0ZTA0MzEtYWQwZS00MDcyLTk4NTItOWM5Y2M2NzVhMGU4IiwidCI6ImIxNDhmMTRjLTIzOTctNDAyYy1hYjZhLTFiNDcxMTE3N2FjMCJ9"
        className={styles.iframe}
        allowFullScreen
      ></iframe>
    </div>
  );
}
