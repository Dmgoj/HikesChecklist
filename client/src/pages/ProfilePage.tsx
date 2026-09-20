import { useEffect, useState, type FormEvent } from "react";
import { getProfile, updateProfile, uploadProfilePicture, toAbsolutePictureUrl } from "../api/profileApi";
import { useAuth } from "../auth/useAuth";
import { ApiError } from "../api/client";

export function ProfilePage() {
  const { setProfile } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [pictureUrl, setPictureUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getProfile()
      .then((profile) => {
        setFirstName(profile.firstName ?? "");
        setLastName(profile.lastName ?? "");
        setPictureUrl(profile.profilePictureUrl);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSaving(true);
    try {
      const profile = await updateProfile(firstName.trim(), lastName.trim());
      setProfile(profile);
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePictureChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);
    try {
      const profile = await uploadProfilePicture(file);
      setPictureUrl(profile.profilePictureUrl);
      setProfile(profile);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not upload picture.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto" }}>
      <h1>My Profile</h1>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
        {pictureUrl ? (
          <img
            src={toAbsolutePictureUrl(pictureUrl) ?? undefined}
            alt="Profile"
            style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "#eee",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#888",
              fontSize: "0.8em",
            }}
          >
            No photo
          </div>
        )}
        <div>
          <input type="file" accept="image/png,image/jpeg,image/gif,image/webp" onChange={handlePictureChange} disabled={uploading} />
          {uploading && <p>Uploading...</p>}
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <label>
          First name
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            style={{ display: "block", width: "100%", padding: "0.5rem" }}
          />
        </label>
        <label>
          Last name
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            style={{ display: "block", width: "100%", padding: "0.5rem" }}
          />
        </label>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {saved && <p style={{ color: "green" }}>Saved.</p>}
        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
}
