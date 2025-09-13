export default {
	_meta: {
		name: '日本語',
		dir: 'ltr',
		code: 'ja'
	},

	text: {
		title: 'MKW Mogi Manager',
		loading: '読み込み中…',
		processing: '処理中…',
		save: '保存',
		confirm: '確認',
		cancel: 'キャンセル',
		blank: '—',

		landingPage: {
			lead: 'キャプチャ → OCR → 集計をブラウザだけで。インストール不要・アップロード不要。',
			features: ['オフラインOCR', 'DC対応', '手動割り当てと編集', 'Loungeエクスポート'],
			steps: [
				'【1】「はじめる」 を押して、12人のリストを貼り付け（`1. 名前 (12345 MMR)`）。',
				'【2】プレビューで仮想ウェブカメラを選択。',
				'【3】各レース後に 「キャプチャ & OCR」。自動で割り当て。自信がない時は確認をお願いされます。',
				'【4】「編集」 → 「保存」 で修正。最後にスコアをエクスポート。'
			],
			getStartedButton: '🚀 はじめる',
			notesLabel: '注意事項',
			notes: [
				'レース1は12名が必須です。',
				'10人レースは有効。9人以下はやり直し。',
				'FFA、2v2、3v3、4v4、6v6 のラウンジキュー形式に対応しています。',
				'すべてブラウザ内で処理されます。',
				'自動キャプチャ［ベータ］：Switchの結果画面を検出して自動保存。'
			],
			aboutLabel: '情報',
			about: [
				'作成: [Niet](https://github.com/PFQNiet)',
				'[ソースコードを見る](https://github.com/PFQNiet/mkw-lounge-tracker)',
				'[不具合を報告](https://github.com/PFQNiet/mkw-lounge-tracker/issues)'
			]
		},

		rosterSetup: {
			title: 'プレイヤー一覧の設定',
			instructions: '{count}人のプレイヤーを貼り付けてください。例: `1. 名前1, 名前2 (5000MMR)`',
			wrongLength: '{count}人を想定しましたが、{actual}人になっています。',
			badLine: '無効な行: 「{line}」',
			rosterLoaded: '一覧を読み込みました！'
		},

		capture: {
			camera: 'カメラ',
			noCameras: '（カメラが見つかりません）',
			selectCamera: '— カメラを選択 —',
			cameraFallbackLabel: 'カメラ {deviceId}',
			cameraStopped: 'カメラ停止',
			cameraStarted: '開始: {label}',
			cameraFailedToStart: '選択したカメラを開始できませんでした',
			captureButton: '📸 キャプチャ & OCR',
			localSaveReminder: '⚠️ Switch本体でもスクリーンショットを撮っておくと安心です！',
			autoCaptureLabel: '自動キャプチャ［ベータ］',
			lastCapture: '最新のキャプチャ',
			ocrResult: 'OCR: 「{ocrText}」',
			unresolved: '（未確定）',
			maxRacesReached: 'レース数の上限に達しました。',
			captureCancelled: 'キャプチャをキャンセルしました',
			noScoreboardDetected: 'リザルト画面を検出できませんでした。リザルト画面をキャプチャしてください。',
			ocrFailed: 'OCRに失敗しました。詳細はコンソールをご確認ください。',
			raceSaved: 'レース {number} を保存しました！'
		},

		manualResolution: {
			title: '未確定プレイヤーの割り当て',
			selectPlayer: '— プレイヤーを選択 —'
		},

		editRace: {
			title: 'レースを編集',
			instructions: '入れ替えるプレイヤーを2人選択してください。',
			deleteRaceButton: 'レースを削除',
			confirmDelete: 'このレースを完全に削除しますか？',
			disconnectedPlace: 'DC',
			uniquePlacementError: '1～12位は同じ順位を重複して選べません。',
			raceUpdated: 'レース {number} を更新しました！',
			raceDeleted: 'レース {number} を削除しました！'
		},

		editRoster: {
			title: '一覧を編集',
			loungeName: 'Lounge名',
			ingameName: 'ゲーム内名',
			substitute: '代理プレイヤー',
			autodetect: '（自動検出）',
			noSubstitute: '（なし）',
			editSubButton: '編集',
			rosterUpdated: '一覧を更新しました！'
		},

		substitutePlayer: {
			title: 'プレイヤーを交代',
			joinedAt: '参加レース番号',
			newSubstitute: '新しい代理',
			substituteUpdated: '代理情報を更新しました！'
		},

		scoreboard: {
			title: 'スコアボード',
			team: 'チーム',
			player: 'プレイヤー',
			raceNumber: 'R{number}',
			total: '合計',
			editRosterButton: '一覧を編集',
			newSessionButton: '🧹 新規セッション',
			downloadZipButton: '📦 ZIP をダウンロード',
			exportScoresButton: '📤 スコアをエクスポート'
		},

		exportScores: {
			title: 'スコアをエクスポート',
			close: '閉じる',
			copy: 'コピー',
			copiedToClipboard: 'コピーしました！',
			failedToCopy: 'コピーに失敗。Ctrl/Cmd+Cで手動コピーしてください。'
		},

		gallery: {
			title: 'レース履歴',
			imageAltText: 'レース {number} のキャプチャ',
			imageCaption: 'レース {number} · {time}'
		}
	},

	format: {
		// 日本語は「n位」表記。1桁は桁揃えのためFIGURE SPACEを前に入れるときれい。
		ordinal() { return '位'; },
		/** @param {number} n */
		place(n) { return `${n < 10 ? '\u2007' : ''}${n}位`; },
		/** @param {number} n */
		number(n) { return n.toLocaleString('ja-JP'); },
		/** @param {Date} d */
		time(d) { return d.toLocaleTimeString('ja-JP', { timeStyle: 'short' }); }
	}
};
