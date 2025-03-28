export interface Images {
	url: string;
	width: number;
	height: number;
}

export interface Artists {
	id: string;
	name: string;
	followers: number;
	// genreIds: string[];
	images: Images[];
}

export interface Track {
	id: string;
	name: string;
	description: string;
	lyrics: string;
	previewURL: string;
	addedTime?: string;
	uploadDate?: string;
	albumIds?: string[];
	duration: number;
	durationFormated: string;
	images: Images[];
	artists: Artists[];
}

export interface Playlist {
	id: string;
	name: string;
	images: Images[];
}

export interface Avatar {
	url: string;
	height: number;
	width: number;
}

export interface User {
	id: string;
	role: string[];
	name: string;
	avatar: Avatar[];
}

export interface TrackPlaylist {
	id: string;
	name: string;
	description: string;
	lyrics: string;
	previewURL: string;
	addedTime?: string;
	uploadDate?: string;
	duration: number;
	durationFormated: string;
	images: Images[];
	artists: Artists[];
}

export interface PlaylistDetail {
	id: string;
	title: string;
	images: Images[];
	userId: string;
	displayName: string;
	avatar: Avatar;
	totalTracks: number;
	tracks: TrackPlaylist[];
}

export interface TopTracksDetail {
	trackId: string;
	streamCount: number;
	firstAccessTime: Date;
	track: Track;
	artists: string[];
}

export interface TopTracks {
	topTrackId: string;
	userId: string;
	trackInfo: TopTracksDetail[];
}

export interface UserAccount {
	userId: string; //
	userName: string;
	displayName: string; //
	gender: string;
	birthDate: string;
	phoneNumber: string;
	countryId: string;
	followers: number;
	email: string; //
	status: "Inactive" | "Active" | "Banned" | ""; //
	product: string;
	roles: string[]; //
	images: Images[];
}

export interface Album {
	id: string;
	name: string;
	description: string;
	images: Images[];
	releaseInfo: {
		releasedTime: string;
		reason: number;
	};
}

export interface TopTracksDashboard {
	id: string;
	name: string;
	streamCount: number;
	duration: number;
	uploadDate: string;
	images: Images[];
}

export interface TopArtists {
	id: string;
	name: string;
	followers: number;
	popularity: number;
	images: Images[];
}

export interface NewTracks {
	id: string;
	name: string;
	streamCount: number;
	duration: number;
	uploadDate: string;
	images: Images[];
}

export interface UserGrowth {
	month: string;
	newUsers: number;
	activeUsers: number;
}

export interface UserRoleDistribution {
	role: string;
	count: number;
	percentage: number;
}
