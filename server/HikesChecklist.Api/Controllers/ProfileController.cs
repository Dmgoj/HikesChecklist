using System.Security.Claims;
using HikesChecklist.Api.Dtos;
using HikesChecklist.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace HikesChecklist.Api.Controllers;

[ApiController]
[Route("api/profile")]
[Authorize]
public class ProfileController(UserManager<ApplicationUser> userManager, IWebHostEnvironment env) : ControllerBase
{
    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg", ".jpeg", ".png", ".gif", ".webp"
    };

    private const long MaxFileSizeBytes = 5 * 1024 * 1024;

    // Magic-byte checks so a renamed non-image file can't pass extension-only validation.
    private static bool MatchesDeclaredImageType(ReadOnlySpan<byte> header, string extension)
    {
        return extension switch
        {
            ".jpg" or ".jpeg" => header.Length >= 3 && header[0] == 0xFF && header[1] == 0xD8 && header[2] == 0xFF,
            ".png" => header.Length >= 8
                && header[..8].SequenceEqual(new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A }),
            ".gif" => header.Length >= 4 && header[..4].SequenceEqual("GIF8"u8),
            ".webp" => header.Length >= 12
                && header[..4].SequenceEqual("RIFF"u8)
                && header.Slice(8, 4).SequenceEqual("WEBP"u8),
            _ => false
        };
    }

    private string CurrentUserId =>
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? throw new InvalidOperationException("User id claim is missing.");

    private string UploadsDirectory => Path.Combine(env.ContentRootPath, "App_Data", "avatars");

    private ProfileDto ToDto(ApplicationUser user)
    {
        var pictureUrl = user.ProfilePicturePath is null
            ? null
            : $"/api/profile/{user.Id}/avatar";

        return new ProfileDto(user.Email!, user.FirstName, user.LastName, pictureUrl);
    }

    [HttpGet]
    public async Task<ActionResult<ProfileDto>> GetProfile()
    {
        var user = await userManager.FindByIdAsync(CurrentUserId);
        if (user is null)
        {
            return NotFound();
        }

        return Ok(ToDto(user));
    }

    [HttpPut]
    public async Task<ActionResult<ProfileDto>> UpdateProfile(UpdateProfileRequest request)
    {
        var user = await userManager.FindByIdAsync(CurrentUserId);
        if (user is null)
        {
            return NotFound();
        }

        user.FirstName = string.IsNullOrWhiteSpace(request.FirstName) ? null : request.FirstName.Trim();
        user.LastName = string.IsNullOrWhiteSpace(request.LastName) ? null : request.LastName.Trim();

        await userManager.UpdateAsync(user);

        return Ok(ToDto(user));
    }

    [HttpPost("picture")]
    public async Task<ActionResult<ProfileDto>> UploadPicture(IFormFile file)
    {
        if (file.Length == 0)
        {
            return BadRequest("No file uploaded.");
        }

        if (file.Length > MaxFileSizeBytes)
        {
            return BadRequest("File is too large. Maximum size is 5MB.");
        }

        var extension = Path.GetExtension(file.FileName);
        if (!AllowedExtensions.Contains(extension))
        {
            return BadRequest("Unsupported file type. Allowed: jpg, jpeg, png, gif, webp.");
        }

        var header = new byte[12];
        int bytesRead;
        await using (var headerStream = file.OpenReadStream())
        {
            bytesRead = await headerStream.ReadAsync(header.AsMemory(0, header.Length));
        }

        if (!MatchesDeclaredImageType(header.AsSpan(0, bytesRead), extension.ToLowerInvariant()))
        {
            return BadRequest("File content does not match its declared image type.");
        }

        var user = await userManager.FindByIdAsync(CurrentUserId);
        if (user is null)
        {
            return NotFound();
        }

        Directory.CreateDirectory(UploadsDirectory);

        var previousPath = user.ProfilePicturePath;

        var fileName = $"{user.Id}{extension}";
        var filePath = Path.Combine(UploadsDirectory, fileName);

        await using (var stream = System.IO.File.Create(filePath))
        {
            await file.CopyToAsync(stream);
        }

        user.ProfilePicturePath = fileName;
        await userManager.UpdateAsync(user);

        if (previousPath is not null && previousPath != fileName)
        {
            var previousFilePath = Path.Combine(UploadsDirectory, previousPath);
            if (System.IO.File.Exists(previousFilePath))
            {
                System.IO.File.Delete(previousFilePath);
            }
        }

        return Ok(ToDto(user));
    }

    [HttpGet("{userId}/avatar")]
    [AllowAnonymous]
    public async Task<IActionResult> GetAvatar(string userId)
    {
        var user = await userManager.FindByIdAsync(userId);
        if (user?.ProfilePicturePath is null)
        {
            return NotFound();
        }

        var filePath = Path.Combine(UploadsDirectory, user.ProfilePicturePath);
        if (!System.IO.File.Exists(filePath))
        {
            return NotFound();
        }

        var extension = Path.GetExtension(filePath).ToLowerInvariant();
        var contentType = extension switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".gif" => "image/gif",
            ".webp" => "image/webp",
            _ => "application/octet-stream"
        };

        var bytes = await System.IO.File.ReadAllBytesAsync(filePath);
        return File(bytes, contentType);
    }
}
