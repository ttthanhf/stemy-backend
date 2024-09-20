import { Cart } from '~entities/cart.entity';
import { BaseRepository } from './base.repository';

class CartRepository extends BaseRepository<Cart> {
	constructor() {
		super(Cart);
	}
}
export default new CartRepository();
