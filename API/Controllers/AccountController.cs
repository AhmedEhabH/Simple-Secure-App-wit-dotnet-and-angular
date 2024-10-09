using API.Dtos;
using API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using RestSharp;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Security.Claims;
using System.Text;

namespace API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[Controller]")]
    public class AccountController(ILogger<AccountController> logger, UserManager<AppUser> userManager, RoleManager<IdentityRole> roleManager, IConfiguration config) : ControllerBase
    {
        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<ActionResult<string>> Register(RegisterDto registerDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = new AppUser
            {
                Email = registerDto.Email,
                FullName = registerDto.FullName,
                UserName = registerDto.Email
            };

            var result = await userManager.CreateAsync(user, registerDto.Password);

            if (!result.Succeeded)
            {
                logger.LogWarning($"Failed to register {registerDto.Email}", user);
                logger.LogWarning($"Errors: ");
                foreach (var error in result.Errors)
                {
                    logger.LogWarning($"{error}");
                }
                return BadRequest(result.Errors);
            }

            if (registerDto.Roles is null)
            {
                await userManager.AddToRoleAsync(user, "User");
            }
            else
            {
                foreach (var role in registerDto.Roles)
                {
                    await userManager.AddToRoleAsync(user, role);
                }
            }

            return Ok(new AuthResponseDto
            {
                IsSuccess = true,
                Message = "Account Created Successfully!"
            });
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login(LoginDto loginDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await userManager.FindByEmailAsync(loginDto.Email);

            if (user is null)
            {
                return Unauthorized(new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = "User not found with this email"
                });
            }

            var result = await userManager.CheckPasswordAsync(user, loginDto.Password);

            if (!result)
            {
                return Unauthorized(new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = "Invalid password"
                });
            }

            var token = GenerateToken(user);

            return Ok(new AuthResponseDto
            {
                IsSuccess = true,
                Token = token,
                Message = "Login Success"

            });
        }

        [Authorize]
        [HttpGet("detail")]
        public async Task<ActionResult<UserDetailDto>> GetUserDetail()
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await userManager.FindByIdAsync(currentUserId!);

            if (user is null)
            {
                return NotFound(new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = "User not found"
                });
            }

            return Ok(new UserDetailDto
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                Roles = [.. await userManager.GetRolesAsync(user)],
                PhoneNumber = user.PhoneNumber,
                PhoneNumberConfirmed = user.PhoneNumberConfirmed,
                AccessFailedCount = user.AccessFailedCount,
            });
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDetailDto>>> GetUsers()
        {
            var users = await userManager.Users.Select(u => new UserDetailDto
            {
                Id = u.Id,
                Email = u.Email,
                FullName = u.FullName,
                Roles = userManager.GetRolesAsync(u).Result.ToArray(),
            }).ToListAsync();

            return Ok(users);
        }

        [AllowAnonymous]
        [HttpPost("forget-password")]
        public async Task<ActionResult> ForgetPassword(ForgetPasswordDto forgetPasswordDto)
        {
            var user = await userManager.FindByEmailAsync(forgetPasswordDto.Email);

            if (user is null) { return NotFound(new AuthResponseDto { IsSuccess = false, Message = "User does not exist with this mail" }); }

            var token = await userManager.GeneratePasswordResetTokenAsync(user);

            var resetLink = $"{config.GetSection("ClientURL").Value!}/reset-password?email={user.Email}&token={WebUtility.UrlEncode(token)}";

            //using RestSharp;

            //var client = new RestClient("https://send.api.mailtrap.io/api/send");
            //var request = new RestRequest();
            //request.AddHeader("Authorization", "Bearer 01b0e0af132b6f4db14acfdc225063d8");
            //request.AddHeader("Content-Type", "application/json");
            //request.AddParameter("application/json", "{\"from\":{\"email\":\"hello@demomailtrap.com\",\"name\":\"Mailtrap Test\"},\"to\":[{\"email\":\"nabil.sup1990@gmail.com\"}],\"template_uuid\":\"29d7fb66-969d-4c4f-884a-e9d72a71578e\",\"template_variables\":{\"user_email\":\"Test_User_email\",\"pass_reset_link\":\"Test_Pass_reset_link\"}}", ParameterType.RequestBody);
            //var response = client.Post(request);
            //System.Console.WriteLine(response.Content);


            var client = new RestClient("https://send.api.mailtrap.io/api/send");

            var request = new RestRequest
            {
                Method = Method.Post,
                RequestFormat = DataFormat.Json,
            };

            request.AddHeader("Authorization", "Bearer 01b0e0af132b6f4db14acfdc225063d8");
            request.AddJsonBody(new
            {
                from = new { email = "mailtrap@demomailtrap.com" },
                to = new[] { new { email = user.Email } },
                template_uuid = "29d7fb66-969d-4c4f-884a-e9d72a71578e",
                template_variables = new { user_email = user.Email, pass_reset_link = resetLink }


            });

            var response = client.Execute(request);

            if (response.IsSuccessful)
            {
                return Ok(new AuthResponseDto
                {
                    IsSuccess = true,
                    Message = "Email sent with password reset link. Please check your mail."
                });
            }
            else
            {
                return BadRequest(new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = response.Content!.ToString()
                });
            }
        }

        [AllowAnonymous]
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword(ResetPasswordDto resetPasswordDto)
        {
            var user = await userManager.FindByEmailAsync(resetPasswordDto.Email);

            if (user is null)
            {
                return BadRequest(new AuthResponseDto { IsSuccess = false, Message = "User does not exist with this email address." });
            }
            //resetPasswordDto.Token = WebUtility.UrlDecode(resetPasswordDto.Token);
            var result = await userManager.ResetPasswordAsync(user, resetPasswordDto.Token, resetPasswordDto.NewPassword);

            if (result.Succeeded)
            {
                return Ok(new AuthResponseDto
                {
                    IsSuccess = true,
                    Message = "Password reset successfully"
                });
            }

            return BadRequest(new AuthResponseDto
            {
                IsSuccess = false,
                Message = result.Errors.FirstOrDefault()!.Description
            });
        }

        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword(ChangePasswordDto changePasswordDto)
        {
            var user = await userManager.FindByEmailAsync(changePasswordDto.Email);

            if (user is null)
            {
                return BadRequest(new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = "User does not exist with this email address."
                });
            }

            var result = await userManager.ChangePasswordAsync(user, changePasswordDto.CurrentPassword, changePasswordDto.NewPassword);

            if (result.Succeeded)
            {
                return Ok(new AuthResponseDto
                {
                    IsSuccess = true,
                    Message = "Password changed successfully"
                });
            }

            return BadRequest(new AuthResponseDto
            {
                IsSuccess = false,
                Message = result.Errors.FirstOrDefault()!.Description
            });


        }

        private string GenerateToken(AppUser user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();

            var key = Encoding.ASCII.GetBytes(config.GetSection("JWTSetting:securityKey").Value!);

            var roles = userManager.GetRolesAsync(user).Result;

            List<Claim> claims = [
                new(JwtRegisteredClaimNames.Email, user.Email ?? ""),
                new(JwtRegisteredClaimNames.Name, user.FullName ?? ""),
                new(JwtRegisteredClaimNames.NameId, user.Id ?? ""),
                new(JwtRegisteredClaimNames.Aud, config.GetSection("JWTSetting:ValidAudience").Value!),
                new(JwtRegisteredClaimNames.Iss, config.GetSection("JWTSetting:ValidIssuer").Value!)
            ];


            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }


            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddDays(1),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }

    }
}
