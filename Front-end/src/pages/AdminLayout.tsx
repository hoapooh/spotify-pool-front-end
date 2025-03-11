import { AppSidebar } from "@/features/admin/dashboard/AppSiderbar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Outlet, useNavigate } from "react-router-dom";
import { useGetCurrentUserQuery } from "@/services/apiAuth";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setUserData } from "@/store/slice/authSlice";

export default function AdminLayout() {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const { userData: existingUserData } = useAppSelector((state) => state.auth);
	const [isLoading, setIsLoading] = useState(!existingUserData);

	const { data: userData } = useGetCurrentUserQuery(undefined, {
		skip: window.location.pathname === "/admin/login",
	});

	useEffect(() => {
		if (userData) {
			dispatch(setUserData(userData.authenticatedUserInfoResponseModel));

			// Verify admin role after data is loaded
			if (!userData.authenticatedUserInfoResponseModel?.role?.includes("Admin")) {
				navigate("/admin/login", { replace: true });
			}

			// Set a timeout to delay the transition
			setTimeout(() => {
				setIsLoading(false);
			}, 1500); // 1.5 seconds delay
		}
	}, [userData, dispatch, navigate]);

	// Use existing data if available to prevent loading state
	useEffect(() => {
		if (existingUserData) {
			// Still verify admin role
			if (!existingUserData.role?.includes("Admin")) {
				navigate("/admin/login", { replace: true });
			}

			// Set a timeout to delay the transition
			setTimeout(() => {
				setIsLoading(false);
			}, 1500); // 1.5 seconds delay
		}
	}, [existingUserData, navigate]);

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
