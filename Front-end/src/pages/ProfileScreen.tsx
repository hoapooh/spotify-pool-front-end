import "@/styles/profile.scss";
import { useState } from "react";

import ProfileBulk from "@/features/customer/Profile/ProfileBulk";
import ProfileHeader from "@/features/customer/Profile/ProfileHeader";
import ProfileModal from "@/features/customer/Profile/components/Modal/ProfileModal";
import ProfileTopTracks from "@/features/customer/Profile/ProfileTopTracks";
import useGetUserId from "@/features/customer/Profile/hooks/useGetUserId";
import NotFoundPage from "./NotFoundPage";

export default function ProfileScreen() {
	const userId = useGetUserId();
	const [openProfileModal, setOpenProfileModal] = useState(false);

	if (!userId) return <NotFoundPage />;

	return (
		<div>
			<ProfileModal open={openProfileModal} setOpen={setOpenProfileModal} userId={userId} />

			<ProfileHeader setOpen={setOpenProfileModal} userId={userId} />

			<ProfileBulk setOpen={setOpenProfileModal} userId={userId} />

			<ProfileTopTracks />
		</div>
	);
}
