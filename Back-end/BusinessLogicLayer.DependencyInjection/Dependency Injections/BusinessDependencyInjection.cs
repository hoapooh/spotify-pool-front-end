﻿using Microsoft.Extensions.Configuration;
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
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.OpenApi.Models;
using Business_Logic_Layer.Services_Interface.InMemoryCache;
using BusinessLogicLayer.Implement.Services.InMemoryCache;
using Business_Logic_Layer.Services_Interface.Users;
using BusinessLogicLayer.Implement.Services.Users;
using MongoDB.Driver;
using System.Diagnostics;
using BusinessLogicLayer.Interface.Microservices_Interface.Spotify;
using BusinessLogicLayer.Implement.Microservices.Spotify;
using System.Reflection;
using Hellang.Middleware.ProblemDetails;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Utility.Coding;
using Microsoft.Extensions.Logging;
using BusinessLogicLayer.Implement.Microservices.Geolocation;
using BusinessLogicLayer.Interface.Microservices_Interface.Geolocation;
using DataAccessLayer.Implement.MongoDB.UOW;
using DataAccessLayer.Interface.MongoDB.UOW;
using SetupLayer.Setting.Microservices.Geolocation;
using SetupLayer.Setting.Microservices.EmailSender;
using SetupLayer.Setting.Microservices.Jira;
using SetupLayer.Setting.Database;
using BusinessLogicLayer.Interface.Services_Interface.Tracks;
using BusinessLogicLayer.Implement.Services.Tracks;
using System.Security.Claims;
using MongoDB.Bson.Serialization;
using SetupLayer.Enum.Services.Playlist;
using SetupLayer.Enum.Services.User;
using SetupLayer.Enum.Microservices.Cloudinary;
using BusinessLogicLayer.Implement.Services.Tests;
using BusinessLogicLayer.Interface.Services_Interface.BackgroundJobs.EmailSender;
using System.Threading.Channels;
using BusinessLogicLayer.Implement.Services.BackgroundJobs.EmailSender;
using SetupLayer.Enum.Services.Track;
using BusinessLogicLayer.Interface.Microservices_Interface.Genius;
using BusinessLogicLayer.Implement.Microservices.Genius;
using SetupLayer.Setting.Microservices.Genius;
using SetupLayer.Setting.Microservices.Spotify;
using SetupLayer.Enum.EnumMember;
using BusinessLogicLayer.Interface.Services_Interface.Recommendation;
using BusinessLogicLayer.Implement.Services.Recommendation;
using DataAccessLayer.Implement.MongoDB.Generic_Repository;
using DataAccessLayer.Interface.MongoDB.Generic_Repository;
using BusinessLogicLayer.Implement.Services.Playlists.Custom;
using BusinessLogicLayer.Interface.Services_Interface.Playlists.Custom;

namespace BusinessLogicLayer.DependencyInjection.Dependency_Injections
{
    public static class BusinessDependencyInjection
    {
        private static readonly ILogger _logger;

        static BusinessDependencyInjection()
        {
            // Initialize the logger
            var loggerFactory = LoggerFactory.Create(builder =>
            {
                builder.AddConsole(); // You can add other logging providers like file, etc.
            });
            _logger = loggerFactory.CreateLogger("BusinessDependencyInjectionLogger");
        }

        public static void AddBusinessInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            var stopwatch = new Stopwatch();

            // Register HttpClient
            stopwatch.Start();
            services.AddHttpClient();
            stopwatch.Stop();
            Console.WriteLine($"AddHttpClient took {stopwatch.ElapsedMilliseconds} ms");

            // Register IHttpContextAccessor
            stopwatch.Start();
            services.AddHttpContextAccessor();
            stopwatch.Stop();
            Console.WriteLine($"AddHttpContextAccessor took {stopwatch.ElapsedMilliseconds} ms");

            // Database
            stopwatch.Restart();
            services.AddDatabase();
            stopwatch.Stop();
            Console.WriteLine($"AddDatabase took {stopwatch.ElapsedMilliseconds} ms");

            // AutoMapper
            stopwatch.Restart();
            services.AddAutoMapper();
            stopwatch.Stop();
            Console.WriteLine($"AddAutoMapper took {stopwatch.ElapsedMilliseconds} ms");

