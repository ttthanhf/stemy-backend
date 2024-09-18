import { GraphQLError, GraphQLResolveInfo } from 'graphql';
import {
	PageInfo,
	ProductsPaginatedResponse
} from 'models/responses/pagination.response';
import { Arg, Args, Info, Mutation, Query, Resolver } from 'type-graphql';
import { Product } from '~entities/product.entity';
import {
	ProductCategoryService,
	ProductService
} from '~services/product.service';
import { PageInfoArgs, SortOrderArgs } from '~types/args/pagination.arg';
import { ProductInput } from '~types/inputs/product.input';
import { MapperUtil } from '~utils/mapper.util';

import { ResolverUtil } from '~utils/resolver.util';

@Resolver(Product)
export class ProductResolver {
	@Query(() => ProductsPaginatedResponse)
	async products(
		@Info() info: GraphQLResolveInfo,
		@Args() pageInfoArgs: PageInfoArgs,
		@Args() SortOrderArgs: SortOrderArgs
	) {
		const fields = ResolverUtil.getFields(
			info.fieldNodes[0].selectionSet?.selections,
			'items.'
		);

		const [products, totalItem] = await ProductService.getProductsPagination(
			fields,
			pageInfoArgs,
			SortOrderArgs
		);

		const pageInfo = new PageInfo(totalItem, pageInfoArgs);

		return {
			items: products,
			pageInfo: pageInfo
		};
	}

	@Mutation(() => Product)
	async createProduct(@Arg('input') input: ProductInput) {
		const productCategory = await ProductCategoryService.getProductCategoryById(
			input.categoryId
		);

		if (!productCategory) {
			throw new GraphQLError('Category not found');
		}

		const newProduct = MapperUtil.mapObjectToClass(input, Product);
		newProduct.category = productCategory;

		return await ProductService.createProduct(newProduct);
	}
}
