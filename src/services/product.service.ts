import { GraphQLError } from 'graphql';
import { env } from '~configs/env.config';
import { Product, ProductImage, ProductLab } from '~entities/product.entity';
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
		return productRepository.findOne({ id }, { fields });
	}

	static async updateProducts(products: Product[]) {
		return await productRepository.save(products);
	}

	static async deleteProduct(id: number) {
		const product = await productRepository.findOne({ id });

		if (!product) {
			throw new GraphQLError('Product not found');
		}

		await productRepository.remove(product);
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
}
