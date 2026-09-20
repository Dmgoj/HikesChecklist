using Microsoft.AspNetCore.Identity;

namespace HikesChecklist.Api.Models;

public class ApplicationUser : IdentityUser
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? ProfilePicturePath { get; set; }
}
