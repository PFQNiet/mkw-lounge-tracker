import { MogiData } from "./src/mogidata.js";

const params = new URLSearchParams(location.search);
/** @type {(data:MogiData)=>void} */
const renderer = await (()=>new Promise(res=>{
	import(`./src/ui/${params.get('theme') || 'vertical'}.js`)
		.then(m => res(m.default))
		.catch(e => {
			document.body.append(`<p style="color:red">Failed to load theme ${params.get('theme') || 'vertical'}: ${e}</p>`);
			res(()=>{});
		});
}))();

const sse = new EventSource('/events');
sse.addEventListener('state', e=>{
	const rawData = JSON.parse(e.data);
	const pending = document.getElementById('waiting-for-mogi');
	if( rawData.status === 'waiting') {
		if( !pending) {
			const notice = document.createElement('p');
			notice.id = 'waiting-for-mogi';
			notice.textContent = 'Waiting for Mogi data...';
			document.body.append(notice);
		}
	}
	else {
		pending?.remove();
		const mogiData = MogiData.fromRaw(rawData);
		renderer(mogiData);
	}
});
