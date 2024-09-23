﻿using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

namespace DataAccessLayer.Repository.Entities
{
    public class Playlist
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = null!;

        public string SpotifyId { get; set; } = null!;

        public string? Description { get; set; }
        public List<Image> Images { get; set; } = [];
        public string Name { get; set; } = null!;
        public List<string> TrackIds { get; set; } = [];
        public DateTime CreatedTime { get; set; }
    }
}
