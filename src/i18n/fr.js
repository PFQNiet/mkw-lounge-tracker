export default {
	_meta: {
		name: 'Français',
		dir: 'ltr',
		code: 'fr'
	},

	text: {
		title: "Mogi Manager MKW",
		loading: "Chargement…",
		processing: "Traitement…",
		save: "Enregistrer",
		confirm: "Confirmer",
		cancel: "Annuler",
		blank: "—",

		landingPage: {
			lead: "Capture, OCR, score ; directement dans votre navigateur. Aucun logiciel à installer, aucun envoi.",
			features: [
				"OCR hors ligne",
				"Gestion des déconnexions",
				"Résolution manuelle + édition",
				"Export Lounge"
			],
			steps: [
				"**1.** Cliquez sur __Commencer__ et collez la liste des 12 joueurs (`1. Nom (12345 MMR)`).",
				"**2.** Choisissez votre webcam virtuelle dans l'aperçu.",
				"**3.** Après chaque course, appuyez sur __Capturer & OCR__. Appariage automatique ; en cas de doute, on vous demandera.",
				"**4.** Corrigez via __Modifier__ → __Enregistrer__. Exportez les scores quand c'est fini."
			],
			getStartedButton: "🚀 Commencer",
			notesLabel: "Notes",
			notes: [
				"La course 1 doit inclure les 12 joueurs.",
				"Les courses à 10 joueurs sont valides ; 9 ou moins ⇒ à refaire.",
				"Prend en charge les formats FFA, 2v2, 3v3, 4v4 et 6v6 de la file Lounge.",
				"Tout reste local dans votre navigateur.",
				"Auto-capture : détecte la capture d'écran sur la Switch et l'enregistre automatiquement."
			],
			aboutLabel: "À propos",
			about: [
				"Créé par [Niet](https://github.com/PFQNiet)",
				"[Voir le code source sur GitHub](https://github.com/PFQNiet/mkw-lounge-tracker)",
				"[Signaler un bug](https://github.com/PFQNiet/mkw-lounge-tracker/issues)"
			]
		},

		rosterSetup: {
			title: "Configuration de la liste",
			instructions: "Collez {count} joueurs, par ex. : `1. Nom1, Nom2 (5000 MMR)`",
			wrongLength: "{count} joueurs attendus, {actual} trouvés.",
			badLine: "Ligne invalide : « {line} »",
			rosterLoaded: "Liste chargée !"
		},

		capture: {
			camera: "Caméra",
			noCameras: "(Aucune caméra trouvée)",
			selectCamera: "— Sélectionner une caméra —",
			cameraFallbackLabel: "Caméra {deviceId}",
			cameraStopped: "Caméra arrêtée",
			cameraStarted: "Caméra démarrée : {label}",
			cameraFailedToStart: "Impossible de démarrer la caméra sélectionnée",
			captureButton: "📸 Capturer & OCR",
			localSaveReminder: "⚠️ Pensez aussi à faire une capture d'écran sur la Switch !",
			autoCaptureLabel: "Auto-capture",
			lastCapture: "Dernière capture",
			ocrResult: "OCR : « {ocrText} »",
			unresolved: "(non résolu)",
			maxRacesReached: "Nombre maximal de courses atteint.",
			captureCancelled: "Capture annulée",
			noScoreboardDetected: "Aucun tableau de scores détecté — capturez l'écran des résultats.",
			noPauseScreenDetected: "Aucun nom trouvé — ouvrez l'écran Pause.",
			ocrFailed: "Échec de l'OCR. Voir la console pour plus de détails.",
			raceSaved: "Course {number} enregistrée !"
		},

		manualResolution: {
			title: "Résoudre les joueurs non appariés",
			selectPlayer: "— Sélectionner un joueur —"
		},

		editRace: {
			title: "Modifier la course",
			instructions: "Sélectionnez deux joueurs à permuter.",
			deleteRaceButton: "Supprimer la course",
			confirmDelete: "Supprimer définitivement cette course ?",
			disconnectedPlace: "DC",
			uniquePlacementError: "Chaque place 1..12 ne peut être choisie qu'une seule fois.",
			raceUpdated: "Course {number} mise à jour !",
			raceDeleted: "Course {number} supprimée !"
		},

		editRoster: {
			title: "Modifier la liste",
			team: "Équipe {id}",
			tag: "Tag",
			loungeName: "Nom Lounge",
			ingameName: "Nom en jeu",
			substitute: "Remplaçant",
			autodetect: "(détection auto)",
			noSubstitute: "(aucun)",
			editSubButton: "Modifier",
			autofill: "Remplir auto.",
			rosterUpdated: "Liste mise à jour !"
		},

		substitutePlayer: {
			title: "Remplacer un joueur",
			joinedAt: "A rejoint à la course n°",
			newSubstitute: "Nouveau remplaçant",
			substituteUpdated: "Remplaçant mis à jour !"
		},

		scoreboard: {
			title: "Classement",
			team: "Équipe",
			player: "Joueur",
			raceNumber: "C{number}",
			total: "Total",
			editRosterButton: "Modifier la liste",
			newSessionButton: "🧹 Nouvelle session",
			downloadZipButton: "📦 Télécharger le ZIP",
			exportScoresButton: "📤 Exporter les scores"
		},

		exportScores: {
			title: "Exporter les scores",
			format: "Format",
			close: "Fermer",
			copy: "Copier",
			copiedToClipboard: "Copié !",
			failedToCopy: "Échec de la copie, utilisez Ctrl/Cmd+C pour copier manuellement."
		},

		gallery: {
			title: "Historique des courses",
			imageAltText: "Capture de la course {number}",
			imageCaption: "Course {number} · {time}"
		}
	},

	format: {
		/** @param {number} n */
		ordinal(n) {
			// FR ordinals: 1er, then 2e, 3e, …; we'll add a FIGURE SPACE for mono alignment on other places.
			return `e${n === 1 ? 'r' : '\u2007'}`;
		},
		/** @param {number} n */
		place(n) {
			// Prepend a FIGURE SPACE for single-digit numbers so they align with 10+ in mono/tabular fonts.
			return `${n < 10 ? '\u2007' : ''}${n}${this.ordinal(n)}`;
		},

		/** @param {number} n */
		number(n) { return n.toLocaleString('fr'); },
		/** @param {Date} d */
		time(d) { return d.toLocaleTimeString('fr', { timeStyle: 'short' }); }
	}
};
