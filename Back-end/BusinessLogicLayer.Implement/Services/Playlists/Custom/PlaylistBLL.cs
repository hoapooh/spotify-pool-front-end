﻿using AutoMapper;
using BusinessLogicLayer.Implement.CustomExceptions;
using BusinessLogicLayer.Implement.Microservices.Cloudinaries;
using BusinessLogicLayer.Interface.Services_Interface.Playlists.Custom;
using BusinessLogicLayer.ModelView.Service_Model_Views.Artists.Response;
using BusinessLogicLayer.ModelView.Service_Model_Views.Images.Response;
using BusinessLogicLayer.ModelView.Service_Model_Views.Playlists.Request;
using BusinessLogicLayer.ModelView.Service_Model_Views.Playlists.Response;
using BusinessLogicLayer.ModelView.Service_Model_Views.Tracks.Response;
using CloudinaryDotNet.Actions;
using DataAccessLayer.Interface.MongoDB.UOW;
using DataAccessLayer.Repository.Aggregate_Storage;
using DataAccessLayer.Repository.Entities;
using Microsoft.AspNetCore.Http;
using MongoDB.Bson;
using MongoDB.Driver;
using SetupLayer.Enum.Microservices.Cloudinary;
using System.Collections.Generic;
using System.Security.Claims;
using Utility.Coding;

namespace BusinessLogicLayer.Implement.Services.Playlists.Custom
{
    public class PlaylistBLL(IUnitOfWork unitOfWork, IHttpContextAccessor httpContextAccessor, IMapper mapper, CloudinaryService cloudinaryService) : IPlaylist
    {
        private readonly IUnitOfWork _unitOfWork = unitOfWork;
        private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;
        private readonly IMapper _mapper = mapper;
        private readonly CloudinaryService _cloudinaryService = cloudinaryService;

        public async Task<IEnumerable<PlaylistsResponseModel>> GetAllPlaylistsAsync()
        {
            // UserID lấy từ phiên người dùng có thể là FE hoặc BE
            string? userID = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            // Kiểm tra UserId
            if (string.IsNullOrEmpty(userID))
            {
                throw new UnauthorizedAccessException("Your session is limit, you must login again to edit profile!");
            }

            // Projection
            ProjectionDefinition<Playlist> playlistProjection = Builders<Playlist>.Projection
                .Include(playlist => playlist.Id)
                .Include(playlist => playlist.Name)
                .Include(playlist => playlist.Images);

            // Lấy thông tin Playlist
            IEnumerable<Playlist> playlists = await _unitOfWork.GetCollection<Playlist>()
                .Find(playlist => playlist.UserID == userID)
                .Project<Playlist>(playlistProjection)
                .ToListAsync();

            // Mapping
            IEnumerable<PlaylistsResponseModel> playlistsResponse = _mapper.Map<IEnumerable<PlaylistsResponseModel>>(playlists);

            return playlistsResponse;
        }

        public async Task CreatePlaylistAsync(PlaylistRequestModel playlistRequestModel)
        {
            if (string.IsNullOrWhiteSpace(playlistRequestModel.PlaylistName))
            {
                throw new InvalidDataCustomException("Playlist name is required");
            }

            // UserID lấy từ phiên người dùng có thể là FE hoặc BE
            string? userID = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userID))
            {
                throw new UnauthorizedAccessException("Your session is limit, you must login again to edit profile!");
            }

            // Kiểm tra xem playlist đã tồn tại chưa
            if (await _unitOfWork.GetCollection<Playlist>()
                .Find(playlist => playlist.UserID == userID && playlist.Name == playlistRequestModel.PlaylistName)
                .Project(playlist => playlist.Id)
                .AnyAsync())
            {
                throw new DataExistCustomException("The playlist has been already created");
            }

            // Tạo hình ảnh cho playlist
            List<Image> images = [];

