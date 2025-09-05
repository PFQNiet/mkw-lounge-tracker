export default {
	_meta: {
		name: 'English',
		dir: 'ltr',
		code: 'en'
	},

	text: {
		title: "MKW Mogi Manager",
		loading: "Loading…",
		processing: "Processing…",
		save: "Save",
		confirm: "Confirm",
		cancel: "Cancel",
		blank: "—",
		landingPage: {
			lead: "Capture, OCR, score; right in your browser. No installs, no uploads.",
			features: [
				"Offline OCR",
				"Disconnect handler",
				"Manual resolve + edit",
				"Lounge export"
			],
			steps: [
				"**1.** Click __Get started__ and paste the 12-player roster (`1. Name (12345 MMR)`).",
				"**2.** Pick your virtual webcam in the preview area.",
				"**3.** After each race, hit __Capture & OCR__. We'll auto-match; if unsure, we'll ask.",
				"**4.** Fix anything via __Edit__ → __Save__. Export scores when done."
			],
			getStartedButton: "🚀 Get started",
			notesLabel: "Notes",
			notes: [
				"Race 1 must include all 12 players.",
				"10-player races are valid; 9 or fewer are a redo.",
				"DCs score 1 point (CPU names can appear, just confirm who DC'd).",
				"Everything stays local in your browser.",
				"Auto-capture [BETA]: detects when you take a screenshot on your Switch and automatically captures it."
			],
			aboutLabel: "About",
			about: [
				"Made by [Niet](https://github.com/PFQNiet)",
				"[View source on GitHub](https://github.com/PFQNiet/mkw-lounge-tracker)",
				"[Report a bug](https://github.com/PFQNiet/mkw-lounge-tracker/issues)"
			]
		},
		rosterSetup: {
			title: "Roster setup",
			instructions: "Paste {count} lines like: `1. Name (5000 MMR)`",
			wrongLength: "Expected {count} lines, got {actual}.",
			badLine: "Bad line: “{line}”",
			rosterLoaded: "Roster loaded!"
		},
		capture: {
			camera: "Camera",
			noCameras: "(No cameras found)",
			selectCamera: "— Select camera —",
			cameraFallbackLabel: "Camera {deviceId}",
			cameraStopped: "Camera stopped",
			cameraStarted: "Camera started: {label}",
			cameraFailedToStart: "Could not start the selected camera",
			captureButton: "📸 Capture & OCR",
			localSaveReminder: "⚠️ Remember to always screenshot on Switch as well!",
			autoCaptureLabel: "Auto-capture [BETA]",
			lastCapture: "Last capture",
			ocrResult: "OCR: “{ocrText}” · {ocrConfidence}%",
			unresolved: "(unresolved)",
			maxRacesReached: "You have reached the maximum number of races.",
			captureCancelled: "Capture cancelled",
			noScoreboardDetected: "No scoreboard detected — try capturing on the results screen.",
			ocrFailed: "OCR failed. See console for details.",
			raceSaved: "Race {number} saved!"
		},
		manualResolution: {
			title: "Resolve unmatched players",
			selectPlayer: "— Select player —"
		},
		editRace: {
			title: "Edit race",
			deleteRaceButton: "Delete race",
			confirmDelete: "Delete this race permanently?",
			disconnectedPlace: "DC",
			uniquePlacementError: "Each placement 1..12 can only be chosen once.",
			raceUpdated: "Race {number} updated!",
			raceDeleted: "Race {number} deleted!"
		},
		editRoster: {
			title: "Edit roster",
			loungeName: "Lounge name",
			ingameName: "In-game name",
			substitute: "Substitute",
			autodetect: "(autodetect)",
			noSubstitute: "(none)",
			editSubButton: "Edit",
			rosterUpdated: "Roster updated!"
		},
		substitutePlayer: {
			title: "Substitute player",
			joinedAt: "Joined race #",
			newSubstitute: "New substitute",
			substituteUpdated: "Substitute updated!"
		},
		scoreboard: {
			title: "Scoreboard",
			player: "Player",
			raceNumber: "R{number}",
			total: "Total",
			editRosterButton: "Edit roster",
			editRaceButton: "Edit",
			newSessionButton: "🧹 New session",
			downloadZipButton: "📦 Download ZIP",
			exportScoresButton: "📤 Export scores"
		},
		exportScores: {
			title: "Export scores",
			close: "Close",
			copy: "Copy",
			copiedToClipboard: "Copied to clipboard!",
			failedToCopy: "Failed to copy to clipboard, press Ctrl/Cmd+C to copy manually."
		},
		gallery: {
			title: "Race history",
			imageAltText: "Race {number} snapshot",
			imageCaption: "Race {number} · {time}"
		}
	},

	format: {
		/** @param {number} n */
		ordinal(n) {
			const ruleset = new Intl.PluralRules('en', { type: 'ordinal' });
			switch (ruleset.select(n)) {
				case 'one': return 'st';
				case 'two': return 'nd';
				case 'few': return 'rd';
				default: return 'th';
			}
		},
		/** @param {number} n */
		place(n) {
			// Prepend a FIGURE SPACE for single-digit numbers so they align with 10+ in mono/tabular fonts.
			return `${n < 10 ? '\u2007' : ''}${n}${this.ordinal(n)}`;
		},

		/** @param {number} n */
		number(n) { return n.toLocaleString('en'); },
		/** @param {Date} d */
		time(d) { return d.toLocaleTimeString('en', { timeStyle: 'short' }); }
	}
};
