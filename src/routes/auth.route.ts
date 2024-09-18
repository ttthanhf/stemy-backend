import { TemplatedApp } from 'uWebSockets.js';
import { AuthController } from '~controllers/auth.controller';

export function authRoute(app: TemplatedApp) {
	app.get(
		'/login/:auth-provider-name/redirect',
		AuthController.redirectLoginOauth2
	);
	app.get('/login/:auth-provider-name/url', AuthController.getUrlLoginOauth2);
	app.get('/login/:auth-provider-name/callback', AuthController.loginOauth2);
}
