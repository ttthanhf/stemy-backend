import { GraphQLError, GraphQLResolveInfo } from 'graphql';
import { PageInfo } from 'models/responses/pagination/base.response';
import { ProductsWithPaginationResponse } from 'models/responses/pagination/product.response';
import { Arg, Args, Info, Mutation, Query, Resolver } from 'type-graphql';
import { Product, ProductCategory } from '~entities/product.entity';
import {
	ProductCategoryService,
	ProductImageService,
	ProductLabService,
	ProductService
} from '~services/product.service';
import { PageInfoArgs, SortOrderArgs } from '~types/args/pagination.arg';
import { FilterSearchProduct } from '~types/args/product.arg';
import { ProductInput } from '~types/inputs/product.input';
import { ProductCategoryInput } from '~types/inputs/productCategory.input';
import { FileScalar, FileUpload } from '~types/scalars/file.scalar';
import { ResolverUtil } from '~utils/resolver.util';

@Resolver()
export class ProductResolver {
	@Query(() => ProductsWithPaginationResponse)
	async products(
		@Info() info: GraphQLResolveInfo,
		@Args() pageInfoArgs: PageInfoArgs,
		@Args() sortOrderArgs: SortOrderArgs,
		@Args() filterSearchArgs: FilterSearchProduct
	) {
		const fields = ResolverUtil.getFields(
			info.fieldNodes[0].selectionSet?.selections
		);

		const [products, totalItem] = await ProductService.getProductsPagination(
			fields,
			pageInfoArgs,
			sortOrderArgs,
			filterSearchArgs
		);

		const pageInfo = new PageInfo(totalItem, pageInfoArgs);

		return {
			items: products,
			pageInfo: pageInfo
		};
	}

	@Query(() => Product)
	async product(@Info() info: GraphQLResolveInfo, @Arg('id') id: number) {
		const fields = ResolverUtil.getNodes(
			info.fieldNodes[0].selectionSet?.selections
		);

		return await ProductService.getProductById(id, fields);
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

		if (lab.type != 'application/pdf') {
			throw new GraphQLError(lab.name + ' not a PDF');
		}
		if (lab.blobParts[0].byteLength > 1000000) {
			throw new GraphQLError(lab.name + ' must not exceed 1MB');
		}

		const product = await ProductService.createProduct(input);

		// Create image
		for await (const image of images) {
			await ProductImageService.createProductImage(product, image);
		}

		// Create lab
		await ProductLabService.createProductLab(product, lab, input.labPrice);

		return product;
	}

	@Mutation(() => Product)
	async deleteProduct(@Arg('id') id: number) {
		return await ProductService.softDeleteProduct(id);
	}

	@Mutation(() => Product)
	async updateProduct(
		@Arg('id') id: number,
		@Arg('input') input: ProductInput,
		@Arg('images', () => [FileScalar], { nullable: true })
		images?: FileUpload[],
		@Arg('lab', () => FileScalar, { nullable: true }) lab?: FileUpload
	) {
		if (images && images.length > 5) {
			throw new GraphQLError('Only upload a maximum of 5 images');
		}

		if (images) {
			images.forEach((image) => {
				if (
					!image.type.startsWith('image/') &&
					image.type !== 'application/octet-stream'
				) {
					throw new GraphQLError(image.name + ' not a image');
				}
				if (image.blobParts[0].byteLength > 1000000) {
					throw new GraphQLError(image.name + ' must not exceed 1MB');
				}
			});
		}

		if (lab) {
			if (lab.type != 'application/pdf') {
				throw new GraphQLError(lab.name + ' not a PDF');
			}
			if (lab.blobParts[0].byteLength > 1000000) {
				throw new GraphQLError(lab.name + ' must not exceed 1MB');
			}
		}

		const product = await ProductService.updateProduct(id, input);

		if (images) {
			await ProductImageService.updateProductImages(product, images);
		}

		if (lab && input.labPrice) {
			await ProductLabService.updateProductLab(product, lab, input.labPrice);
		} else if (!lab && input.labPrice) {
			await ProductLabService.updateProductLabPrice(product, input.labPrice);
		}

		return product;
	}
}

@Resolver()
export class ProductCategoryResolver {
	@Query(() => [ProductCategory])
	async productCategories(@Info() info: GraphQLResolveInfo) {
		const fields = ResolverUtil.getNodes(
			info.fieldNodes[0].selectionSet?.selections
		);
		const categories =
			await ProductCategoryService.getProductCategories(fields);
		return categories;
	}

	@Query(() => ProductCategory, { nullable: true })
	async productCategory(@Arg('id') id: number) {
		const productCategory =
			await ProductCategoryService.getProductCategoryById(id);
		return productCategory;
	}

	@Mutation(() => ProductCategory)
	async createProductCategory(@Arg('input') input: ProductCategoryInput) {
		return await ProductCategoryService.createProductCategory(input);
	}

	@Mutation(() => ProductCategory)
	async updateProductCategory(
		@Arg('id') id: number,
		@Arg('input') input: ProductCategoryInput
	) {
		return await ProductCategoryService.updateProductCategory(id, input);
	}

	@Mutation(() => ProductCategory)
	async deleteProductCategory(@Arg('id') id: number) {
		return await ProductCategoryService.deleteProductCategory(id);
	}
}
