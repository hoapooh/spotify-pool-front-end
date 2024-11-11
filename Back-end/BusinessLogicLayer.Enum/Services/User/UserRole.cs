﻿using System.Runtime.Serialization;

namespace SetupLayer.Enum.Services.User
{
    public enum UserRole
    {
        [EnumMember(Value = "Super Admin")]
        SuperAdmin,
        [EnumMember(Value = "Admin")]
        Admin,
        [EnumMember(Value = "Artist")]
        Artist,
        [EnumMember(Value = "Customer")]
        Customer
    }
}