            // Nếu có file hình ảnh thì upload lên Cloudinary
            // Gọi 3 lần để tạo 3 kích thước ảnh khác nhau
            if (playlistRequestModel.ImageFile != null)
            {
                // Kết quả upload hình ảnh
                ImageUploadResult uploadResult;
                // Kích thước ảnh
                IEnumerable<int> sizes = [640, 300, 64];
                // Kích thước ảnh cố định
                int fixedSize = 300;

                // Upload hình ảnh lên Cloudinary
                uploadResult = _cloudinaryService.UploadImage(playlistRequestModel.ImageFile, ImageTag.Playlist, rootFolder: "Image", fixedSize, fixedSize);

                // Tạo 3 kích thước ảnh khác nhau nhưng cùng một URL với kích thước cố định
                foreach (int size in sizes)
                {
                    images.Add(new()
                    {
                        URL = uploadResult.SecureUrl.AbsoluteUri,
                        Height = size,
                        Width = size
                    });
                }
            }
            // Nếu playlist là Favorite Songs thì sử dụng hình ảnh mặc định
            else
            {
                images =
                [
                    new() {
                        URL = "https://res.cloudinary.com/dofnn7sbx/image/upload/v1732779869/default-playlist-640_tsyulf.jpg",
                        Height = 640,
                        Width = 640
                    },
                    new() {
                        URL = "https://res.cloudinary.com/dofnn7sbx/image/upload/v1732779653/default-playlist-300_iioirq.png",
                        Height = 300,
                        Width = 300
                    },
                    new() {
                        URL = "https://res.cloudinary.com/dofnn7sbx/image/upload/v1732779699/default-playlist-64_gek7wt.png",
                        Height = 64,
                        Width = 64
                    }
                ];
            }

            // Tạo mới playlist
            Playlist playlist = new()
            {
                Name = playlistRequestModel.PlaylistName,
                UserID = userID,
                CreatedTime = Util.GetUtcPlus7Time(),
                TrackIds = [],
                Images = images
            };

