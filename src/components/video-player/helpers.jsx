import { SPRITE_IMG_HEIGHT, SPRITE_IMG_WIDTH } from "../../constants"

export const SeekPreviewCanvas = () => {
	return (
		<canvas width={SPRITE_IMG_WIDTH} height={SPRITE_IMG_HEIGHT}></canvas>
	)
}

export const PreviewImageElem = () => {
	return (
		<img
			id="previewImg"
			style={{
				userSelect: 'none',
				width: '200px',
				height: '120px',
				position: 'absolute',
				bottom: '50px',
				objectFit: 'cover',
			}}
		/>
	)
}