            // Register other services...
            stopwatch.Restart();
            services.AddServices(configuration);
            stopwatch.Stop();
            Console.WriteLine($"AddServices took {stopwatch.ElapsedMilliseconds} ms");

            stopwatch.Restart();
            services.AddEmailSender();
            stopwatch.Stop();
            Console.WriteLine($"AddEmailSender took {stopwatch.ElapsedMilliseconds} ms");

            stopwatch.Restart();
            services.AddJWT();
            stopwatch.Stop();
            Console.WriteLine($"AddJWT took {stopwatch.ElapsedMilliseconds} ms");

            stopwatch.Restart();
            services.AddAuthorization();
            stopwatch.Stop();
            Console.WriteLine($"AddAuthorization took {stopwatch.ElapsedMilliseconds} ms");

            stopwatch.Restart();
            services.AddJiraClient();
            stopwatch.Stop();
            Console.WriteLine($"AddJiraClient took {stopwatch.ElapsedMilliseconds} ms");

            // Cloudinary
            stopwatch.Restart();
            services.AddCloudinary(configuration);
            stopwatch.Stop();
            Console.WriteLine($"AddCloudinary took {stopwatch.ElapsedMilliseconds} ms");

            // Spotify
            stopwatch.Restart();
            services.AddSpotify();
            stopwatch.Stop();
            Console.WriteLine($"AddSpotify took {stopwatch.ElapsedMilliseconds} ms");

            // Geolocation
            stopwatch.Restart();
            services.AddGeolocation();
            stopwatch.Stop();
            Console.WriteLine($"AddGeolocation took {stopwatch.ElapsedMilliseconds} ms");

            // Genius
            stopwatch.Restart();
            services.AddGenius();
            stopwatch.Stop();

            // Hub (SignalR)
            stopwatch.Restart();
            services.AddSignalR();
            stopwatch.Stop();
            Console.WriteLine($"AddSignalR took {stopwatch.ElapsedMilliseconds} ms");

            // Caching (In-memory cache)
            stopwatch.Restart();
            services.AddMemoryCache(configuration);
            stopwatch.Stop();
            Console.WriteLine($"AddMemoryCache took {stopwatch.ElapsedMilliseconds} ms");

            // EnumMemberSerializer
            stopwatch.Restart();
            services.AddEnumMemberSerializer();
            stopwatch.Stop();
            Console.WriteLine($"AddEnumMemberSerializer took {stopwatch.ElapsedMilliseconds} ms");

            // Problem Details
            stopwatch.Restart();
            services.AddProblemDetails();
            stopwatch.Stop();
            Console.WriteLine($"ProblemDetails took {stopwatch.ElapsedMilliseconds} ms");

            // Config Session HtppContext
            stopwatch.Restart();
            services.AddDistributedMemoryCache();
            stopwatch.Stop();
            Console.WriteLine($"AddDistributedMemoryCache took {stopwatch.ElapsedMilliseconds} ms");

            stopwatch.Restart();
            services.AddSession(options =>
            {
                options.Cookie.HttpOnly = true;
                options.Cookie.IsEssential = true;
                options.Cookie.SameSite = SameSiteMode.None; // Cần thiết cho cross-origin
                options.Cookie.SecurePolicy = CookieSecurePolicy.None; // Hoặc Always nếu dùng HTTPS
                options.IdleTimeout = TimeSpan.FromDays(7);
                //options.IdleTimeout = TimeSpan.FromMinutes(30);
            });
            stopwatch.Stop();
            Console.WriteLine($"AddSession took {stopwatch.ElapsedMilliseconds} ms");

            stopwatch.Restart();
            services.AddAuthentication();
            stopwatch.Stop();
            Console.WriteLine($"AddAuthentication took {stopwatch.ElapsedMilliseconds} ms");

            stopwatch.Restart();
            services.AddAuthorization();
            stopwatch.Stop();
            Console.WriteLine($"AddAuthorization took {stopwatch.ElapsedMilliseconds} ms");

            // Log an informational message
            _logger.LogInformation("Services have been configured.");
        }

