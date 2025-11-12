export default {
	_meta: {
		name: 'Deutsch',
		dir: 'ltr',
		code: 'de'
	},

	text: {
		title: "MKW Mogi Manager",
		loading: "Wird geladen…",
		processing: "Wird verarbeitet…",
		save: "Speichern",
		confirm: "Bestätigen",
		cancel: "Abbrechen",
		blank: "—",

		landingPage: {
			lead: "Capture, OCR, Punkte ; direkt im Browser. Keine Installation, kein Upload.",
			features: [
				"Offline-OCR",
				"DC-Handling",
				"Manuelle Zuordnung & Bearbeitung",
				"Lounge-Export"
			],
			steps: [
				"**1.** Klicke **Los geht's** und füge die 12-Spieler-Liste ein (`1. Name (12345 MMR)`)",
				"**2.** Wähle deine virtuelle Webcam in der Vorschau.",
				"**3.** Nach jedem Rennen **Aufnehmen & OCR** drücken. Zuordnung passiert automatisch; bei Unsicherheit wirst du gefragt.",
				"**4.** Korrigiere über **Bearbeiten** → **Speichern**. Am Ende Punkte exportieren."
			],
			getStartedButton: "🚀 Los geht's",
			notesLabel: "Hinweise",
			notes: [
				"Rennen 1 muss alle 12 Spieler enthalten.",
				"10-Spieler-Rennen sind gültig; 9 oder weniger ⇒ Neustart.",
				"Unterstützt FFA-, 2v2-, 3v3-, 4v4- und 6v6-Lounge-Queue-Formate.",
				"Alles bleibt lokal in deinem Browser.",
				"Auto-Capture: erkennt den Ergebnisscreen der Switch und speichert automatisch."
			],
			aboutLabel: "Über",
			about: [
				"Erstellt von [Niet](https://github.com/PFQNiet)",
				"[Quellcode auf GitHub ansehen](https://github.com/PFQNiet/mkw-lounge-tracker)",
				"[Bug melden](https://github.com/PFQNiet/mkw-lounge-tracker/issues)"
			]
		},

		rosterSetup: {
			title: "Spielerliste einrichten",
			instructions: "Füge {count} Spieler ein, z. B.: `1. Name1, Name2 (5000MMR)`",
			wrongLength: "Erwartet: {count} Spieler, erhalten: {actual}.",
			badLine: "Ungültige Zeile: „{line}“",
			rosterLoaded: "Liste geladen!"
		},

		capture: {
			camera: "Kamera",
			noCameras: "(Keine Kamera gefunden)",
			selectCamera: "— Kamera auswählen —",
			cameraFallbackLabel: "Kamera {deviceId}",
			cameraStopped: "Kamera gestoppt",
			cameraStarted: "Kamera gestartet: {label}",
			cameraFailedToStart: "Ausgewählte Kamera konnte nicht gestartet werden",
			captureButton: "📸 Aufnehmen & OCR",
			localSaveReminder: "⚠️ Mache zusätzlich einen Screenshot auf der Switch!",
			autoCaptureLabel: "Auto-Capture",
			lastCapture: "Letzte Aufnahme",
			ocrResult: "OCR: „{ocrText}“",
			unresolved: "(nicht zugeordnet)",
			maxRacesReached: "Maximale Anzahl Rennen erreicht.",
			captureCancelled: "Aufnahme abgebrochen",
			noScoreboardDetected: "Kein Ergebnisscreen erkannt — bitte den Ergebnisscreen erfassen.",
			noPauseScreenDetected: "Keine Namen gefunden — bitte den Pausebildschirm öffnen.",
			ocrFailed: "OCR fehlgeschlagen. Details in der Konsole.",
			raceSaved: "Rennen {number} gespeichert!"
		},

		manualResolution: {
			title: "Nicht zugeordnete Spieler auflösen",
			selectPlayer: "— Spieler auswählen —"
		},

		editRace: {
			title: "Rennen bearbeiten",
			instructions: "Wähle zwei Spieler zum Tauschen aus.",
			deleteRaceButton: "Rennen löschen",
			confirmDelete: "Dieses Rennen endgültig löschen?",
			disconnectedPlace: "DC",
			uniquePlacementError: "Jede Platzierung 1..12 darf nur einmal gewählt werden.",
			raceUpdated: "Rennen {number} aktualisiert!",
			raceDeleted: "Rennen {number} gelöscht!"
		},

		editRoster: {
			title: "Liste bearbeiten",
			team: "Team {id}",
			tag: "Tag",
			loungeName: "Lounge-Name",
			ingameName: "In-Game-Name",
			substitute: "Ersatzspieler",
			autodetect: "(automatisch erkannt)",
			noSubstitute: "(kein)",
			editSubButton: "Bearbeiten",
			autofill: "Auto-füllen",
			rosterUpdated: "Liste aktualisiert!"
		},

		substitutePlayer: {
			title: "Spieler ersetzen",
			joinedAt: "Eingestiegen ab Rennen Nr.",
			newSubstitute: "Neuer Ersatzspieler",
			substituteUpdated: "Ersatzspieler aktualisiert!"
		},

		scoreboard: {
			title: "Rangliste",
			team: "Team",
			player: "Spieler",
			raceNumber: "R{number}",
			total: "Gesamt",
			editRosterButton: "Liste bearbeiten",
			newSessionButton: "🧹 Neue Session",
			snapshotScoresButton: "🖼️ Schnappschuss",
			downloadZipButton: "📦 ZIP herunterladen",
			exportScoresButton: "📤 Punkte exportieren"
		},

		exportScores: {
			title: "Punkte exportieren",
			format: "Format",
			close: "Schließen",
			copy: "Kopieren",
			copiedToClipboard: "Kopiert!",
			failedToCopy: "Kopieren fehlgeschlagen — mit Strg/Cmd+C manuell kopieren."
		},

		gallery: {
			title: "Rennhistorie",
			imageAltText: "Screenshot Rennen {number}",
			imageCaption: "Rennen {number} · {time}"
		}
	},

	format: {
		ordinal() {
			// Deutsche Ordinale: „1.“ „2.“ „3.“ …
			return '.';
		},
		/** @param {number} n */
		place(n) {
			// Pad single digits with FIGURE SPACE so „2.“ aligns with „10.“ in Mono/Tabular
			return `${n < 10 ? '\u2007' : ''}${n}.`;
		},
		/** @param {number} n */
		number(n) { return n.toLocaleString('de'); },
		/** @param {Date} d */
		time(d) { return d.toLocaleTimeString('de', { timeStyle: 'short' }); }
	}
};
