﻿//using Data_Access_Layer.Implement.UnitOfWork;
//using DataAccessLayer.Interface.Interface.IUnitOfWork;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System.Text;
using BusinessLogicLayer.Implement.CustomExceptions;
using BusinessLogicLayer.Implement.Microservices.Cloudinaries;
using CloudinaryDotNet;
using DataAccessLayer.Repository.Database_Context.MongoDB.SpotifyPool;
using BusinessLogicLayer.Implement.Microservices.EmailSender;
using BusinessLogicLayer.Implement.Microservices.JIRA_REST_API.Issues;
using BusinessLogicLayer.Implement.Services.Authentication;
using BusinessLogicLayer.Implement.Services.JWTs;
using BusinessLogicLayer.Interface.Microservices_Interface.EmailSender;
using BusinessLogicLayer.Interface.Services_Interface.Authentication;
using BusinessLogicLayer.Interface.Services_Interface.JWTs;
using BusinessLogicLayer.Setting.Microservices.EmailSender;
using DataAccessLayer.Repository.Entities;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;
using MongoDB.Bson;
using Microsoft.AspNetCore.Authentication;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.OpenApi.Models;
using BusinessLogicLayer.Setting.Microservices.Jira;

namespace BusinessLogicLayer.DependencyInjection.Dependency_Injections
{
    public static class BusinessDependencyInjection
    {
        public static void AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            // Register IHttpContextAccessor
            services.AddHttpContextAccessor();

            // Database
            services.AddDatabase(configuration);

            // AutoMapper
            services.AddAutoMapper();

            // Services
            services.AddServices(configuration);
            services.AddEmailSender(configuration);
            services.AddJWT(configuration);
            services.AddAuthorization();
            services.AddJiraClient(configuration);
            services.AddIdentity(configuration);

            // Microservices
            services.AddCloudinary(configuration);

            // Repositories
            //services.AddRepositories();
        }

        public static void AddServices(this IServiceCollection services, IConfiguration configuration)
        {
            // Register BLL services
            services.AddScoped<IAuthenticationBLL, AuthenticationBLL>();
        }

        //public static void AddRepositories(this IServiceCollection services)
        //{
        //    services.AddScoped<IUnitOfWork, UnitOfWork>();
        //}

        public static void AddEmailSender(this IServiceCollection services, IConfiguration configuration)
        {
            var smtpSettings = new SmtpSettings()
            {
                Host = Environment.GetEnvironmentVariable("EMAIL_SMTP_HOST"),
                Port = Environment.GetEnvironmentVariable("EMAIL_SMTP_PORT"),
                Username = Environment.GetEnvironmentVariable("EMAIL_SMTP_USERNAME"),
                Password = Environment.GetEnvironmentVariable("EMAIL_SMTP_PASSWORD")
            };

            var emailSenderSetting = new EmailSenderSetting()
            {
                Smtp = smtpSettings,
                FromAddress = Environment.GetEnvironmentVariable("EMAIL_FROMADDRESS"),
                FromName = Environment.GetEnvironmentVariable("EMAIL_FROMNAME")
            };

            // Register the EmailSenderSetting with DI
            services.AddSingleton(emailSenderSetting);

            // Register the EmailSender service
            services.AddScoped<IEmailSenderCustom, EmailSender>();
        }

