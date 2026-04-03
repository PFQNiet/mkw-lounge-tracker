# Overlay Setup Instructions (OBS)

Follow these steps to use the overlay with OBS.

## 1. Download the Overlay Bridge

* Go to the GitHub **Releases** page.
* Download the latest release ZIP file.
* Extract the ZIP file to a folder on your computer.

## 2. Start the Bridge Program

You have two options:

### Option A — Windows (easiest)

* Double-click **`bridge.exe`**
* A small window will open showing a local URL (for example: `http://localhost:52323/`)
* Leave this window open while you are using the overlay.

### Option B — Using Node.js

If you have Node.js installed:

* Open a terminal/command prompt in the extracted folder.
* Run:

  ```
  node .
  ```
* The program will start and display a local URL.
* Leave it running while you use the overlay.

## 3. Add the Overlay to OBS

* In OBS, add a new **Browser Source**.
* In the URL field, enter the URL shown in the bridge program.
* Set the width and height as desired.
* Click **OK**.

## 4. Connect the Overlay

* Open the MKW Lounge Tracker app in your browser.
* Click **“Connect overlay”**.
* The overlay should now update automatically during your session.

## Notes / Troubleshooting

* The bridge program must be running while you stream.
* If the connection fails, make sure:

  * The bridge program is running.
  * You allowed the browser permission to access **localhost**.
  * OBS is using the correct URL.

# Themes

Currently only one style is available (`vertical`). Creating your own is possible by creating a new file in `src/ui`.

Such a file should be a JS module that exports a function that will be called whenever the Mogi state changes. This function is then responsible for rendering the overlay.
