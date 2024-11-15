﻿using Business_Logic_Layer.Services_Interface.Users;
using BusinessLogicLayer.ModelView.Service_Model_Views.Users.Request;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SetupLayer.Enum.Services.User;

namespace SpotifyPool._1._Controllers.Users
{
    [Route("api/v1/users")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)] // "Bearer"
    public class UserController(IUserBLL userBLL) : ControllerBase
    {
        private readonly IUserBLL _userBLL = userBLL;

        //[Authorize(Roles = nameof(UserRole.Admin)), HttpGet]
        //public async Task<IActionResult> GetAllUsersAsync([FromQuery] string? fullname, [FromQuery] UserGender gender, [FromQuery] string? email)
        //{
        //    var users = await _userBLL.GetAllUsersAsync(fullname, gender, email);
        //    return Ok(users);
        //}

        //[Authorize(Roles = nameof(UserRole.Admin)), HttpGet("{id}")]
        //public async Task<IActionResult> GetUserByIDAsync(string id)
        //{
        //    var user = await _userBLL.GetUserByIDAsync(id, true);
        //    return Ok(user);
        //}

        [Authorize(Roles = $"{nameof(UserRole.Customer)},{nameof(UserRole.Admin)}"), HttpPut("edit-profile")]
        public async Task<IActionResult> EditProfileAsync([FromForm] EditProfileRequestModel request)
		{
			await _userBLL.EditProfileAsync(request);
			return Ok("Update profile successfully!");
		}

        /// <summary>
        /// Phân trang cho Users
        /// </summary>
        /// <param name="offset">Trang thứ n</param>
        /// <param name="limit">Số lượng phần tử</param>
        /// <returns></returns>
        [Authorize(Roles = nameof(UserRole.Admin)), HttpGet("get-user-paging")]
		public async Task<IActionResult> GetUserPagingAsync([FromQuery] int offset = 1, [FromQuery] int limit = 5)
		{
			var users = await _userBLL.TestPaging(offset, limit);
			return Ok(users);
		}
    }
}
