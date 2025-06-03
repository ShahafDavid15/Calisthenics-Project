import classes from "./header.module.css";
/**
 * description: Header component
 * @returns JSX of component
 */
export default function Header() {
  return (
    <header className={classes.header}>
      <h1>Calisthenics</h1>
    </header>
  );
}
