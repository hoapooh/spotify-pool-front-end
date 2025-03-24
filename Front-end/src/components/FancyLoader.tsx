import styled from "styled-components";

const FancyLoader = () => {
	return (
		<div className="w-full h-full flex justify-center items-center">
			<StyledWrapper>
				<span className="fancy-loader" />
			</StyledWrapper>
		</div>
	);
};

const StyledWrapper = styled.div`
	.fancy-loader {
		display: block;
		width: 84px;
		height: 84px;
		position: relative;
	}

	.fancy-loader:before,
	.fancy-loader:after {
		content: "";
		position: absolute;
		left: 50%;
		bottom: 0;
		width: 64px;
		height: 64px;
		border-radius: 50%;
		background: #fff;
		transform: translate(-50%, -100%) scale(0);
		animation: push_401 2s infinite linear;
	}

	.fancy-loader:after {
		animation-delay: 1s;
	}

	@keyframes push_401 {
		0%,
		50% {
			transform: translate(-50%, 0%) scale(1);
		}

		100% {
			transform: translate(-50%, -100%) scale(0);
		}
	}
`;

export default FancyLoader;
