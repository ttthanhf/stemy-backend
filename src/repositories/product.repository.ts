import { Product, ProductCategory } from '~entities/product.entity';
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
