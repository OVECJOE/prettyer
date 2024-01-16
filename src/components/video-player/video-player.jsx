import classNames from 'classnames'
import useVideoPlayerStore from '../../hooks/video-player-store'
import { getFormattedTimeString } from '../../utils'
import { useEffect } from 'react'
import './video-player.css'

export default function VideoPlayer() {
	const { store, dispatch, refs } = useVideoPlayerStore()

    const handleLoadedMetadata = (e) => {
        dispatch({ type: 'SET_VIDEO_END_TIME', payload: e.target.duration })
    }

    const handleCanPlay = (e) => {
        handleLoadedMetadata(e)
        // set the last volume level
        dispatch({ type: 'SET_LAST_VOLUME_LEVEL', payload: e.target.volume })
        // set is muted
        dispatch({ type: 'SET_IS_MUTED', payload: e.target.volume === 0 })
    }

    const handlePlayerMouseLeave = () => {
        clearTimeout(store.mouseMoveTrackerTimeout)

        dispatch({ type: 'SET_MOUSE_MOVE_TRACKER_TIMEOUT', payload: setTimeout(() => {
            dispatch({ type: 'SET_HIDE_CONTROLS', payload: true })
        }, 5000) })
    }

    const handlePlayerMouseEnter = () => {
        dispatch({ type: 'SET_HIDE_CONTROLS', payload: false })
    }

    const handleVideoPlayPause = () => {
        // reset interval, animation frame, and last animation time
        clearInterval(store.seekInterval)
        cancelAnimationFrame(store.animationRequest)
        dispatch({ type: 'SET_LAST_ANIMATION_TIME', payload: null })

        // stop/continue video
        refs.videoRef.current[store.isVideoPlaying ? 'pause' : 'play']()

        // update icon
        dispatch({
            type: 'SET_PLAYING_STATE_ICON',
            payload: store.isVideoPlaying ? '/icons/play-svgrepo-com.svg' : '/icons/pause-svgrepo-com.svg',
        })

        if (!store.isVideoPlaying) {
            // start interval
            dispatch({
                type: 'SET_SEEK_INTERVAL',
                payload: setInterval(() => {
                    dispatch({
                        type: 'SET_ELAPSED_TIME', payload: refs.videoRef.current.currentTime })
                }, 1000),
            })
            updateTimeBar()
        }

        // toggle play/pause
        setTimeout(() => {
            dispatch({ type: 'TOGGLE_IS_VIDEO_PLAYING' })
        }, 100)
    }

    const updateTimeBar = () => {
        const { videoRef, bgBarRef } = refs

        const currentVideoTime = videoRef.current.currentTime
        const bgBarWidth = bgBarRef.current.getBoundingClientRect().width
        const newWidth = (currentVideoTime / store.videoEndTime) * bgBarWidth
        
        // update bar width
        dispatch({ type: 'SET_CURRENT_BAR_WIDTH', payload: newWidth })
        // set animation request
        dispatch({ type: 'SET_ANIMATION_REQUEST', payload: requestAnimationFrame(updateTimeBar) })

        if (!store.lastAnimatedTime) {
            dispatch({ type: 'SET_LAST_ANIMATION_TIME', payload: currentVideoTime })
        }
    }

    const handleVideoEnded = () => {
        clearInterval(store.seekInterval)
        cancelAnimationFrame(store.animationRequest)

        // reset the state
        dispatch({ type: 'RESET' })
        // set is video ended to true
        dispatch({ type: 'SET_IS_VIDEO_ENDED', payload: true })
    }

    const handlePlayerMouseMove = () => {
        // show the controls
        dispatch({ type: 'SET_HIDE_CONTROLS', payload: false })
        // clear the timeout
        clearTimeout(store.mouseMoveTrackerTimeout)

        if (store.isVideoPlaying) {
            dispatch({ type: 'SET_MOUSE_MOVE_TRACKER_TIMEOUT', payload: setTimeout(() => {
                dispatch({ type: 'SET_HIDE_CONTROLS', payload: true })
            }, 5000) })
        }
    }

    const handleSeek = (e) => {
        const clickedPoint = e.clientX - e.target.getBoundingClientRect().left;
        const videoTimeToClick = (store.videoEndTime / refs.bgBarRef.current.getBoundingClientRect().width) * clickedPoint

        // update the current time for the video
        refs.videoRef.current.currentTime = videoTimeToClick
    }

    const handleFixedSeek = (seconds, direction) => {
        const { videoRef, bgBarRef } = refs
        const currentVideoTime = videoRef.current.currentTime

        const videoMoveSecond = direction * seconds
        // set elapsed time
        dispatch({
            type: 'SET_ELAPSED_TIME',
            payload: Math.min(store.elapsedTime + videoMoveSecond, store.videoEndTime)
        })

        // update the video current time
        refs.videoRef.current.currentTime += videoMoveSecond

        // calculate the new bar width
        const bgBarWidth = bgBarRef.current.getBoundingClientRect().width
        const newWidth = (currentVideoTime / store.videoEndTime) * bgBarWidth

        // update bar width
        dispatch({ type: 'SET_CURRENT_BAR_WIDTH', payload: newWidth })
    }

    // add the custom spacebar listener
    useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.code === "Space") {
				handleVideoPlayPause(e)
			} else if (e.code === "ArrowRight") {
                handleFixedSeek(5, 1)
            } else if (e.code === "ArrowLeft") {
                handleFixedSeek(5, -1)
            }
		}

		document.addEventListener("keydown", handleKeyDown)

		return () => {
			document.removeEventListener("keydown", handleKeyDown)
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<div
            className="video-player"
            id="player"
            onMouseLeave={handlePlayerMouseLeave}
            onMouseEnter={handlePlayerMouseEnter}
            onMouseMove={handlePlayerMouseMove}
        >
            <video
                src="/dummy-video.mp4"
                autoFocus
                onLoadedMetadata={handleLoadedMetadata}
                onCanPlay={handleCanPlay}
                onEnded={handleVideoEnded}
                onClick={handleVideoPlayPause}
                ref={refs.videoRef}
            ></video>
            {/* <video src="https://dash.akamaized.net/akamai/bbb_30fps/bbb_with_multiple_tiled_thumbnails.mpd" oncontextmenu="return false;"></video> */}
            {!store.isVideoPlaying && (
                <div className="pause-screen" id="pauseScreen" onClick={handleVideoPlayPause}>
                    <button className="icon-button not-selectable" onClick={(e) => {
                        e.stopPropagation()
                        handleVideoPlayPause()
                    }}>
                        <img className="icon-lg" src={store.playingStateIcon} />
                    </button>
                </div>
            )}
            <div
                className={classNames(
                    'controls',
                    { 'hide-elem': store.hideControls }
                )}
            >
                <div className="time-bar pointer">
                    <div
                        className="elapse-bar"
                        id="elapseBar"
                        onClick={handleSeek}
                        style={{ width: `${store.currentBarWidth}px` }}
                    ></div>
                    <div
                        className="bg-bar"
                        id="bgBar"
                        onClick={handleSeek}
                        ref={refs.bgBarRef}
                    ></div>
                </div>
                <div className="control-buttons flex-align-center" id="controlButtons">
                    <div className="primary-buttons flex-align-center not-selectable">
                        <button id="playButton" className="icon-button pointer" onClick={handleVideoPlayPause}>
                            <img className="pointer" src={store.playingStateIcon} />
                        </button>
                        <button id="volumeButton" className="icon-button not-selectable">
                            <img className="pointer" src="/icons/volume-max-svgrepo-com.svg" />
                            <input id="volumeInp" type="range" min="0" max="100" />
                        </button>
                        <button id="timeStat" className="not-selectable">
                            <span id="elapsedTime">
                                {getFormattedTimeString(store.elapsedTime)}
                            </span>
                            <span>/</span>
                            <span id="totalTime">
                                {getFormattedTimeString(store.videoEndTime)}
                            </span>
                        </button>
                    </div>
                    <div className="aux-buttons flex-align-center pointer">
                        <button id="pipButton" className="icon-button not-selectable">
                            <img className="pointer" src="/icons/picture-in-picture-fill-svgrepo-com.svg" />
                        </button>
                        <button id="fullScreenButton" className="icon-button not-selectable">
                            <img className="pointer" src="/icons/full-screen-svgrepo-com.svg" />
                        </button>
                    </div>
                </div>
            </div>
		</div>
	)
}
