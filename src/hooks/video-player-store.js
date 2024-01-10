import { useReducer, useRef } from "react"

const INITIAL_SETTINGS = {
	videoEndTime: 0,
	elapsedTime: 0,
	seekInterval: null,
	isVideoEnded: false,
	animationRequest: null,
	lastAnimatedTime: null,
	isFullScreen: false,
	isInPip: false,
	lastMouseMoveTime: null,
	mouseMoveTrackerTimeout: null,
	lastVolumeLevel: null,
	isMuted: false,
	isVideoPlaying: false,
	hideControls: false,
	playingStateIcon: '/icons/play-svgrepo-com.svg',
}

const ACTION_TYPES_CATEGORIES = ["SET_", "TOGGLE_"]

const reducer = (state, action) => {
	// check if the action type category is valid
	const typeCategory = ACTION_TYPES_CATEGORIES.find(category => action.type.startsWith(category))
	if (!typeCategory) {
		return state
	}

	// extract the state property to be updated from the action type
	// e.g. SET_LAST_MOUSE_MOVE_TIME -> lastMouseMoveTime
	// ['SET', 'LAST', 'MOUSE', 'MOVE', 'TIME'] => ['LAST', 'MOUSE', 'MOVE', 'TIME'] => ['last', 'Mouse', 'Move', 'Time'] => lastMouseMoveTime
	const propertyToUpdate = action.type.split("_").slice(1).map((word, index) => {
		if (index === 0) {
			return word.toLowerCase()
		}
		return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
	}).join("")

	// check if the property to be updated is valid
	if (state[propertyToUpdate] === undefined) {
		return state
	}

	// update the state property
	if (typeCategory === ACTION_TYPES_CATEGORIES[1]) {
		// check if the property is boolean
		if (typeof state[propertyToUpdate] !== "boolean") {
			return state
		}
		return {
			...state,
			[propertyToUpdate]: !state[propertyToUpdate],
		}
	}

	return {
		...state,
		[propertyToUpdate]: action.payload,
	}
}

export default function useVideoPlayerStore() {
	const videoRef = useRef(null)
	const [store, dispatch] = useReducer(reducer, {
		...INITIAL_SETTINGS, videoRef
	})
	return { store, dispatch }
}
