import { useEffect } from "react";

export default function useSpacebarControl(playPauseHandler = () => {}) {
	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.code === "Space") {
				playPauseHandler(e)
			}
		}

		window.addEventListener("keyup", handleKeyDown)

		return () => {
			window.removeEventListener("keyup", handleKeyDown)
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
}
