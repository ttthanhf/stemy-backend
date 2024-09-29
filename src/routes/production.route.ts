import { TemplatedApp } from 'uWebSockets.js';
import { ProductionController } from '~controllers/production.controller';

export function productionRoute(app: TemplatedApp) {
	app.get('/production/hash4build', ProductionController.getHash4Build);
}
