import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";
import { useGetCurrentUserQuery } from "@/services/apiAuth";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setUserData } from "@/store/slice/authSlice";
import FancyLoader from "@/components/FancyLoader";
import { AppSidebarManager } from "@/features/manager/AppSidebarManager";

export default function ManagerLayout() {
	const dispatch = useAppDispatch();
	const { userData: existingUserData } = useAppSelector((state) => state.auth);
	const [isLoading, setIsLoading] = useState(!existingUserData);

	const { data: userData } = useGetCurrentUserQuery(undefined, {
		skip: Boolean(existingUserData?.id),
	});

	useEffect(() => {
		// First check if we already have user data
		if (existingUserData?.id) {
			setIsLoading(false);
			return;
		}

		// Otherwise, wait for data from the query
		if (userData) {
			dispatch(setUserData(userData.authenticatedUserInfoResponseModel));
			setIsLoading(false);
		}
	}, [existingUserData, userData, dispatch]);

	if (isLoading) {
		return <FancyLoader />;
	}

	return (
		<SidebarProvider>
			<AppSidebarManager />
			<SidebarInset>
				<header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
					<div className="flex items-center gap-2 px-4">
						<SidebarTrigger className="-ml-1" />
					</div>
				</header>
				<div className="flex-1 p-4 pt-0">
					<Outlet />
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
