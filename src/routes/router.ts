import { TemplatedApp } from 'uWebSockets.js';
import { authRoute } from './auth.route';
import { createYoga } from 'graphql-yoga';
import { yogaConfig } from '~configs/yoga.config';
import { downloadRoute } from './download.route';
import { productionRoute } from './production.route';
import { webHookRoute } from './webhook.route';

export async function routerInit(app: TemplatedApp) {
	authRoute(app);
	downloadRoute(app);
	productionRoute(app);
	webHookRoute(app);

	app.any('/graphql', createYoga(yogaConfig));

	app.any('/*', (res) => {
		res.end('404');
	});
}
