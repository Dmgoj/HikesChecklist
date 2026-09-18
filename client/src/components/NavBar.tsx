import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export function NavBar() {
  const { isAuthenticated, email, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav style={{ display: "flex", gap: "1rem", padding: "1rem", borderBottom: "1px solid #ccc" }}>
      <Link to="/">Search</Link>
      {isAuthenticated && <Link to="/visited">My Visited Peaks</Link>}
      <div style={{ marginLeft: "auto", display: "flex", gap: "1rem" }}>
        {isAuthenticated ? (
          <>
            <span>{email}</span>
            <button onClick={handleLogout}>Log out</button>
          </>
        ) : (
          <>
            <Link to="/login">Log in</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
