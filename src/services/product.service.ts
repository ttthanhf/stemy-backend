import { Product, ProductImage, ProductLab } from '~entities/product.entity';
import {
	productCategoryRepository,
	productImageRepository,
	productLabRepository,
	productRepository
} from '~repositories/product.repository';
import { PageInfoArgs, SortOrderArgs } from '~types/args/pagination.arg';
import { PaginationUtil } from '~utils/pagination.util';
import { UploadService } from './upload.service';
import { NumberUtil } from '~utils/number.util';
import { FileUpload } from '~types/scalars/file.scalar';
import { env } from '~configs/env.config';

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
	static async createProductLab(product: Product, lab: FileUpload) {
		const labName =
			'stemy-product-' +
			product.id +
			'-T-' +
			String(Date.now()) +
			'-' +
			NumberUtil.getRandomNumberByLength(3) +
			'.pdf';

		await UploadService.uploadFile(labName, lab.blobParts[0]);

		const productLab = new ProductLab();
		productLab.product = product;
		productLab.url = env.S3_HOST + labName;

		await productLabRepository.createAndSave(productLab);
	}
}