            // Thêm playlist vào DB
            await _unitOfWork.GetCollection<Playlist>().InsertOneAsync(playlist);
        }

        [Obsolete("Dùng SignalR thay vì APIs")]
        public async Task AddToPlaylistAsync(string trackId, string playlistId)
        {
            // UserID lấy từ phiên người dùng có thể là FE hoặc BE
            string? userID = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userID))
            {
                throw new UnauthorizedAccessException("Your session is limit, you must login again to edit profile!");
            }

            // Projection
            ProjectionDefinition<Playlist> projectionDefinition = Builders<Playlist>.Projection
                .Include(playlist => playlist.TrackIds);

            // Lấy thông tin playlist
            Playlist playlist = await _unitOfWork.GetCollection<Playlist>()
                .Find(playlist => playlist.Id == playlistId)
                .Project<Playlist>(projectionDefinition)
                .FirstOrDefaultAsync() ?? throw new InvalidDataCustomException("The playlist does not exist");

            // Chỉ thêm trackID nếu chưa tồn tại để tránh trùng lặp
            if (playlist.TrackIds.Any(track => track.TrackId == trackId))
            {
                throw new DataExistCustomException("The song has been already added to your Playlist");
            }

            // Thêm track vào playlist
            playlist.TrackIds.Add(new PlaylistTracksInfo
            {
                TrackId = trackId,
                AddedTime = Util.GetUtcPlus7Time()
            });

            // Cập nhật playlist với danh sách TrackIds mới
            UpdateDefinition<Playlist> updateDefinition = Builders<Playlist>.Update.Set(playlist => playlist.TrackIds, playlist.TrackIds);
            await _unitOfWork.GetCollection<Playlist>().UpdateOneAsync(playlist => playlist.Id == playlistId, updateDefinition);

            return;
        }

        public async Task<IEnumerable<TrackResponseModel>> GetRecommendationPlaylist(int offset, int limit)
        {
            // Projection
            ProjectionDefinition<ASTrack, TrackResponseModel> trackWithArtistProjection = Builders<ASTrack>.Projection.Expression(track =>
                new TrackResponseModel
                {
                    Id = track.Id,
                    Name = track.Name,
                    Description = track.Description,
                    Lyrics = track.Lyrics,
                    PreviewURL = track.PreviewURL,
                    Duration = track.Duration,
                    Images = track.Images.Select(image => new ImageResponseModel
                    {
                        URL = image.URL,
                        Height = image.Height,
                        Width = image.Width
                    }),
                    Artists = track.Artists.Select(artist => new ArtistResponseModel
                    {
                        Id = artist.Id,
                        Name = artist.Name,
                        Followers = artist.Followers,
                        GenreIds = artist.GenreIds,
                        Images = artist.Images.Select(image => new ImageResponseModel
                        {
                            URL = image.URL,
                            Height = image.Height,
                            Width = image.Width
                        })
                    })
                });

            // Sắp xếp theo Popularity của Track
            SortDefinition<Track> sortDefinition = Builders<Track>.Sort.Descending(track => track.Popularity);

            // Empty Pipelinef
            IAggregateFluent<Track> aggregateFluent = _unitOfWork.GetCollection<Track>().Aggregate();

            // Lấy thông tin Tracks với Artist
            IEnumerable<TrackResponseModel> tracksResponseModel = await aggregateFluent
                .Skip((offset - 1) * limit)
                .Limit(limit)
                .Sort(sortDefinition)
                .Lookup<Track, Artist, ASTrack>
                (
                    _unitOfWork.GetCollection<Artist>(), // The foreign collection
                    track => track.ArtistIds, // The field in Track that are joining on
                    artist => artist.Id, // The field in Artist that are matching against
                    result => result.Artists // The field in ASTrack to hold the matched artists
                )
                .Project(trackWithArtistProjection)
                .ToListAsync();

            return tracksResponseModel;
        }

        // Cái này chưa xong
        public async Task<PlaylistReponseModel> GetWeeklyPlaylist()
        {
            // UserID lấy từ phiên người dùng có thể là FE hoặc BE
            string? userId = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                throw new UnauthorizedAccessException("Your session is limit, you must login again to edit profile!");
            }

            // Lấy danh sách top track của user
            IEnumerable<string> trackIds = await _unitOfWork.GetCollection<TopTrack>()
                .Find(topTrack => topTrack.UserId == userId)
                .Project(topTrack => topTrack.TrackInfo.Select(trackInfo => trackInfo.TrackId))
                .FirstOrDefaultAsync();

            return null;
        }

        public async Task CreateMoodPlaylist(string mood)
        {
            // UserID lấy từ phiên người dùng có thể là FE hoặc BE
            string? userId = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                throw new UnauthorizedAccessException("Your session is limit, you must login again to edit profile!");
            }

            // Filter
            FilterDefinition<AudioFeatures> audioFeaturesFilter;
            audioFeaturesFilter = mood switch
            {
                "Sad" => Builders<AudioFeatures>.Filter.And(
                                      Builders<AudioFeatures>.Filter.Eq(af => af.Mode, 0),
                                      Builders<AudioFeatures>.Filter.Lte(af => af.Tempo, 100),
                                      Builders<AudioFeatures>.Filter.Lte(af => af.Valence, 0.4)),
                "Neutral" => Builders<AudioFeatures>.Filter.And(
                                        Builders<AudioFeatures>.Filter.Eq(af => af.Mode, 1),
                                        Builders<AudioFeatures>.Filter.Gte(af => af.Tempo, 100) &
                                        Builders<AudioFeatures>.Filter.Lte(af => af.Tempo, 120),
                                        Builders<AudioFeatures>.Filter.Gte(af => af.Valence, 0.4) &
                                        Builders<AudioFeatures>.Filter.Lte(af => af.Valence, 0.6)),
                "Happy" => Builders<AudioFeatures>.Filter.And(
                                        Builders<AudioFeatures>.Filter.Eq(af => af.Mode, 1),
                                        Builders<AudioFeatures>.Filter.Gte(af => af.Tempo, 120) &
                                        Builders<AudioFeatures>.Filter.Lte(af => af.Tempo, 160),
                                        Builders<AudioFeatures>.Filter.Gte(af => af.Valence, 0.6) &
                                        Builders<AudioFeatures>.Filter.Lte(af => af.Valence, 0.8)),
                "Blisfull" => Builders<AudioFeatures>.Filter.And(
                                        Builders<AudioFeatures>.Filter.Eq(af => af.Mode, 1),
                                        Builders<AudioFeatures>.Filter.Gte(af => af.Tempo, 140) &
                                        Builders<AudioFeatures>.Filter.Lte(af => af.Tempo, 180),
                                        Builders<AudioFeatures>.Filter.Gte(af => af.Valence, 0.8) &
                                        Builders<AudioFeatures>.Filter.Lte(af => af.Valence, 1)),
                "Focus" => Builders<AudioFeatures>.Filter.And(
                                        Builders<AudioFeatures>.Filter.Gte(af => af.Instrumentalness, 0.7),
                                        Builders<AudioFeatures>.Filter.Lte(af => af.Energy, 0.5)),
                "Random" => Builders<AudioFeatures>.Filter.Empty,
                _ => throw new InvalidDataCustomException("The mood is not supported"),
            };

            // Mapping tracks to TrackResponseModel
            ProjectionDefinition<ASTrack, TrackResponseModel> projectionDefinition = Builders<ASTrack>.Projection.Expression(track =>
                new TrackResponseModel
                {
                    Id = track.Id,
                    Name = track.Name,
                    Description = track.Description,
                    PreviewURL = track.PreviewURL,
                    Duration = track.Duration,
                    Images = track.Images.Select(image => new ImageResponseModel()
                    {
                        URL = image.URL,
                        Height = image.Height,
                        Width = image.Width
                    }),
                    Artists = track.Artists.Select(artist => new ArtistResponseModel
                    {
                        Id = artist.Id,
                        Name = artist.Name,
                        Followers = artist.Followers,
                        GenreIds = artist.GenreIds,
                        Images = artist.Images.Select(image => new ImageResponseModel
                        {
                            URL = image.URL,
                            Height = image.Height,
                            Width = image.Width
                        })
                    })
                });

            // Lấy AudioFeaturesId
            IEnumerable<string> audioFeaturesIds = await _unitOfWork.GetCollection<AudioFeatures>()
                .Find(audioFeaturesFilter)
                .Project(af => af.Id)
                .ToListAsync();

            // Stage
            IAggregateFluent<Track> aggregateFluent = _unitOfWork.GetCollection<Track>().Aggregate();

            // Lấy thông tin Tracks với Artist
            IEnumerable<TrackResponseModel> tracks = await aggregateFluent
                .Match(track => audioFeaturesIds.Contains(track.AudioFeaturesId))
                .Sample(10)
                .Lookup<Track, Artist, ASTrack>
                (
                    _unitOfWork.GetCollection<Artist>(), // The foreign collection
                    track => track.ArtistIds, // The field in Track that are joining on
                    artist => artist.Id, // The field in Artist that are matching against
                    result => result.Artists // The field in ASTrack to hold the matched artists
                )
                .Project(projectionDefinition)
                .ToListAsync();

            // Lấy thời gian hiện tại
            DateTime currentTime = Util.GetUtcPlus7Time();

            // Playlist là Custom Songs thì sử dụng hình ảnh mặc định
            List<Image> images = [
                new() {
                    URL = "https://res.cloudinary.com/dofnn7sbx/image/upload/v1732779869/default-playlist-640_tsyulf.jpg",
                    Height = 640,
                    Width = 640
                },
                new() {
                    URL = "https://res.cloudinary.com/dofnn7sbx/image/upload/v1732779653/default-playlist-300_iioirq.png",
                    Height = 300,
                    Width = 300
                },
                new() {
                    URL = "https://res.cloudinary.com/dofnn7sbx/image/upload/v1732779699/default-playlist-64_gek7wt.png",
                    Height = 64,
                    Width = 64
                }
            ];

            // Tạo mới playlist
            Playlist playlist = new()
            {
                Name = $"{mood} Playlist {currentTime}",
                UserID = userId,
                CreatedTime = currentTime,
                TrackIds = tracks.Select(track => new PlaylistTracksInfo
                {
                    TrackId = track.Id,
                    AddedTime = currentTime
                }).ToList(),
                Images = images
            };

            // Lưu thông tin playlist vào database
            await _unitOfWork.GetCollection<Playlist>().InsertOneAsync(playlist);

            // Do là API nên không cần trả về gì cả
        }

        public async Task<PlaylistReponseModel> GetPlaylistAsync(string playlistId)
        {
            // UserID lấy từ phiên người dùng có thể là FE hoặc BE
            string? userID = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userID))
            {
                throw new UnauthorizedAccessException("Your session is limit, you must login again to edit profile!");
            }

            // Chỉ lấy những fields cần thiết từ ASPlaylist : Playlist
            ProjectionDefinition<ASPlaylist> playlistProjection = Builders<ASPlaylist>.Projection
                .Include(playlist => playlist.Id)
                .Include(playlist => playlist.Name)
                .Include(playlist => playlist.Images)
                .Include(playlist => playlist.User.Id)
                .Include(playlist => playlist.User.DisplayName)
                .Include(playlist => playlist.User.Images)
                .Include(playlist => playlist.TrackIds);

            // Empty Pipeline
            IAggregateFluent<Playlist> playlistAggregate = _unitOfWork.GetCollection<Playlist>().Aggregate();

            // Lookup
            ASPlaylist playlist = await playlistAggregate
                .Match(playlist => playlist.Id == playlistId)
                .Lookup<Playlist, User, ASPlaylist>
                (_unitOfWork.GetCollection<User>(),
                playlist => playlist.UserID,
                user => user.Id,
                result => result.User)
                .Unwind(result => result.User, new AggregateUnwindOptions<ASPlaylist>()
                {
                    PreserveNullAndEmptyArrays = true
                })
                .Project<ASPlaylist>(playlistProjection)
                .FirstOrDefaultAsync();

            // Map track IDs and their added time
            Dictionary<string, DateTime> trackIdAddedTimeMap = playlist.TrackIds.ToDictionary(pti => pti.TrackId, pti => pti.AddedTime);
            HashSet<string> trackIdsSet = [.. trackIdAddedTimeMap.Keys]; // .ToHashSet()

            // Filter
            FilterDefinition<Track> trackFilter = Builders<Track>.Filter.In(track => track.Id, trackIdsSet);

            // Chỉ lấy những thông tin cần thiết từ ASTrack : Track và Mappping sang TrackResponseModel
            // Mapping tracks to TrackResponseModel
            ProjectionDefinition<ASTrack, TrackResponseModel> projectionDefinition = Builders<ASTrack>.Projection.Expression(track =>
                new TrackResponseModel
                {
                    Id = track.Id,
                    Name = track.Name,
                    Description = track.Description,
                    PreviewURL = track.PreviewURL,
                    Duration = track.Duration,
                    Images = track.Images.Select(image => new ImageResponseModel()
                    {
                        URL = image.URL,
                        Height = image.Height,
                        Width = image.Width
                    }),
                    Artists = track.Artists.Select(artist => new ArtistResponseModel
                    {
                        Id = artist.Id,
                        Name = artist.Name,
                        Followers = artist.Followers,
                        GenreIds = artist.GenreIds,
                        Images = artist.Images.Select(image => new ImageResponseModel
                        {
                            URL = image.URL,
                            Height = image.Height,
                            Width = image.Width
                        })
                    })
                });

            // Empty Pipeline
            IAggregateFluent<Track> aggregateFluent = _unitOfWork.GetCollection<Track>().Aggregate();

            // Lấy thông tin Tracks với Artist
            // Lookup
            IEnumerable<TrackResponseModel> tracks = await aggregateFluent
                .Match(trackFilter) // Match the pre custom filter
                .Lookup<Track, Artist, ASTrack>(
                    _unitOfWork.GetCollection<Artist>(), // The foreign collection
                    track => track.ArtistIds, // The field in Track that are joining on
                    artist => artist.Id, // The field in Artist that are matching against
                    result => result.Artists) // The field in ASTrack to hold the matched artists
                .Project(projectionDefinition)
                .ToListAsync();

            // Thêm thông tin AddedTime và DurationFormated vào TrackResponseModel
            foreach (TrackResponseModel track in tracks)
            {
                track.AddedTime = trackIdAddedTimeMap[track.Id].ToString("yyyy-MM-dd");
            }

            // Lý do không dùng AutoMapper vì Model này cần tới nhiều thông tin từ nhiều collection khác nhau
            // Mapping Response Model Playlist Item
            PlaylistReponseModel playlistReponseModel = new()
            {
                Id = playlist.Id,
                Title = playlist.Name,
                Images = _mapper.Map<IEnumerable<ImageResponseModel>>(playlist.Images),
                UserId = playlist.User.Id,
                DisplayName = playlist.User.DisplayName,
                Avatar = _mapper.Map<ImageResponseModel>(playlist.User.Images[0]),
                TotalTracks = playlist.TrackIds.Count,
                Tracks = tracks
            };

            return playlistReponseModel;
        }

        public async Task RemoveFromPlaylistAsync(string trackId, string playlistId)
        {
            // UserID lấy từ phiên người dùng có thể là FE hoặc BE
            string? userID = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userID))
            {
                throw new UnauthorizedAccessException("Your session is limit, you must login again to edit profile!");
            }

            // Lấy thông tin playlist
            Playlist playlist = await _unitOfWork.GetCollection<Playlist>()
                .Find(playlist => playlist.Id == playlistId)
                .Project(playlist => playlist.TrackIds)
                .As<Playlist>()
                .FirstOrDefaultAsync() ?? throw new InvalidDataCustomException("The playlist does not exist");

            // Xóa track khỏi playlist
            playlist.TrackIds.RemoveAll(track => track.TrackId == trackId);
        }
    }
}
