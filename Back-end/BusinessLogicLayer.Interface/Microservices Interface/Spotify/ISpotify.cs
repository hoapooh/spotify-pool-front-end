﻿using BusinessLogicLayer.ModelView.Service_Model_Views.Tracks.Response;

namespace BusinessLogicLayer.Interface.Microservices_Interface.Spotify
{
    public interface ISpotify
    {
        string Authorize();
        Task<(string accessToken, string refreshToken)> GetAccessTokenAsync(string authorizationCode);
        Task<string> GetTopTracksAsync(string accessToken, int limit = 2, int offset = 2);
        Task<IEnumerable<TrackResponseModel>> GetUserSaveTracksAsync(string accessToken, int limit = 2, int offset = 0);
        Task GetAllGenreSeedsAsync(string accessToken);
        Task GetAllMarketsAsync(string accessToken);
    }
}
