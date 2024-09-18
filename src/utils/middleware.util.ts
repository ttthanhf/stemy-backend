import { HttpResponse, HttpRequest } from 'uWebSockets.js';

type Middleware = (
	res: HttpResponse,
	req: HttpRequest,
	next: () => void
) => void;

export function useMiddlewares(
	middlewares: Middleware[],
	handler: (response: HttpResponse, request: HttpRequest) => void
) {
	return (response: HttpResponse, request: HttpRequest) => {
		function runMiddleware(index: number) {
			if (index < middlewares.length) {
				middlewares[index](response, request, () => runMiddleware(index + 1));
			} else {
				handler(response, request);
			}
		}
		runMiddleware(0);
	};
}
