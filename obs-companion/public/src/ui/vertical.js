/** @typedef {import("../mogidata.js").MogiData} MogiData */

const css = `
#vertical {
	background-color: #00000080;
	box-shadow: inset 0 0 16px #000000;
	border-radius: 16px;
	padding: 8px;
	color: #eee;
	font-family: sans-serif;
	font-weight: bold;
	font-size: 32px;
}
#vertical td {
	vertical-align: middle;
}
#vertical td.name {
	max-width: calc(100vw - 32px - 120px);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
`;
const style = document.createElement('style');
style.textContent = css;
document.body.append(style);

const container = document.createElement('div');
container.id = 'vertical';

const scoreTable = document.createElement('table');
container.append(scoreTable);

let isFirst = true;
/** @param {MogiData} data */
export default function update(data) {
	if( isFirst) {
		document.body.append(container);
		isFirst = false;
	}

	const playersPerTeam = data.meta.playersPerTeam;
	const roster = data.roster;
	const totals = /** @type {Map<string,number>} */(new Map);
	const totalsPerTeam = /** @type {Map<number,number>} */(new Map);
	for( const race of data.races) {
		for( const placement of race.placements) {
			totals.set(placement.playerId, (totals.get(placement.playerId) || 0) + placement.score);
		}
	}
	totals.forEach((score, playerId) => {
		const teamId = roster.find(p => p.id === playerId)?.seed || 0;
		totalsPerTeam.set(teamId, (totalsPerTeam.get(teamId) || 0) + score);
	});

	// Build <tbody>
	const tbody = document.createElement('tbody');
	let lastScore = -1;
	if( playersPerTeam === 1) {
		const sorted = roster.toSorted((p1, p2) =>
			(totals.get(p2.id)||0) - (totals.get(p1.id)||0) // decreasing player score
			|| p1.id.localeCompare(p2.id) // alphabetically by ID
		);
		for (const p of sorted) {
			const playerScore = totals.get(p.id) || 0;
			const activePlayer = p.substitutes[p.substitutes.length-1] || p;

			if( lastScore >= 0) {
				const tr = document.createElement('tr');
				const diff = lastScore - playerScore;
				const sign = diff === 0 ? '±' : '+';
				const tdDiff = document.createElement('td');
				tdDiff.rowSpan = 2;
				tdDiff.textContent = `${sign}${diff}`;
				tr.append(tdDiff);
				tbody.append(tr);
			}

			const tr = document.createElement('tr');
			const tdName = document.createElement('td');
			tdName.classList.add('name');
			tdName.rowSpan = 2;
			tdName.textContent = activePlayer.name;

			const tdTotal = document.createElement('td');
			tdTotal.rowSpan = 2;
			tdTotal.textContent = String(playerScore).padStart(3, '\u2007');
			tr.append(tdName, tdTotal);

			if( lastScore < 0) {
				const tdDiff = document.createElement('td');
				tdDiff.style.fontSize = '50%';
				tdDiff.textContent = '\u2007';
				tr.append(tdDiff);
			}
			lastScore = playerScore;

			tbody.append(tr);
		}
	}
	else {
		const sorted = data.teams.toSorted((t1, t2) =>
			(totalsPerTeam.get(t2.seed) || 0) - (totalsPerTeam.get(t1.seed) || 0) // decreasing team score
			|| t1.seed - t2.seed // increasing seed
		);
		for (const t of sorted) {
			const teamScore = totalsPerTeam.get(t.seed) || 0;
			if( lastScore >= 0) {
				const tr = document.createElement('tr');
				const diff = lastScore - teamScore;
				const sign = diff === 0 ? '±' : '+';
				const tdDiff = document.createElement('td');
				tdDiff.rowSpan = 2;
				tdDiff.textContent = `${sign}${diff}`;
				tr.append(tdDiff);
				tbody.append(tr);
			}

			const tr = document.createElement('tr');
			const tdTeam = document.createElement('td');
			tdTeam.rowSpan = 2;
			tdTeam.textContent = t.tag || String.fromCharCode('A'.charCodeAt(0) + t.seed - 1);

			const tdTeamTotal = document.createElement('td');
			tdTeamTotal.rowSpan = 2;
			tdTeamTotal.textContent = String(teamScore).padStart(3, '\u2007');
			tr.append(tdTeam, tdTeamTotal);

			if( lastScore < 0) {
				const tdDiff = document.createElement('td');
				tdDiff.style.fontSize = '50%';
				tdDiff.textContent = '\u2007';
				tr.append(tdDiff);
			}
			lastScore = teamScore;

			tbody.append(tr);
		}
	}
	{ // final spacer
		const tr = document.createElement('tr');
		const tdDiff = document.createElement('td');
		tdDiff.style.fontSize = '50%';
		tdDiff.textContent = '\u2007';
		tr.append(tdDiff);
		tbody.append(tr);
	}

	// Swap table content
	scoreTable.replaceChildren(tbody);
}
