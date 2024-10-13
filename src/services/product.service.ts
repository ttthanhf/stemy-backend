import { GraphQLError } from 'graphql';
import { env } from '~configs/env.config';
import {
	Product,
	ProductCategory,
	ProductImage,
	ProductLab
} from '~entities/product.entity';
import {
	productCategoryRepository,
	productImageRepository,
	productLabRepository,
	productRepository
} from '~repositories/product.repository';
import { PageInfoArgs, SortOrderArgs } from '~types/args/pagination.arg';
import { ProductInput } from '~types/inputs/product.input';
import { FileUpload } from '~types/scalars/file.scalar';
import { MapperUtil } from '~utils/mapper.util';
import { NumberUtil } from '~utils/number.util';
import { PaginationUtil } from '~utils/pagination.util';
import { UploadService } from './upload.service';
import { FilterSearchProduct } from '~types/args/product.arg';
import { ProductCategoryInput } from '~types/inputs/productCategory.input';

export class ProductService {
	static async getProductsPagination(
		/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
		fields: any,
		pageInfoArgs: PageInfoArgs,
		sortOrderArgs: SortOrderArgs,
		filterSearchArgs: FilterSearchProduct
	) {
		const pageResult = PaginationUtil.avoidTrashInput(pageInfoArgs);
		const categoryIdsQuery =
			filterSearchArgs.categoryIds.length > 0
				? {
						categories: {
							id: {
								$in: filterSearchArgs.categoryIds
							}
						}
					}
				: {};
		const searchQuery =
			filterSearchArgs.search.trim() != ''
				? {
						name: {
							$like: `%${filterSearchArgs.search}%`
						}
					}
				: {};
		const ratingQuery =
			filterSearchArgs.minRating != 0 && filterSearchArgs.maxRating != 5
				? {
						rating: {
							$gte: filterSearchArgs.minRating,
							$lte: filterSearchArgs.maxRating
						}
					}
				: {};
		const priceQuery = {
			price: {
				$gte: filterSearchArgs.minPrice,
				$lte: filterSearchArgs.maxPrice
			}
		};
		return productRepository.findAndCount(
			{
				...searchQuery,
				...categoryIdsQuery,
				...ratingQuery,
				...priceQuery,
				isDelete: false
			},
			{
				fields: fields,
				...pageResult,
				orderBy: {
					[sortOrderArgs.sort]: sortOrderArgs.order
				}
			}
		);
	}

	static async createProduct(input: ProductInput) {
		const productCategories =
			await ProductCategoryService.getProductCategoryByIds(input.categoryIds);

		if (!productCategories) {
			throw new GraphQLError('Category not found');
		}

		const product = MapperUtil.mapObjectToClass(input, Product);
		productCategories.forEach((category) => product.categories.add(category));

		return productRepository.createAndSave(product);
	}

	/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
	static async getProductById(id: number, fields?: any) {
		return productRepository.findOne({ id, isDelete: false }, { fields });
	}

	static async updateProducts(products: Product[]) {
		return await productRepository.save(products);
	}

	static async softDeleteProduct(id: number) {
		const product = await productRepository.findOne({ id });

		if (!product) {
			throw new GraphQLError('Product not found');
		}

		product.isDelete = true;
		product.deletedAt = new Date();

		await this.updateProducts([product]);

		return product;
	}

	static async updateProduct(id: number, input: ProductInput) {
		const product = await productRepository.findOne({
			id: id,
			isDelete: false
		});

		if (!product) {
			throw new GraphQLError('Product not found');
		}

		if (input.name) product.name = input.name;
		if (input.description) product.description = input.description;
		if (input.price) product.price = input.price;

		if (input.categoryIds) {
			const productCategories =
				await ProductCategoryService.getProductCategoryByIds(input.categoryIds);
			if (!productCategories) {
				throw new GraphQLError('Category not found');
			}
			product.categories.removeAll();
			productCategories.forEach((category) => product.categories.add(category));
		}

		await productRepository.save(product);

		return product;
	}
}

export class ProductCategoryService {
	static async getProductCategoryByIds(ids: number[]) {
		return productCategoryRepository.find({
			id: {
				$in: ids
			}
		});
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	static async getProductCategories(fields: any) {
		return productCategoryRepository.find({}, { fields });
	}

	static async getProductCategoryById(id: number) {
		return productCategoryRepository.findOne({ id });
	}

	static async createProductCategory(input: ProductCategoryInput) {
		const productCategory = MapperUtil.mapObjectToClass(input, ProductCategory);
		return productCategoryRepository.createAndSave(productCategory);
	}

	static async updateProductCategory(id: number, input: ProductCategoryInput) {
		const productCategory = await productCategoryRepository.findOne({ id });
		if (!productCategory) {
			throw new GraphQLError('Product category not found');
		}
		productCategory.name = input.name;
		productCategory.title = input.title;
		productCategory.type = input.type;

		return productCategoryRepository.save(productCategory);
	}

	static async deleteProductCategory(id: number) {
		const productCategory = await productCategoryRepository.findOne({ id });
		if (!productCategory) {
			throw new GraphQLError('Product category not found');
		}

		// Check if there are any products associated with this category
		const productsCount = await productRepository.count({
			categories: {
				id: id
			},
			isDelete: false
		});

		if (productsCount > 0) {
			throw new GraphQLError('Cannot delete category with associated products');
		}

		productCategory.isDelete = true;
		productCategory.deletedAt = new Date();

		await productCategoryRepository.save(productCategory);
		return productCategory;
	}
}

export class ProductImageService {
	static async createProductImage(product: Product, image: FileUpload) {
		const imageName =
			'stemy-product-' +
			product.id +
			'-T-' +
			String(Date.now()) +
			'-' +
			NumberUtil.getRandomNumberByLength(3) +
			'.png';

		await UploadService.uploadFile(imageName, image.blobParts[0]);

		const productImage = new ProductImage();
		productImage.product = product;
		productImage.url = env.S3_HOST + imageName;

		await productImageRepository.createAndSave(productImage);
	}

	static async updateProductImages(product: Product, images: FileUpload[]) {
		// Remove old images
		const productImages = product.images;
		await productImageRepository.remove(productImages);

		// Add new images
		for await (const image of images) {
			await this.createProductImage(product, image);
		}
	}
}

export class ProductLabService {
	static async createProductLab(
		product: Product,
		lab: FileUpload,
		price: number
	) {
		const labName =
			'stemy-product-' +
			product.id +
			'-T-' +
			String(Date.now()) +
			'-' +
			NumberUtil.getRandomNumberByLength(3) +
			'.pdf';

		const buffer = Buffer.concat(lab.blobParts);
		await UploadService.uploadFile(labName, buffer);

		const productLab = new ProductLab();
		productLab.product = product;
		productLab.url = env.S3_HOST + labName;
		productLab.price = price;

		await productLabRepository.createAndSave(productLab);
	}

	static async updateProductLab(
		product: Product,
		lab: FileUpload,
		price: number
	) {
		// Remove old lab if exists
		const productLab = await productLabRepository.findOne({
			product: product.id
		});
		if (productLab) {
			// soft delete
			productLab.isDelete = true;
			productLab.deletedAt = new Date();
			await productLabRepository.save(productLab);
		}

		// Create new lab
		await this.createProductLab(product, lab, price);
	}
}
