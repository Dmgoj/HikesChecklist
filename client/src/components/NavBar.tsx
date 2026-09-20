import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { toAbsolutePictureUrl } from "../api/profileApi";

export function NavBar() {
  const { isAuthenticated, displayName, profile, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav style={{ display: "flex", gap: "1rem", padding: "1rem", borderBottom: "1px solid #ccc", alignItems: "center" }}>
      <Link to="/">Search</Link>
      {isAuthenticated && <Link to="/visited">My Visited Peaks</Link>}
      {isAuthenticated && <Link to="/bucket-list">Bucket List</Link>}
      <div style={{ marginLeft: "auto", display: "flex", gap: "1rem", alignItems: "center" }}>
        {isAuthenticated ? (
          <>
            <Link to="/profile" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              {profile?.profilePictureUrl && (
                <img
                  src={toAbsolutePictureUrl(profile.profilePictureUrl) ?? undefined}
                  alt=""
                  style={{ width: 24, height: 24, borderRadius: "50%", objectFit: "cover" }}
                />
              )}
              <span>{displayName}</span>
            </Link>
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
