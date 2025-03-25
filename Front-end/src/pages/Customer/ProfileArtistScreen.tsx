import ProfileHeader from "@/features/artist/Profile/ProfileHeader";
import useGetArtistId from "@/hooks/useGetArtistId";
import { useGetArtistProfileQuery } from "@/services/apiArtist";
import NotFoundPage from "../NotFoundPage";
import ProfileOption from "@/features/artist/Profile/ProfileOption";
import ProfileTable from "@/features/artist/Profile/ProfileTable";
import ProfileAlbum from "@/features/artist/Profile/ProfileAlbum";
import { useGetAlbumListQuery } from "@/services/apiAlbum";

const ProfileArtistScreen = () => {
	const artistId = useGetArtistId();

	const { data: artistProfile, isLoading } = useGetArtistProfileQuery({ artistId: artistId! });
	const { data: albumList } = useGetAlbumListQuery({ artistIds: [artistId!] });

	if (isLoading) return <div>Loading...</div>;

	if (!artistProfile) return <NotFoundPage />;

	return (
		<>
			<ProfileHeader artistProfile={artistProfile.artistProfile} />

			<ProfileOption artistTracks={artistProfile.artistTracks} />

			<ProfileTable artistTracks={artistProfile.artistTracks} />

			{albumList && albumList.length > 0 && <ProfileAlbum albumList={albumList} />}
		</>
	);
};

export default ProfileArtistScreen;
