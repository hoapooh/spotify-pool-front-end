﻿using CloudinaryDotNet.Actions;
using CloudinaryDotNet;
using Microsoft.AspNetCore.Http;
using BusinessLogicLayer.Implement.CustomExceptions;
using Utility.Coding;
using Business_Logic_Layer.Services_Interface.InMemoryCache;

namespace BusinessLogicLayer.Implement.Microservices.Cloudinaries
{
    public class CloudinaryService(Cloudinary cloudinary, ICacheCustom cache)
    {
        private readonly Cloudinary _cloudinary = cloudinary;
        private readonly ICacheCustom _cache = cache;

        public ImageUploadResult UploadImage(IFormFile imageFile, string tags = "AvatarUserProfile", string folder = "Image")
        {
            if (imageFile is null || imageFile.Length == 0)
            {
                throw new ArgumentNullCustomException(nameof(imageFile), "No file uploaded");
            }

            #region Kiểm tra bằng đuôi file (.ext)
            //// Lấy đuôi file (File Extension)
            //string? fileExtension = Path.GetExtension(imageFile.FileName).ToLower().TrimStart('.');

            //// Kiểm tra nếu phần mở rộng có tồn tại trong enum ImageExtension
            //if (!System.Enum.TryParse(fileExtension, true, out ImageExtension _))
            //{
            //    throw new BadRequestCustomException("Unsupported file type");
            //}
            #endregion

            // Kiểm tra bằng content-type (image/webp)
            string fileType = imageFile.ContentType.Split('/').First();
            if (fileType != "image")
            {
                throw new BadRequestCustomException("Unsupported file type");
            }

            tags = tags switch
            {
                "AvatarUserProfile" => "/User's Profiles",
                _ => "/Test",
            };

            // UserID lấy từ phiên người dùng có thể là FE hoặc BE
            string userID = "testing";

            // Hashing Metadata
            string hashedData = DataEncryptionExtensions.Encrypt($"image_{userID}");

            // Nếu người dùng đang ở khác muối giờ thì cách này hiệu quả hơn
            // Không nhất thiết phải là UTC+7 vì còn tùy thuộc theo hệ thống trên máy của người dùng
            string timestamp = DateTime.UtcNow.Ticks.ToString();

            using Stream? stream = imageFile.OpenReadStream();
            ImageUploadParams uploadParams = new()
            {
                Folder = "Image" + tags,
                File = new(imageFile.FileName, stream), // new FileDescription()
                //UseFilename = true,
                PublicId = $"{Uri.EscapeDataString(hashedData + '_' + timestamp)}",
                DisplayName = imageFile.FileName,
                UniqueFilename = false, // Đã custom nên không cần Unique từ Server nữa
                Tags = tags,
                Format = "webp",
                Overwrite = true
            };

            ImageUploadResult? uploadResult = _cloudinary.Upload(uploadParams);

            if ((int)uploadResult.StatusCode != StatusCodes.Status200OK)
            {
                throw new CustomException("Error", (int)uploadResult.StatusCode, uploadResult.Status);
            }

            Console.WriteLine(uploadResult.JsonObj);

            return uploadResult;
        }

        public VideoUploadResult UploadTrack(IFormFile trackFile)
        {
            if (trackFile is null || trackFile.Length == 0)
            {
                throw new ArgumentNullCustomException(nameof(trackFile), "No file uploaded");
            }

            #region Kiểm tra bằng đuôi file (.ext)
            //// Lấy đuôi file (File Extension)
            //string? fileExtension = Path.GetExtension(trackFile.FileName).ToLower().TrimStart('.');

            //// Kiểm tra nếu phần mở rộng có tồn tại trong enum ImageExtension
            //if (!System.Enum.TryParse(fileExtension, true, out VideoExtension _))
            //{
            //    throw new BadRequestCustomException("Unsupported file type");
            //}
            #endregion

            // Kiểm tra bằng content-type
            string fileType = trackFile.ContentType.Split('/').First();
            switch(fileType)
            {
                case "audio": break;
                case "video": break;
                default: throw new BadRequestCustomException("Unsupported file type");
            }

            // UserID lấy từ phiên người dùng có thể là FE hoặc BE
            string userID = "testing";

            // Hashing Metadata
            string hashedData = DataEncryptionExtensions.Encrypt($"track_{userID}");

            // Nếu người dùng đang ở khác muối giờ thì cách này hiệu quả hơn
            // Không nhất thiết phải là UTC+7 vì còn tùy thuộc theo hệ thống trên máy của người dùng
            string timestamp = DateTime.UtcNow.Ticks.ToString();

            using Stream? stream = trackFile.OpenReadStream();
            VideoUploadParams uploadParams = new()
            {
                Folder = "Audio/Test",
                File = new(trackFile.FileName, stream), // new FileDescription()
                //UseFilename = true,
                PublicId = $"{Uri.EscapeDataString(hashedData + '_' + timestamp)}",
                DisplayName = trackFile.FileName,
                UniqueFilename = false, // Đã custom nên không cần Unique từ Server nữa
                Format = "mp3",
                Overwrite = true
            };

            VideoUploadResult? uploadResult = _cloudinary.Upload(uploadParams);

            if((int)uploadResult.StatusCode != StatusCodes.Status200OK)
            {
                throw new CustomException("Error", (int)uploadResult.StatusCode, uploadResult.Status);
            }

            Console.WriteLine(uploadResult.JsonObj);

            return uploadResult;
        }

