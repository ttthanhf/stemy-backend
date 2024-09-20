import { Product } from '~entities/product.entity';
import {
	productCategoryRepository,
	productRepository
} from '~repositories/product.repository';
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
		return productRepository.findAndCount(
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

	static async createProduct(product: Product) {
		return productRepository.createAndSave(product);
	}

	static async getProductById(id: number) {
		return productRepository.findOne({ id });
	}
}

export class ProductCategoryService {
	static async getProductCategoryById(id: number) {
		return productCategoryRepository.findOne({ id });
	}
}
