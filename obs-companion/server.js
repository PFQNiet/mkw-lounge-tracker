import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const server = http.createServer();

const SSE = {
	state: /** @type {any} */({ status: 'waiting' }),
	listeners: /** @type {Set<http.ServerResponse>} */(new Set),
	/** @param {http.ServerResponse} res */
	add(res) {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
		res.setHeader('Cache-Control', 'no-cache');
		res.setHeader('Connection', 'keep-alive');
		res.write(': connected\n\n');
		res.write('event: state\ndata: ' + JSON.stringify(this.state) + '\n\n');
		this.listeners.add(res);
		res.req.on('close', () => { this.listeners.delete(res); });
	},
	/** @param {any} state */
	set(state) {
		this.state = state;
		this.listeners.forEach(res => {
			try {
				res.write('event: state\ndata: ' + JSON.stringify(this.state) + '\n\n');
			} catch {
				this.listeners.delete(res);
			}
		});
	},
	ping() {
		this.listeners.forEach(res => {
			try {
				res.write(': ping\n\n');
			} catch {
				this.listeners.delete(res);
			}
		});
	},
	heartbeat: setInterval(() => { SSE.ping(); }, 15000)
};

const PUBLIC_DIR = path.join(import.meta.dirname, 'public');
const MIME_TYPES = /** @type {Object<string,string>} */ ({
	'.html': 'text/html',
	'.css': 'text/css',
	'.js': 'application/javascript',
	'.png': 'image/png'
});
/**
 * @param {http.IncomingMessage} req
 * @returns {Promise<string>}
 */
function readRequestBody(req) {
	return new Promise(resolve => {
		const chunks = /** @type {string[]} */([]);
		req.on('data', chunk => { chunks.push(chunk); });
		req.on('end', () => {
			resolve(chunks.join(''));
		});
	});
}

server.on('request', (req, res) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

	if( req.method === "OPTIONS") {
		res.statusCode = 204;
		res.end();
		return;
	}

	const url = URL.parse(req.url ?? '/', 'http://localhost/');
	if( url?.pathname === '/events') {
		if( req.method === 'POST') {
			readRequestBody(req).then(body => {
				const data = (() => {
					try { return JSON.parse(body); }
					catch { return null; }
				})();
				if( !data) {
					res.statusCode = 400;
				}
				else {
					SSE.set(data);
					res.statusCode = 202;
				}
				res.end();
			});
		}
		else {
			SSE.add(res);
		}
		return;
	}

	if( req.method === 'GET') {
		const filename = url?.pathname.endsWith('/')
			? url.pathname + 'index.html'
			: url?.pathname;
		if( !filename) {
			res.statusCode = 400;
			res.end();
			return;
		}

		const localfile = path.join(PUBLIC_DIR, filename);
		if( !fs.existsSync(localfile)) {
			res.statusCode = 404;
			res.end();
			return;
		}

		const extension = path.extname(localfile);
		res.statusCode = 200;
		res.setHeader('Content-Type', MIME_TYPES[extension] ?? 'application/octet-stream');
		res.end(fs.readFileSync(localfile));
	}
});

function getThemeList() {
	return fs.readdirSync(path.join(PUBLIC_DIR, 'src/ui'))
		.filter(f=>f.endsWith('.js'))
		.map(f=>path.basename(f, '.js'))
		.toSorted();
}

server.on('listening', () => {
	const addr = server.address();
	if( !addr || typeof addr === 'string') return;
	const ip = addr.family === 'IPv6' ? `[${addr.address}]` : addr.address;
	const base = `http://${ip}:${addr.port}/`;
	console.log(`Overlay ready!`);
	console.log(`Configure Web Source in OBS to ${base} or one of the following themes:`);
	getThemeList().forEach(f=>console.log(`- ${f}: ${base}?theme=${f}`));
	console.log(`Press Ctrl+C to exit.`);
});
server.listen(52323, 'localhost');
