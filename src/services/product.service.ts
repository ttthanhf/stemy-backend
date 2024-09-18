import productRepository from '~repositories/product.repository';
import { PageInfoArgs, SortOrderArgs } from '~types/args/pagination.arg';
import { PaginationUtil } from '~utils/pagination.util';

export class ProductService {
	static async getProductsPagination(
		/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
		fields: any,
		pageInfoArgs: PageInfoArgs,
		sortOrderArgs: SortOrderArgs
	) {
		const pageResult = PaginationUtil.avoidTrashInput(pageInfoArgs);

		return await productRepository.findAndCount(
			{},
			{
				fields: fields,
				...pageResult,
				orderBy: {
					[sortOrderArgs.sort]: sortOrderArgs.order
				}
			}
		);
	}
}
