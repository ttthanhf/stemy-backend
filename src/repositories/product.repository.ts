import {
	Product,
	ProductCategory,
	ProductImage,
	ProductLab
} from '~entities/product.entity';
import { BaseRepository } from './base.repository';

class ProductRepository extends BaseRepository<Product> {
	constructor() {
		super(Product);
	}
}
export const productRepository = new ProductRepository();

class ProductCategoryRepository extends BaseRepository<ProductCategory> {
	constructor() {
		super(ProductCategory);
	}
}
export const productCategoryRepository = new ProductCategoryRepository();

class ProductLabRepository extends BaseRepository<ProductLab> {
	constructor() {
		super(ProductLab);
	}
}
export const productLabRepository = new ProductLabRepository();

class ProductImageRepository extends BaseRepository<ProductImage> {
	constructor() {
		super(ProductImage);
	}
}
export const productImageRepository = new ProductImageRepository();
