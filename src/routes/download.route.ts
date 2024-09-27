import { TemplatedApp } from 'uWebSockets.js';
import { DownloadController } from '~controllers/download.controller';

export function downloadRoute(app: TemplatedApp) {
	app.get('/download/:productId', DownloadController.downloadLab);
}
