using API.Dtos;
using API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/[Controller]")]
    public class RolesController(RoleManager<IdentityRole> roleManager, UserManager<AppUser> userManager) : ControllerBase
    {
        [HttpPost]
        public async Task<IActionResult> CreateRole([FromBody] CreateRoleDto createRoleDto)
        {
            if (string.IsNullOrEmpty(createRoleDto.RoleName))
            {
                return BadRequest("Role Name is required");
            }

            var roleExist = await roleManager.RoleExistsAsync(createRoleDto.RoleName);

            if (roleExist)
            {
                return BadRequest("Role already exist");
            }

            var roleResult = await roleManager.CreateAsync(new IdentityRole(createRoleDto.RoleName));

            if (roleResult.Succeeded)
            {
                return Ok(new { message = "Role Created successfully" });
            }
            return BadRequest("Role creation failed");
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<RoleResponseDto>>> GetRoles()
        {
            var roles = await roleManager.Roles.Select(r => new RoleResponseDto
            {
                Id = r.Id,
                Name = r.Name,
                TotalUsers = userManager.GetUsersInRoleAsync(r.Name!).Result.Count,
            }).ToListAsync();

            return Ok(roles);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRole(string id)
        {
            var role = await roleManager.FindByIdAsync(id);

            if (role is null)
            {
                return NotFound("Role Not Found");
            }

            var result = await roleManager.DeleteAsync(role);

            if (result.Succeeded)
            {
                return Ok(new { message = "Role deleted successfully" });
            }

            return BadRequest("Role deletion failed");
        }

        [HttpPost("assign")]
        public async Task<IActionResult> AssignRole([FromBody] RoleAssignDto roleAssignDto)
        {
            var user = await userManager.FindByIdAsync(roleAssignDto.UserId);
            if (user is null)
            {
                return NotFound("User not found");
            }

            var role = await roleManager.FindByIdAsync(roleAssignDto.RoleId);
            if (role is null)
            {
                return NotFound("Role not found");
            }

            var result = await userManager.AddToRoleAsync(user, role.Name!);
            if (result.Succeeded)
            {
                return Ok(new {message="Role assigned successfully"});
            }

            var error = result.Errors.FirstOrDefault();

            return BadRequest(error!.Description);
        }
    }
}
