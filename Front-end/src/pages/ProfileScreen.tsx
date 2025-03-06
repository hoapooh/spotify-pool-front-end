import "@/styles/profile.scss";
import { useState } from "react";

import ProfileBulk from "@/features/customer/Profile/ProfileBulk";
import ProfileHeader from "@/features/customer/Profile/ProfileHeader";
import ProfileModal from "@/features/customer/Profile/components/Modal/ProfileModal";
import ProfileTopTracks from "@/features/customer/Profile/ProfileTopTracks";

export default function ProfileScreen() {
	const [openProfileModal, setOpenProfileModal] = useState(false);

	return (
		<div>
			<ProfileModal open={openProfileModal} setOpen={setOpenProfileModal} />

			<ProfileHeader setOpen={setOpenProfileModal} />

			<ProfileBulk setOpen={setOpenProfileModal} />

			<ProfileTopTracks />
		</div>
	);
}