        public static void AddProblemDetails(this IServiceCollection services)
        {
            services.AddProblemDetails(options =>
            {
                // Đảm bảo chi tiết lỗi không được trả về cho client
                options.IncludeExceptionDetails = (ctx, ex) => false;

                // Cấu hình trước khi trả về Response
                options.OnBeforeWriteDetails = (ctx, details) =>
                {
                    // Khởi tạo môi trường hiện tại (PaymentModel, Development, Production)
                    //IHostEnvironment env = ctx.RequestServices.GetRequiredService<IHostEnvironment>();

                    //// Inject logger
                    //var logger = ctx.RequestServices.GetRequiredService<ILogger<Program>>();

                    // Tạo TraceId
                    var traceId = ctx.TraceIdentifier;
                    details.Extensions["traceId"] = traceId;

                    // Log thông tin chi tiết của lỗi
                    _logger.LogError($"Error occurred. TraceId: {traceId}, StatusCode: {details.Status}, Title: {details.Title}, Error: {details.Detail}");
                };

                // Map các lỗi cụ thể từ custom exception
                options.Map<ArgumentNullCustomException>(ex =>
                {
                    ProblemDetails details = new()
                    {
                        Title = Util.GetTitleCustomException(ex.ParamName, "Null Reference"),
                        Status = ex.StatusCode,
                        Detail = ex.Message,
                    };

                    // Hiển thị chi tiết lỗi đầy đủ trong môi trường Development
                    _logger.LogError($"Full error details: {ex}");

                    return details;
                });

                options.Map<CustomException>(ex =>
                {
                    ProblemDetails details = new()
                    {
                        Title = ex.Title,
                        Status = ex.StatusCode,
                        Detail = ex.Message,
                    };

                    // Hiển thị chi tiết lỗi đầy đủ trong môi trường Development
                    _logger.LogError($"Full error details: {ex}");

                    return details;
                });

                options.Map<BadRequestCustomException>(ex =>
                {
                    ProblemDetails details = new()
                    {
                        Title = Util.GetTitleCustomException(ex.Title, "Bad Rquest"),
                        Status = StatusCodes.Status400BadRequest,
                        Detail = ex.Message
                    };

                    // Hiển thị chi tiết lỗi đầy đủ trong môi trường Development
                    _logger.LogError($"Full error details: {ex}");

                    return details;
                });

                options.Map<BusinessRuleViolationCustomException>(ex =>
                {
                    ProblemDetails details = new()
                    {
                        Title = "Business Rule Violation",
                        Status = StatusCodes.Status400BadRequest,
                        Detail = ex.Message
                    };

                    // Hiển thị chi tiết lỗi đầy đủ trong môi trường Development
                    _logger.LogError($"Full error details: {ex}");

                    return details;
                });

                options.Map<ConcurrencyCustomException>(ex =>
                {
                    ProblemDetails details = new()
                    {
                        Title = "Concurrency",
                        Status = StatusCodes.Status400BadRequest,
                        Detail = ex.Message
                    };

                    // Hiển thị chi tiết lỗi đầy đủ trong môi trường Development
                    _logger.LogError($"Full error details: {ex}");

                    return details;
                });

                options.Map<DataExistCustomException>(ex =>
                {
                    ProblemDetails details = new()
                    {
                        Title = "Conflict",
                        Status = StatusCodes.Status409Conflict,
                        Detail = ex.Message
                    };

                    // Hiển thị chi tiết lỗi đầy đủ trong môi trường Development
                    _logger.LogError($"Full error details: {ex}");

                    return details;
                });

                options.Map<DataNotFoundCustomException>(ex =>
                {
                    ProblemDetails details = new()
                    {
                        Title = "Data Not Found",
                        Status = StatusCodes.Status404NotFound,
                        Detail = ex.Message
                    };

                    // Hiển thị chi tiết lỗi đầy đủ trong môi trường Development
                    _logger.LogError($"Full error details: {ex}");

                    return details;
                });

                options.Map<ForbbidenCustomException>(ex =>
                {
                    ProblemDetails details = new()
                    {
                        Title = "Forbbiden",
                        Status = StatusCodes.Status403Forbidden,
                        Detail = ex.Message
                    };

                    // Hiển thị chi tiết lỗi đầy đủ trong môi trường Development
                    _logger.LogError($"Full error details: {ex}");

                    return details;
                });

                options.Map<InternalServerErrorCustomException>(ex =>
                {
                    ProblemDetails details = new()
                    {
                        Title = "Internal Server Error",
                        Status = StatusCodes.Status500InternalServerError,
                        Detail = ex.Message
                    };

                    // Hiển thị chi tiết lỗi đầy đủ trong môi trường Development
                    _logger.LogError($"Full error details: {ex}");

                    return details;
                });

                options.Map<InvalidDataCustomException>(ex =>
                {
                    ProblemDetails details = new()
                    {
                        Title = "Invalid Data",
                        Status = StatusCodes.Status400BadRequest,
                        Detail = ex.Message
                    };

                    // Hiển thị chi tiết lỗi đầy đủ trong môi trường Development
                    _logger.LogError($"Full error details: {ex}");

                    return details;
                });

                options.Map<RequestTimeoutCustomException>(ex =>
                {
                    ProblemDetails details = new()
                    {
                        Title = "Request Timeout",
                        Status = StatusCodes.Status408RequestTimeout,
                        Detail = ex.Message
                    };

                    // Hiển thị chi tiết lỗi đầy đủ trong môi trường Development
                    _logger.LogError($"Full error details: {ex}");

                    return details;
                });

                options.Map<ServiceUnavailableCustomException>(ex =>
                {
                    ProblemDetails details = new()
                    {
                        Title = "Service Unavailable",
                        Status = StatusCodes.Status503ServiceUnavailable,
                        Detail = ex.Message
                    };

                    // Hiển thị chi tiết lỗi đầy đủ trong môi trường Development
                    _logger.LogError($"Full error details: {ex}");

                    return details;
                });

                options.Map<UnAuthorizedCustomException>(ex =>
                {
                    ProblemDetails details = new()
                    {
                        Title = Util.GetTitleCustomException(ex.Title, "Unauthorized"),
                        Status = StatusCodes.Status401Unauthorized,
                        Detail = ex.Message
                    };

                    // Hiển thị chi tiết lỗi đầy đủ trong môi trường Development
                    _logger.LogError($"Full error details: {ex}");

                    return details;
                });

                // Xử lý lỗi chung chung, không bắt được loại lỗi cụ thể
                //options.MapToStatusCode<Exception>(StatusCodes.Status500InternalServerError);
                options.Map<Exception>(ex =>
                {
                    ProblemDetails details = new()
                    {
                        Title = "Internal Server Error",
                        Status = StatusCodes.Status500InternalServerError,
                        Detail = ex.Message
                    };

                    // Hiển thị chi tiết lỗi đầy đủ trong môi trường Development
                    _logger.LogError($"Full error details: {ex}");

                    return details;
                });
            });
        }

