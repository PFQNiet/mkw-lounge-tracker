import { captureFrame, preprocessCrop } from "./capture.js";
import { ctx2d, popcount } from "./util.js";

const HOME_ROI = { x: 506, y: 45, w: 40, h:40 };

/**
 * See: ../img/home-icon-reference.png
 */
const HOME_BITMASK = new Uint8Array([
	0x00, 0x01, 0xFF, 0x80, 0x00, // ........ .......# ######## #....... ........
	0x00, 0x0F, 0xFF, 0xF0, 0x00, // ........ ....#### ######## ####.... ........
	0x00, 0x3F, 0xFF, 0xFC, 0x00, // ........ ..###### ######## ######.. ........
	0x00, 0xFF, 0xFF, 0xFF, 0x00, // ........ ######## ######## ######## ........
	0x01, 0xFF, 0xFF, 0xFF, 0x80, // .......# ######## ######## ######## #.......
	0x03, 0xFF, 0xE7, 0xFF, 0xC0, // ......## ######## ###..### ######## ##......
	0x07, 0xFF, 0xC3, 0xFF, 0xE0, // .....### ######## ##....## ######## ###.....
	0x0F, 0xFF, 0x81, 0xFF, 0xF0, // ....#### ######## #......# ######## ####....
	0x1F, 0xFF, 0x00, 0xFF, 0xF8, // ...##### ######## ........ ######## #####...
	0x1F, 0xFE, 0x00, 0x7F, 0xF8, // ...##### #######. ........ .####### #####...
	0x3F, 0xF8, 0x00, 0x1F, 0xFC, // ..###### #####... ........ ...##### ######..
	0x3F, 0xF0, 0x00, 0x0F, 0xFC, // ..###### ####.... ........ ....#### ######..
	0x7F, 0xE0, 0x00, 0x07, 0xFE, // .####### ###..... ........ .....### #######.
	0x7F, 0xC0, 0x00, 0x03, 0xFE, // .####### ##...... ........ ......## #######.
	0x7F, 0x80, 0x00, 0x01, 0xFE, // .####### #....... ........ .......# #######.
	0xFE, 0x00, 0x00, 0x00, 0x7F, // #######. ........ ........ ........ .#######
	0xFC, 0x00, 0x00, 0x00, 0x3F, // ######.. ........ ........ ........ ..######
	0xFC, 0x00, 0x00, 0x00, 0x3F, // ######.. ........ ........ ........ ..######
	0xFC, 0x00, 0x00, 0x00, 0x3F, // ######.. ........ ........ ........ ..######
	0xFF, 0xC0, 0x7E, 0x03, 0xFF, // ######## ##...... .######. ......## ########
	0xFF, 0xC0, 0x7E, 0x03, 0xFF, // ######## ##...... .######. ......## ########
	0xFF, 0xC0, 0x7E, 0x03, 0xFF, // ######## ##...... .######. ......## ########
	0xFF, 0xC0, 0x7E, 0x03, 0xFF, // ######## ##...... .######. ......## ########
	0xFF, 0xC0, 0x7E, 0x03, 0xFF, // ######## ##...... .######. ......## ########
	0xFF, 0xC0, 0x7E, 0x03, 0xFF, // ######## ##...... .######. ......## ########
	0x7F, 0xC0, 0x00, 0x03, 0xFE, // .####### ##...... ........ ......## #######.
	0x7F, 0xC0, 0x00, 0x03, 0xFE, // .####### ##...... ........ ......## #######.
	0x7F, 0xC0, 0x00, 0x03, 0xFE, // .####### ##...... ........ ......## #######.
	0x3F, 0xC0, 0x00, 0x03, 0xFC, // ..###### ##...... ........ ......## ######..
	0x3F, 0xC0, 0x00, 0x03, 0xFC, // ..###### ##...... ........ ......## ######..
	0x1F, 0xC0, 0x00, 0x03, 0xF8, // ...##### ##...... ........ ......## #####...
	0x1F, 0xFF, 0xFF, 0xFF, 0xF8, // ...##### ######## ######## ######## #####...
	0x0F, 0xFF, 0xFF, 0xFF, 0xF0, // ....#### ######## ######## ######## ####....
	0x07, 0xFF, 0xFF, 0xFF, 0xE0, // .....### ######## ######## ######## ###.....
	0x03, 0xFF, 0xFF, 0xFF, 0xC0, // ......## ######## ######## ######## ##......
	0x01, 0xFF, 0xFF, 0xFF, 0x80, // .......# ######## ######## ######## #.......
	0x00, 0xFF, 0xFF, 0xFF, 0x00, // ........ ######## ######## ######## ........
	0x00, 0x3F, 0xFF, 0xFC, 0x00, // ........ ..###### ######## ######.. ........
	0x00, 0x0F, 0xFF, 0xF0, 0x00, // ........ ....#### ######## ####.... ........
	0x00, 0x01, 0xFF, 0x80, 0x00  // ........ .......# ######## #....... ........
]);

const POP = (() => {
	const t = new Uint8Array(256);
	for( let i=0; i<256; i++ ) t[i] = popcount(i);
	return t;
})();

const frameBuffer = document.createElement('canvas');
const scratch = document.createElement('canvas');
/** @param {HTMLVideoElement} video */
export function checkOverlay(video) {
	const frame = captureFrame(video, frameBuffer);
	const { canvas, whiteRatio } = preprocessCrop(frame, HOME_ROI, 1, scratch);
	// icon is about 50:50 black/white, so if the ratio is too low or too high, it's probably not the icon we're looking for
	if( whiteRatio < 0.4 || whiteRatio > 0.6) return false;

	const pctx = ctx2d(canvas, { willReadFrequently: true });
	const img = pctx.getImageData(0, 0, canvas.width, canvas.height);
	let error = 0;
	const maxErrorTolerance = (HOME_BITMASK.length * 8) * 0.2;
	for( let i=0; i<HOME_BITMASK.length; i++ ) {
		const region =
			  (img.data[(i*8+0)*4] == 255 ? 0x80 : 0)
			| (img.data[(i*8+1)*4] == 255 ? 0x40 : 0)
			| (img.data[(i*8+2)*4] == 255 ? 0x20 : 0)
			| (img.data[(i*8+3)*4] == 255 ? 0x10 : 0)
			| (img.data[(i*8+4)*4] == 255 ? 0x08 : 0)
			| (img.data[(i*8+5)*4] == 255 ? 0x04 : 0)
			| (img.data[(i*8+6)*4] == 255 ? 0x02 : 0)
			| (img.data[(i*8+7)*4] == 255 ? 0x01 : 0);
		error += POP[region ^ HOME_BITMASK[i]];
		if( error > maxErrorTolerance ) return false;
	}
	return true;
}
