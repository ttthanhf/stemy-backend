import { PageInfoArgs } from '~types/args/pagination.arg';

export class PaginationUtil {
	static avoidTrashInput(pageInfoArgs: PageInfoArgs) {
		const limit = pageInfoArgs.currentItem <= 0 ? 1 : pageInfoArgs.currentItem;
		const offset = pageInfoArgs.currentPage <= 0 ? 1 : pageInfoArgs.currentPage;
		return {
			limit,
			offset
		};
	}
}
