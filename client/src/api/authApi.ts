import { apiFetch } from "./client";
import type { AuthResponse } from "../types";

export function register(email: string, password: string): Promise<{ userId: string; email: string }> {
  return apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function login(email: string, password: string): Promise<AuthResponse> {
  return apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}
