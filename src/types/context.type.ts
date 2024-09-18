import { YogaInitialContext } from 'graphql-yoga';
import { HttpResponse } from 'uWebSockets.js';

export type Context = YogaInitialContext & {
	res: HttpResponse;
	/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
	data: any;
};
