import styles from "./styles.module.css";

export default function Input({ type, placeholder, ...props }) {
  return (
    <input type={type} placeholder={placeholder} className={styles.input} {...props}/>
  );
}
