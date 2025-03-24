import { AppSidebar } from "@/features/admin/dashboard/AppSiderbar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";
import { useGetCurrentUserQuery } from "@/services/apiAuth";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setUserData } from "@/store/slice/authSlice";

export default function AdminLayout() {
	const dispatch = useAppDispatch();
	const { userData: existingUserData } = useAppSelector((state) => state.auth);
	const [isLoading, setIsLoading] = useState(!existingUserData);

	// Skip the query if we're on login page
	const isLoginPage = window.location.pathname === "/admin/login";

	// Only fetch user data if we don't have it and we're not on login page
	const { data: userData } = useGetCurrentUserQuery(undefined, {
		skip: Boolean(existingUserData?.id) || isLoginPage,
	});

	useEffect(() => {
		// If we're on the login page, no need to show loader
		if (isLoginPage) {
			setIsLoading(false);
			return;
		}

		// Case 1: We have existing user data
		if (existingUserData?.id) {
			// Short delay for UI transition
			const timer = setTimeout(() => {
				setIsLoading(false);
			}, 500);

			return () => clearTimeout(timer);
		}

		// Case 2: We have data from API
		if (userData?.authenticatedUserInfoResponseModel) {
			// Update redux with user data
			dispatch(setUserData(userData.authenticatedUserInfoResponseModel));

			// Short delay for UI transition
			const timer = setTimeout(() => {
				setIsLoading(false);
			}, 500);

			return () => clearTimeout(timer);
		}
	}, [userData, existingUserData, dispatch, isLoginPage]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="animate-spin rounded-full size-20 border-t-4 border-green-500"></div>
			</div>
		);
	}

	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
					<div className="flex items-center gap-2 px-4">
						<SidebarTrigger className="-ml-1" />
						{/* <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Building Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb> */}
					</div>
				</header>
				<div className="flex-1 p-4 pt-0">
					{/* // NOTE: Some skeleton pre-built-in --> will not use but maybe leave for later investigate */}
					{/* <div className="grid auto-rows-min gap-4 md:grid-cols-3">
						<div className="aspect-video rounded-xl bg-muted/50" />
						<div className="aspect-video rounded-xl bg-muted/50" />
						<div className="aspect-video rounded-xl bg-muted/50" />
					</div>
					<div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" /> */}
					<Outlet />
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
