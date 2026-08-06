import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="empty-state" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <i className="fa-solid fa-compass"></i>
      <h4>Page not found</h4>
      <p>That page doesn't exist. <Link to="/">Go home</Link>.</p>
    </div>
  );
}