        public static void AddMemoryCache(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddMemoryCache();
            services.AddSingleton<ICacheCustom, CacheCustom>();
        }

        public static void AddServices(this IServiceCollection services, IConfiguration configuration)
        {
            // Test
            services.AddScoped<TestBLL>();

            // Register BLL services

            // Authentication
            services.AddScoped<IAuthenticationBLL, AuthenticationBLL>();

            // User
            services.AddScoped<IUserBLL, UserBLL>();

            // Track
            services.AddScoped<ITrack, TrackBLL>();

            // Favourite Playlist
            services.AddScoped<IPlaylist, PlaylistBLL>();

            // Data Reccomendation
            services.AddScoped<IRecommendation, RecommendationBLL>();
        }

        //public static void AddRepositories(this IServiceCollection services)
        //{
        //    services.AddScoped<IUnitOfWork, UnitOfWork>();
        //}

        public static void AddEmailSender(this IServiceCollection services)
        {
            SmtpSettings smtpSettings = new()
            {
                Host = Environment.GetEnvironmentVariable("EMAIL_SMTP_HOST")
                ?? throw new DataNotFoundCustomException("EMAIL_SMTP_HOST property is not set in environment or not found"),
                Port = Environment.GetEnvironmentVariable("EMAIL_SMTP_PORT")
                ?? throw new DataNotFoundCustomException("EMAIL_SMTP_PORT property is not set in environment or not found"),
                Username = Environment.GetEnvironmentVariable("EMAIL_SMTP_USERNAME")
                ?? throw new DataNotFoundCustomException("EMAIL_SMTP_USERNAME property is not set in environment or not found"),
                Password = Environment.GetEnvironmentVariable("EMAIL_SMTP_PASSWORD")
                ?? throw new DataNotFoundCustomException("EMAIL_SMTP_PASSWORD property is not set in environment or not found")
            };

            EmailSenderSetting emailSenderSetting = new()
            {
                Smtp = smtpSettings,
                FromAddress = Environment.GetEnvironmentVariable("EMAIL_FROMADDRESS")
                ?? throw new DataNotFoundCustomException("EMAIL_FROMADDRESS property is not set in environment or not found"),
                FromName = Environment.GetEnvironmentVariable("EMAIL_FROMNAME")
                ?? throw new DataNotFoundCustomException("EMAIL_FROMNAME property is not set in environment or not found")
            };

            // Register the EmailSenderSetting with DI
            services.AddSingleton(emailSenderSetting);

            // Register the EmailSender service
            services.AddSingleton<IEmailSenderCustom, EmailSender>();

            // Register the Channel<IEmailSenderCustom> service
            services.AddSingleton(Channel.CreateUnbounded<IEmailSenderCustom>());

            // Register the Background Email Sender service
            services.AddSingleton<IBackgroundEmailSender, BackgroundEmailSender>();

            // Register the BackgroundEmailSender as a hosted service
            services.AddHostedService<BackgroundEmailSender>();
        }