        // Get ImageResponseModel from Server
        public GetResourceResult? GetImageResult(string publicID, bool isCache = false)
        {
            GetResourceResult? getResult = null;

            GetResourceParams? getResourceParams = new(publicID)
            {
                ResourceType = ResourceType.Image,
            };

            if (isCache)
            {
                getResult = _cache.GetOrSet(publicID, () => _cloudinary.GetResource(getResourceParams));
            }
            else
            {
                getResult = _cloudinary.GetResource(getResourceParams);
            }

            if ((int)getResult.StatusCode != StatusCodes.Status200OK)
            {
                throw new DataNotFoundCustomException($"Not found any ImageResponseModel with Public ID {publicID}");
            }

            return getResult;
        }

        // Get Video from Server
        public GetResourceResult? GetTrackResult(string publicID, bool isCache = false)
        {
            GetResourceResult? getResult = null;

            GetResourceParams getResourceParams = new(publicID)
            {
                ResourceType = ResourceType.Video  // Explicitly set the resource type to video
            };

            if (isCache)
            {
                getResult = _cache.GetOrSet(publicID, () => _cloudinary.GetResource(getResourceParams));
            }
            else
            {
                getResult = _cloudinary.GetResource(getResourceParams);
            }

            if ((int)getResult.StatusCode != StatusCodes.Status200OK)
            {
                throw new DataNotFoundCustomException($"Not found any Track with Public ID {publicID}");
            }

            return getResult;
        }

        // Update ImageResponseModel / Video from Client
        // Update và Upload dùng chung
        // Chỉ cần xử lý DB bên Upload là được

        // Delete ImageResponseModel from Server
        public DeletionResult? DeleteImage(string publicID)
        {
            DeletionParams deletionParams = new(publicID)
            {
                //PublicId = publicID, // Không cần vì hàm này yêu cầu có tham số publicID nên không cần khởi tạo nữa
                ResourceType = ResourceType.Image,
                Type = "upload"
            };

            DeletionResult? deletionResult = _cloudinary.Destroy(deletionParams);

            if ((int)deletionResult.StatusCode != StatusCodes.Status200OK)
            {
                throw new DataNotFoundCustomException($"Not found any ImageResponseModel with Public ID {publicID}");
            }

            // Xóa cache nếu tồn tại bằng cách sử dụng hàm RemoveCache
            //_cache.RemoveCache<GetResourceResult>(publicID); // Xóa cache cho kiểu GetResourceResult với khóa là publicID

            return deletionResult;
        }

        // Delete Video from Server
        public DeletionResult? DeleteTrack(string publicID)
        {
            DeletionParams deletionParams = new(publicID)
            {
                //PublicId = publicID, // Không cần vì hàm này yêu cầu có tham số publicID nên không cần khởi tạo nữa
                ResourceType = ResourceType.Video,
                Type = "upload"
            };

            DeletionResult deletionResult = _cloudinary.Destroy(deletionParams);

            if ((int)deletionResult.StatusCode != StatusCodes.Status200OK)
            {
                throw new DataNotFoundCustomException($"Not found any ImageResponseModel with Public ID {publicID}");
            }

            // Xóa cache nếu tồn tại bằng cách sử dụng hàm RemoveCache
            //_cache.RemoveCache<GetResourceResult>(publicID); // Xóa cache cho kiểu GetResourceResult với khóa là publicID

            return deletionResult;
        }
    }
}
