import { useEffect, useRef, useState } from "react";

/**
 * Copies a string and says so for two seconds. The clipboard API is
 * promise-based and rejects when the document is not focused or permission is
 * refused, so the failure path is handled rather than left to throw into the
 * console unseen.
 */
export default function CopyButton({ value, label = "Copy", copiedLabel = "Copied", className = "" }) {
  const [state, setState] = useState("idle");
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  async function copy() {
    clearTimeout(timerRef.current);
    try {
      await navigator.clipboard.writeText(value);
      setState("copied");
    } catch {
      setState("failed");
    }
    timerRef.current = setTimeout(() => setState("idle"), 2000);
  }

  const icon =
    state === "copied" ? "fa-check" : state === "failed" ? "fa-triangle-exclamation" : "fa-copy";
  const text =
    state === "copied" ? copiedLabel : state === "failed" ? "Press Ctrl+C" : label;

  return (
    <button
      type="button"
      className={"copy-btn" + (state === "copied" ? " is-copied" : "") + " " + className}
      onClick={copy}
    >
      <i className={"fa-solid " + icon} aria-hidden="true"></i>
      <span>{text}</span>
      {/* Announced on change; the icon swap alone is silent to a screen reader. */}
      <span className="sr-only" role="status" aria-live="polite">
        {state === "copied" ? "Copied to clipboard" : ""}
      </span>
    </button>
  );
}
