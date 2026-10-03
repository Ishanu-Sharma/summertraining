import { useId, useState } from "react";

/**
 * Password input with a show/hide toggle.
 *
 * The toggle is a real button inside the field, not an icon with a click
 * handler, so it is reachable by keyboard. It carries aria-pressed and a label
 * that changes with state; it does NOT sit inside the label element, which
 * would make clicking it focus the input instead of firing the toggle.
 *
 * autoComplete is passed through rather than hardcoded: a login field wants
 * "current-password" and a registration field wants "new-password", and
 * getting that wrong is what makes password managers offer the wrong thing.
 */
export default function PasswordField({
  id,
  label = "Password",
  value,
  onChange,
  placeholder = "Enter your password",
  autoComplete = "current-password",
  required = false,
  hint,
  error,
  icon = "fa-lock"
}) {
  const [shown, setShown] = useState(false);
  const generatedId = useId();
  const fieldId = id || generatedId;

  return (
    <div className={"field" + (error ? " has-error" : "")}>
      <label htmlFor={fieldId}>{label}</label>
      <div className="input-icon input-icon--trailing">
        <i className={"fa-solid " + icon} aria-hidden="true"></i>
        <input
          type={shown ? "text" : "password"}
          id={fieldId}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
        />
        <button
          type="button"
          className="password-toggle"
          onClick={() => setShown((s) => !s)}
          aria-pressed={shown}
          aria-label={shown ? "Hide password" : "Show password"}
          title={shown ? "Hide password" : "Show password"}
          tabIndex={0}
        >
          <i className={"fa-solid " + (shown ? "fa-eye-slash" : "fa-eye")} aria-hidden="true"></i>
        </button>
      </div>
      {hint && !error && <span className="field-hint">{hint}</span>}
      {error && (
        <span className="field-error">
          <i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i> {error}
        </span>
      )}
    </div>
  );
}
