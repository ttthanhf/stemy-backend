import { readFile } from 'fs/promises';
import { HttpRequest, HttpResponse } from 'uWebSockets.js';

export class ProductionController {
	static async getHash4Build(res: HttpResponse, req: HttpRequest) {
		try {
			const data = await readFile('./hash4build.json', 'utf8');
			res.model.data = data;
			res.model.send();
			return;
		} catch (e) {
			res.model.errors = {
				message: e
			};
			res.model.send();
			return;
		}
	}
}
