import { GraphQLResolveInfo } from 'graphql';
import { Info, Query, Resolver } from 'type-graphql';
import { ProductCategory } from '~entities/product.entity';
import { ProductCategoryService } from '~services/product.service';
import { ResolverUtil } from '~utils/resolver.util';

@Resolver()
export class ProductCategoryResolver {
	@Query(() => [ProductCategory])
	async productCategories(@Info() info: GraphQLResolveInfo) {
		const fields = ResolverUtil.getFields(
			info.fieldNodes[0].selectionSet?.selections
		);
		const categories =
			await ProductCategoryService.getProductCategories(fields);
		return categories;
	}
}
