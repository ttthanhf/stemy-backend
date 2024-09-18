import { Product } from '~entities/product.entity';
import { BaseRepository } from './base.repository';

class ProductRepository extends BaseRepository<Product> {
	constructor() {
		super(Product);
	}
}

export default new ProductRepository();
