import { GraphQLError, GraphQLResolveInfo } from 'graphql';
import { PageInfo } from 'models/responses/pagination/base.response';
import { ProductsWithPaginationResponse } from 'models/responses/pagination/product.response';
import { Arg, Args, Info, Mutation, Query, Resolver } from 'type-graphql';
import { Product } from '~entities/product.entity';
import {
	ProductCategoryService,
	ProductImageService,
	ProductLabService,
	ProductService
} from '~services/product.service';
import { PageInfoArgs, SortOrderArgs } from '~types/args/pagination.arg';
import { ProductInput } from '~types/inputs/product.input';
import { MapperUtil } from '~utils/mapper.util';
import { ResolverUtil } from '~utils/resolver.util';
import { FileScalar, FileUpload } from '~types/scalars/file.scalar';

@Resolver()
export class ProductResolver {
	@Query(() => ProductsWithPaginationResponse)
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
	async createProduct(
		@Arg('input') input: ProductInput,
		@Arg('images', () => [FileScalar]) images: FileUpload[],
		@Arg('lab', () => FileScalar) lab: FileUpload
	) {
		if (images.length > 5) {
			throw new GraphQLError('Only upload a maximum of 5 images');
		}

		images.forEach((image) => {
			if (!image.type.startsWith('image/')) {
				throw new GraphQLError(image.name + ' not a image');
			}
			if (image.blobParts[0].byteLength > 1000000) {
				throw new GraphQLError(image.name + ' must not exceed 1MB');
			}
		});

		if (lab.type == 'application/pdf') {
			throw new GraphQLError(lab.name + ' not a PDF');
		}
		if (lab.blobParts[0].byteLength > 1000000) {
			throw new GraphQLError(lab.name + ' must not exceed 1MB');
		}

		const productCategory = await ProductCategoryService.getProductCategoryById(
			input.categoryId
		);

		if (!productCategory) {
			throw new GraphQLError('Category not found');
		}

		let newProduct = MapperUtil.mapObjectToClass(input, Product);
		newProduct.category = productCategory;

		newProduct = await ProductService.createProduct(newProduct);

		// Create image
		for await (const image of images) {
			await ProductImageService.createProductImage(newProduct, image);
		}

		// Create lab
		await ProductLabService.createProductLab(newProduct, lab);

		return newProduct;
	}
}
