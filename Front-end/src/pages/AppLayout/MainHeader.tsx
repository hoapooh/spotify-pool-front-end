import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { Link } from "react-router-dom"
import { RootState } from "@/store/store"
import { useSelector } from "react-redux"

const MainHeader = () => {
	const { userData, isAuthenticated } = useSelector((state: RootState) => state.auth)

	return (
		<>
			<header className="main-content-header sticky w-full flex items-center bg-[rgba(0,0,0,.5)] h-[64px]">
				<div className="main-content-header-action w-full flex items-center justify-between pl-6 mr-1">
					<div className="prev-next-btn flex gap-2 text-white">
						{/* BACK BUTTON */}
						<button className="w-8 h-8 inline-flex items-center justify-center cursor-not-allowed opacity-60 bg-black bg-opacity-70 rounded-full">
							<svg
								role="img"
								aria-hidden="true"
								viewBox="0 0 16 16"
								className="w-4"
								fill={"currentColor"}
							>
								<path d="M11.03.47a.75.75 0 0 1 0 1.06L4.56 8l6.47 6.47a.75.75 0 1 1-1.06 1.06L2.44 8 9.97.47a.75.75 0 0 1 1.06 0z"></path>
							</svg>
						</button>

						{/* FORWARD BUTTON */}
						<button className="w-8 h-8 inline-flex items-center justify-center cursor-not-allowed opacity-60 bg-black bg-opacity-70 rounded-full">
							<svg
								data-encore-id="icon"
								role="img"
								aria-hidden="true"
								viewBox="0 0 16 16"
								className="w-4"
								fill={"currentColor"}
							>
								<path d="M4.97.47a.75.75 0 0 0 0 1.06L11.44 8l-6.47 6.47a.75.75 0 1 0 1.06 1.06L13.56 8 6.03.47a.75.75 0 0 0-1.06 0z"></path>
							</svg>
						</button>
					</div>

					{/* AVATAR OR AUTH ACTION */}
					<div className="auth-btn">
						<div>
							{!isAuthenticated ? (
								<>
									<Link to={"/signup"}>
										<button className="inline-flex items-center justify-center text-[#b3b3b3] p-2 pr-8 font-bold hover:text-white hover:scale-x-105">
											Sign up
										</button>
									</Link>
									<Link to={"/login"}>
										<button className="signin">
											<span className="bg-white text-black flex items-center justify-center transition-all p-2 pl-8 pr-8 rounded-full font-bold min-h-12 ">
												Log in
											</span>
										</button>
									</Link>
								</>
							) : (
								<>
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger>
												<Avatar className="bg-[#1f1f1f] items-center justify-center cursor-pointer hover:scale-110 transition-all w-12 h-12">
													<AvatarImage
														src={userData?.avatar}
														className="object-cover rounded-full w-8 h-8"
													/>
													<AvatarFallback>
														{userData?.displayName.charAt(0).toUpperCase()}
													</AvatarFallback>
												</Avatar>
											</TooltipTrigger>
											<TooltipContent side="bottom" align="center">
												<p>{userData?.displayName}</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								</>
							)}
						</div>
					</div>
				</div>
			</header>
		</>
	)
}

export default MainHeader
