import classNames from 'classnames'
import useVideoPlayerStore from '../../hooks/video-player-store'
import { getFormattedTimeString } from '../../utils'
import useSpacebarControl from '../../hooks/spacebar-control'
import './video-player.css'

export default function VideoPlayer() {
	const { store, dispatch } = useVideoPlayerStore()

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
        if (store.isVideoPlaying) {
            setTimeout(() => {
                dispatch({ type: 'SET_HIDE_CONTROLS', payload: true })
            }, 5000)
        }
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
        store.videoRef.current[store.isVideoPlaying ? 'pause' : 'play']()

        // update icon
        dispatch({
            type: 'SET_PLAYING_STATE_ICON',
            payload: store.isVideoPlaying ? '/icons/play-svgrepo-com.svg' : '/icons/pause-svgrepo-com.svg',
        })

        // toggle play/pause
        dispatch({ type: 'TOGGLE_IS_VIDEO_PLAYING' })
    }

    // add the custom spacebar control hook
    useSpacebarControl(handleVideoPlayPause)

    console.log(store.isVideoPlaying)

	return (
		<div
            className="video-player"
            id="player"
            onMouseLeave={handlePlayerMouseLeave}
            onMouseEnter={handlePlayerMouseEnter}
        >
            <video
                src="/dummy-video.mp4"
                autoFocus
                onLoadedMetadata={handleLoadedMetadata}
                onCanPlay={handleCanPlay}
                ref={store.videoRef}
            ></video>
            {/* <video src="https://dash.akamaized.net/akamai/bbb_30fps/bbb_with_multiple_tiled_thumbnails.mpd" oncontextmenu="return false;"></video> */}
            <div className="pause-screen" id="pauseScreen" onClick={handleVideoPlayPause}>
                <button className="icon-button not-selectable" onClick={(e) => {
                    e.stopPropagation()
                    handleVideoPlayPause()
                }}>
                    <img className="icon-lg" src={store.playingStateIcon} />
                </button>
            </div>
            <div
                className={classNames(
                    'controls',
                    { 'hide-elem': store.hideControls }
                )}
            >
                <div className="time-bar pointer">
                    <div className="elapse-bar" id="elapseBar"></div>
                    <div className="bg-bar" id="bgBar"></div>
                </div>
                <div className="control-buttons flex-align-center" id="controlButtons">
                    <div className="primary-buttons flex-align-center not-selectable">
                        <button id="playButton" className="icon-button pointer">
                            <img className="pointer" src={store.playingStateIcon} />
                        </button>
                        <button id="volumeButton" className="icon-button not-selectable">
                            <img className="pointer" src="/icons/volume-max-svgrepo-com.svg" />
                            <input id="volumeInp" type="range" min="0" max="100" />
                        </button>
                        <button id="timeStat" className="not-selectable">
                            <span id="elpaseTime">00:00</span>
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