        public static void AddJWT(this IServiceCollection services)
        {
            // Config JWT
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "Spotify Pool",
                    Version = "v1",
                    Description = "Spotify Pool is a music service that gives you access to millions of songs and other content from artists around the world. This is just a beta version. The project will be released soon in 2025",
                    TermsOfService = new Uri("https://myfrontend.com/terms"),
                    Contact = new OpenApiContact
                    {
                        Name = "Support Team",
                        Email = "support@example.com",
                        Url = new Uri("https://myfrontend.com/support")
                    },
                    License = new OpenApiLicense
                    {
                        Name = "MIT",
                        Url = new Uri("https://opensource.org/licenses/MIT")
                    },
                });

                // Include the XML comments (path to the XML file)
                var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
                var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
                c.IncludeXmlComments(xmlPath);

                // Schema Filter
                c.SchemaFilter<EnumSchemaFilter>();

                // Path to XML documentation file for the controller project
                var controllerXmlFile = Path.Combine(AppContext.BaseDirectory, "SpotifyPool.xml");
                if (File.Exists(controllerXmlFile))
                {
                    c.IncludeXmlComments(controllerXmlFile);
                }

                #region Add JWT Authentication
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
                #endregion

                #region Add OAuth2 Authentication
                //c.AddSecurityDefinition("OAuth2", new OpenApiSecurityScheme
                //{
                //    Type = SecuritySchemeType.OAuth2,
                //    Description = "OAuth2 Authorization Code Flow",
                //    Flows = new OpenApiOAuthFlows
                //    {
                //        AuthorizationCode = new OpenApiOAuthFlow
                //        {
                //            AuthorizationUrl = new Uri("https://accounts.spotify.com/authorize"), // URL ủy quyền của Spotify
                //            TokenUrl = new Uri("https://accounts.spotify.com/api/token"),       // URL token của Spotify
                //            Scopes = new Dictionary<string, string>
                //            {
                //                { "user-top-read", "Read user's top artists and tracks" },
                //                { "playlist-read-private", "Read private playlists" },
                //                { "playlist-modify-public", "Modify public playlists" },
                //                { "user-library-read", "Read user's library" }
                //            }
                //        }
                //    }
                //});

                //c.AddSecurityRequirement(new OpenApiSecurityRequirement
                //{
                //    {
                //        new OpenApiSecurityScheme
                //        {
                //            Reference = new OpenApiReference
                //            {
                //                Type = ReferenceType.SecurityScheme,
                //                Id = "OAuth2"
                //            }
                //        },
                //        new List<string> { "user-top-read", "playlist-read-private" } // Các scope mặc định
                //    }
                //});
                #endregion
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

        public static void AddAuthentication(this IServiceCollection services)
        {
            // Config the Google Identity
            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = GoogleDefaults.AuthenticationScheme;
            }).AddGoogle(googleOptions =>
            {
                googleOptions.ClientId = Environment.GetEnvironmentVariable("Authentication_Google_ClientId") ?? throw new DataNotFoundCustomException("Google's ClientId property is not set in environment or not found");
                googleOptions.ClientSecret = Environment.GetEnvironmentVariable("Authentication_Google_ClientSecret") ?? throw new DataNotFoundCustomException("Google's Client Secret property is not set in environment or not found");

            }).AddJwtBearer(opt =>
            {
                opt.TokenValidationParameters = new TokenValidationParameters
                {
                    //tự cấp token
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateLifetime = true,

                    // Các issuer và audience hợp lệ
                    ValidIssuers = [Environment.GetEnvironmentVariable("JWT_ISSUER_PRODUCTION"), "https://localhost:7018"],
                    ValidAudiences = [Environment.GetEnvironmentVariable("JWT_AUDIENCE_PRODUCTION"), Environment.GetEnvironmentVariable("JWT_AUDIENCE_PRODUCTION_BE"), "https://localhost:7018"],

                    //ký vào token
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable("JWTSettings_SecretKey") ?? throw new DataNotFoundCustomException("JWT's Secret Key property is not set in environment or not found"))),

                    ClockSkew = TimeSpan.Zero,

                    // Đặt RoleClaimType
                    RoleClaimType = ClaimTypes.Role
                };

                // Cấu hình SignalR để đọc token
                opt.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        // Nếu header chứa token, sử dụng nó
                        string accessToken = context.Request.Headers.Authorization.ToString();
                        //.Replace("Bearer ", "", StringComparison.OrdinalIgnoreCase);

                        string secretKey = Environment.GetEnvironmentVariable("APIKeySettings_SecretKey") ?? throw new InvalidDataCustomException("API Key is not set in the environment variables");

                        if (!string.IsNullOrEmpty(accessToken) && accessToken.Equals($"Bearer {secretKey}", StringComparison.OrdinalIgnoreCase))
                        {
                            context.Token = accessToken;
                        }
                        return Task.CompletedTask;
                    }
                };

                // Remove "Bearer " prefix
                // Chỉ remove Bearer prefix khi đang trong môi trường phát triển hoặc debug
                //opt.Events = new JwtBearerEvents
                //{
                //    OnMessageReceived = context =>
                //    {
                //        // Check if the token is present without "Bearer" prefix
                //        if (context.Request.Headers.ContainsKey("Authorization"))
                //        {
                //            var token = context.Request.Headers.Authorization.ToString();
                //            if (!token.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                //            {
                //                context.Token = token; // Set token without "Bearer" prefix
                //            }
                //        }
                //        return Task.CompletedTask;
                //    }
                //};
            });
        }

        public static void AddJiraClient(this IServiceCollection services)
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

            // Register the Cloudinary with DI
            services.AddScoped(provider => cloudinary);

            // Register Cloudinary in DI container as a scoped service
            services.AddScoped<CloudinaryService>();
        }

        public static void AddGeolocation(this IServiceCollection services)
        {
            string? geolocationApiKey = Environment.GetEnvironmentVariable("IPGEOLOCATION_API_KEY");
            if (string.IsNullOrEmpty(geolocationApiKey))
            {
                throw new DataNotFoundCustomException("Geolocation API Key is not set in the environment variables");
            }

            // Initialize Cloudinary instance
            GeolocationSettings geolocationSettings = new()
            {
                ApiKey = geolocationApiKey
            };

            // Register the Geolocation with DI
            services.AddScoped(provider => geolocationSettings);

            // Register Geolocation in DI container as a scoped service
            services.AddScoped<IGeolocation, GeolocationService>();

        }

        public static void AddSpotify(this IServiceCollection services)
        {
            string clientId = Environment.GetEnvironmentVariable("SPOTIFY_CLIENT_ID") ?? throw new DataNotFoundCustomException("Spotify Client ID property is not set in environment or not found");
            string clientSecret = Environment.GetEnvironmentVariable("SPOTIFY_CLIENT_SECRET") ?? throw new DataNotFoundCustomException("Spotify Client Secret property is not set in environment or not found");
            string redirectUri = Environment.GetEnvironmentVariable("SPOTIFY_REDIRECT_URI") ?? throw new DataNotFoundCustomException("Spotify Redirect URI property is not set in environment or not found");

            // Initialize SpotifySettings properties
            SpotifySettings spotifySettings = new()
            {
                ClientId = clientId,
                ClientSecret = clientSecret,
                RedirectUri = redirectUri
            };

            // Register the SpotifySettings with DI
            services.AddSingleton(spotifySettings);

            services.AddScoped<ISpotify, SpotifyService>();
        }

        public static void AddGenius(this IServiceCollection services)
        {
            string clientId = Environment.GetEnvironmentVariable("GENIUS_CLIENT_ID") ?? throw new DataNotFoundCustomException("Genius Client ID property is not set in environment or not found");
            string clientSecret = Environment.GetEnvironmentVariable("GENIUS_CLIENT_SECRET") ?? throw new DataNotFoundCustomException("Genius Client Secret property is not set in environment or not found");
            string redicrectUri = Environment.GetEnvironmentVariable("GENIUS_REDIRECT_URI") ?? throw new DataNotFoundCustomException("Genius Redirect URI property is not set in environment or not found");
            string state = Environment.GetEnvironmentVariable("GENIUS_STATE") ?? throw new DataNotFoundCustomException("Genius State property is not set in environment or not found");

            // Initialize GeniusSettings properties
            GeniusSettings geniusSettings = new()
            {
                ClientId = clientId,
                ClientSecret = clientSecret,
                RedirectUri = redicrectUri,
                State = state
            };

            // Register the GeniusSettings with DI
            services.AddSingleton(geniusSettings);

            // Register the Genius service
            services.AddScoped<IGenius, GeniusService>();
        }

        // Config the database
        public static void AddDatabase(this IServiceCollection services)
        {
            // Load MongoDB settings from environment variables
            string connectionString = Environment.GetEnvironmentVariable("MONGODB_CONNECTION_STRING")
                ?? throw new InvalidDataCustomException("MongoDB connection string is not set in environment variables");
            var databaseName = Environment.GetEnvironmentVariable("MONGODB_DATABASE_NAME")
                ?? throw new InvalidDataCustomException("MongoDB database name is not set in environment variables");

            // Register the MongoDB settings as a singleton
            var mongoDbSettings = new MongoDBSetting
            {
                ConnectionString = connectionString,
                DatabaseName = databaseName
            };

            // Register the MongoDBSetting with DI
            services.AddSingleton(mongoDbSettings);

            // Register MongoClient as singleton, sharing the connection across all usages
            services.AddSingleton<IMongoClient>(sp =>
            {
                return new MongoClient(mongoDbSettings.ConnectionString);
            });

            // Register IMongoDatabase as a scoped service
            services.AddScoped(sp =>
            {
                var client = sp.GetRequiredService<IMongoClient>();
                return client.GetDatabase(mongoDbSettings.DatabaseName);
            });

            // Register the MongoDB context (or client)
            services.AddSingleton<SpotifyPoolDBContext>();
            services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
            services.AddScoped<IUnitOfWork, UnitOfWork>();
        }

        // Add AutoMapper configuration using Assembly
        public static void AddAutoMapper(this IServiceCollection services)
        {
            services.AddAutoMapper(Assembly.Load("BusinessLogicLayer.Mapper"));

            // Có thể cấu hình thêm như sau
            //services.AddAutoMapper(Assembly.Load(typeof(BusinessLogicLayer.Mapper.AssemblyName).Assembly.DisplayName));
            //services.AddAutoMapper(Assembly.Load(typeof(BusinessLogicLayer.Mapper.{anyClassInProject}).Assembly.DisplayName));

            // Load Assembly ở vị trí hiện tại
            //services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

            // Dùng Explicitly nếu dùng assembly chưa được
        }

        public static void AddEnumMemberSerializer(this IServiceCollection services)
        {
            // User
            BsonSerializer.RegisterSerializer(typeof(UserProduct), new EnumMemberSerializer<UserProduct>());
            BsonSerializer.RegisterSerializer(typeof(UserRole), new EnumMemberSerializer<UserRole>());
            BsonSerializer.RegisterSerializer(typeof(UserStatus), new EnumMemberSerializer<UserStatus>());
            BsonSerializer.RegisterSerializer(typeof(UserGender), new EnumMemberSerializer<UserGender>());

            // Track
            BsonSerializer.RegisterSerializer(typeof(PlaylistName), new EnumMemberSerializer<PlaylistName>());
            BsonSerializer.RegisterSerializer(typeof(RestrictionReason), new EnumMemberSerializer<RestrictionReason>());

            // Cloudinary
            BsonSerializer.RegisterSerializer(typeof(AudioTagChild), new EnumMemberSerializer<AudioTagChild>());
            BsonSerializer.RegisterSerializer(typeof(AudioTagParent), new EnumMemberSerializer<AudioTagParent>());
            BsonSerializer.RegisterSerializer(typeof(ImageTag), new EnumMemberSerializer<ImageTag>());
        }
    }
}
