import { TemplatedApp } from 'uWebSockets.js';
import { DownloadController } from '~controllers/download.controller';

export function downloadRoute(app: TemplatedApp) {
	app.get('/download/:orderItemId', DownloadController.downloadLab);
	app.get('/download2/:orderItemId', DownloadController.downloadLab2);
}
