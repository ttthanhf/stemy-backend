import { TemplatedApp } from 'uWebSockets.js';
import { authRoute } from './auth.route';
import { createYoga } from 'graphql-yoga';
import { yogaConfig } from '~configs/yoga.config';

export async function routerInit(app: TemplatedApp) {
	authRoute(app);

	app.any('/graphql', createYoga(yogaConfig));

	app.any('/*', (res) => {
		res.end('404');
	});
}
