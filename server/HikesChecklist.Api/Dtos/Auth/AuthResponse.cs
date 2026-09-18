namespace HikesChecklist.Api.Dtos.Auth;

public record AuthResponse(string Token, DateTime ExpiresAt, string Email);
