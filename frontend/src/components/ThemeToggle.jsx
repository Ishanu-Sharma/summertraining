import { useTheme } from "../context/ThemeContext";

/**
 * One button, not a three-way segmented control: the "system" preference is the
 * default and does not need its own visible state, it just means the button has
 * not been pressed yet. aria-pressed carries the current mode for screen
 * readers, which a plain icon swap would not.
 */
export default function ThemeToggle({ className = "" }) {
  const { theme, toggle } = useTheme();
  const goingDark = theme !== "dark";

  return (
    <button
      type="button"
      className={"theme-toggle " + className}
      onClick={toggle}
      aria-pressed={theme === "dark"}
      aria-label={goingDark ? "Switch to dark mode" : "Switch to light mode"}
      title={goingDark ? "Switch to dark mode" : "Switch to light mode"}
    >
      <i className={"fa-solid " + (goingDark ? "fa-moon" : "fa-sun")} aria-hidden="true"></i>
    </button>
  );
}
