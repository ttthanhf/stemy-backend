import { GraphQLResolveInfo } from 'graphql';
import {
	PageInfo,
	ProductsPaginatedResponse
} from 'models/responses/pagination.response';
import { Args, Info, Query, Resolver } from 'type-graphql';
import { ProductService } from '~services/product.service';
import { PageInfoArgs, SortOrderArgs } from '~types/args/pagination.arg';

import { ResolverUtil } from '~utils/resolver.util';

@Resolver()
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
}