        public static void AddJWT(this IServiceCollection services, IConfiguration configuration)
        {
            // Config JWT
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "Spotify Pool", Version = "v1" });

                // Add JWT Authentication
                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.ApiKey,
                    Scheme = "Bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Description = "Enter 'Bearer' [space] and then your token",
                });
                c.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        Array.Empty<string>()
                    }
                });
            });

            services.AddTransient<IJwtBLL, JwtBLL>();
        }

        public static void AddAuthorization(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddAuthorizationBuilder().AddPolicy("GoogleOrJwt", policy =>
            {
                policy.AddAuthenticationSchemes(GoogleDefaults.AuthenticationScheme, JwtBearerDefaults.AuthenticationScheme);
                policy.RequireAuthenticatedUser();
            });
        }

        public static void AddAuthentication(this IServiceCollection services, IConfiguration configuration)
        {
            // Config the Google Identity
            services.AddAuthentication(options =>
            {
                options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
                //options.DefaultChallengeScheme = GoogleDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = CookieAuthenticationDefaults.AuthenticationScheme;

                //options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                //options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                //options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
            }).AddCookie("Cookies").AddGoogle(options =>
            {
                options.ClientId = Environment.GetEnvironmentVariable("Authentication_Google_ClientId") ?? throw new DataNotFoundCustomException("Client ID property is not set in environment or not found");
                options.ClientSecret = Environment.GetEnvironmentVariable("Authentication_Google_ClientSecret") ?? throw new DataNotFoundCustomException("Client Secret property is not set in environment or not found");
                options.CallbackPath = "/api/authentication/signin-google"; // Đường dẫn Google sẽ chuyển hướng sau khi xác thực

                options.Scope.Add("profile");
                options.Scope.Add("email");
                options.Scope.Add("openid");

                options.ClaimActions.MapJsonKey("urn:google:picture", "picture", "url");
            }).AddJwtBearer(opt =>
            {
                opt.TokenValidationParameters = new TokenValidationParameters
                {
                    //tự cấp token
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateLifetime = true,

                    //ký vào token
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable("JWTSettings_SecretKey") ?? throw new DataNotFoundCustomException("JWT's Secret Key property is not set in environment or not found"))),

                    ClockSkew = TimeSpan.Zero
                };
            });
        }

        public static void AddIdentity(this IServiceCollection services, IConfiguration configuration)
        {
            // Add Identity
            services.AddIdentity<User, Roles>()
                .AddMongoDbStores<User, Roles, ObjectId>
                (
                    Environment.GetEnvironmentVariable("MONGODB_CONNECTION_STRING"),
                    Environment.GetEnvironmentVariable("MONGODB_DATABASE_NAME")
                )
                .AddDefaultTokenProviders();
        }

        public static void AddJiraClient(this IServiceCollection services, IConfiguration configuration)
        {
            // Config the Jira Client (REST API)
            var jiraSetting = new JiraSetting()
            {
                UserName = Environment.GetEnvironmentVariable("JiraSettings_AtlassianUsername"),
                ApiKey = Environment.GetEnvironmentVariable("JiraSettings_AtlassianApiKey"),
                Domain = Environment.GetEnvironmentVariable("JiraSettings_Domain")
            };

            // Register the JiraSetting with DI
            services.AddSingleton(jiraSetting);

            // Register Jira Cloud REST API Client
            services.AddSingleton<IssueClient>();
        }

        public static void AddCloudinary(this IServiceCollection services, IConfiguration configuration)
        {
            // Get the Cloudinary URL from the environment variables loaded by .env
            string? cloudinaryUrl = Environment.GetEnvironmentVariable("CLOUDINARY_URL");
            if (string.IsNullOrEmpty(cloudinaryUrl))
            {
                throw new DataNotFoundCustomException("Cloudinary URL is not set in the environment variables");
            }

            // Initialize Cloudinary instance
            Cloudinary cloudinary = new(cloudinaryUrl)
            {
                Api = { Secure = true }
            };

            // Register Cloudinary in DI container as a scoped service
            services.AddScoped(provider => cloudinary);
            services.AddScoped<CloudinaryService>();
        }

        // Config the database
        public static void AddDatabase(this IServiceCollection services, IConfiguration configuration)
        {
            //services.Configure<MongoDBSetting>(configuration.GetSection("MongoDBSettings"));
            //services.AddSingleton<SpotifyPoolDBContext>();

            // Load MongoDB settings from environment variables
            var connectionString = Environment.GetEnvironmentVariable("MONGODB_CONNECTION_STRING");
            var databaseName = Environment.GetEnvironmentVariable("MONGODB_DATABASE_NAME");

            if (string.IsNullOrEmpty(connectionString) || string.IsNullOrEmpty(databaseName))
            {
                throw new DataNotFoundCustomException("MongoDB connection string or database name is not set in environment variables");
            }

            // Register the MongoDB settings as a singleton
            var mongoDbSettings = new MongoDBSetting
            {
                ConnectionString = connectionString,
                DatabaseName = databaseName
            };

            // Register the MongoDB context (or client)
            services.AddSingleton(mongoDbSettings);
            services.AddSingleton<SpotifyPoolDBContext>();
        }

        // Add AutoMapper configuration using Assembly
        public static void AddAutoMapper(this IServiceCollection services)
        {
            services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());
        }
    }
}
