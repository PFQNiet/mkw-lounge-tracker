# MKW Mogi Manager

A web app to OCR Mario Kart results from a virtual webcam feed and keep scores.

**Live site:** https://pfqniet.github.io/mkw-lounge-tracker/

## Usage
1. Paste the 12-player roster (`1. Name (12345 MMR)`) when prompted.
2. Select your capture device (virtual webcam).
3. Click **Capture & OCR** after each race, or enable **Auto-capture**.
4. **Export scores** to copy the lounge-bot format.

## Fixing common issues
- If possible, make sure to select the capture card source directly. Going through OBS can work, but if you have any overlays or if the layout isn't perfectly fullscreen, you may have problems.
- The tool expects player names to be fully white. If they appear slightly grey then check HDR settings and ensure Full Range is enabled.
- It is possible to capture from your Switch's gallery, but make sure to press <kbd>+</kbd> to hide the overlay, as it dims the bottom of the scoreboard and interferes with recognition.

## Contributing
PRs welcome! Please keep the app buildless (plain ESM) and make use of JSDoc to ensure type-safety.

## Notes
- Requires camera permission (browser will prompt).
- All camera usage is locally processed on your device.
- Works best in Chrome/Edge/Firefox; but should work in any modern browser.
- OCR uses tesseract.js via CDN; no server, no build step.
- Designed for Lounge Queue and provides Export in that format. Squad Queue may need adjustments to the export.

![Process demonstration](./img/process-demo.jpg)
