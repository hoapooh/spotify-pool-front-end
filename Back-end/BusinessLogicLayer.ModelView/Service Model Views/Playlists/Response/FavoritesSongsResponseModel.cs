﻿using BusinessLogicLayer.ModelView.Service_Model_Views.Images.Response;
using BusinessLogicLayer.ModelView.Service_Model_Views.Tracks.Response;

namespace BusinessLogicLayer.ModelView.Service_Model_Views.Playlists.Response
{
    public class FavoritesSongsResponseModel
    {
        public required string Id { get; set; }
        public required string Name { get; set; }
        public string? Description { get; set; }
        public DateTime CreatedTime { get; set; }
        public required IEnumerable<ImageResponseModel> Images { get; set; }
        public required IEnumerable<TrackResponseModel> Tracks { get; set; }
    }
}
