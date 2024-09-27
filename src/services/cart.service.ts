import { GraphQLError } from 'graphql';
import { Cart } from '~entities/cart.entity';
import { Product } from '~entities/product.entity';
import { User } from '~entities/user.entity';
import cartRepository from '~repositories/cart.repository';

export class CartService {
	static async getCartsByUserId(userId: number) {
		return cartRepository.find(
			{
				user: {
					id: userId
				}
			},
			{ populate: ['product', 'product.images'] }
		);
	}

	static async countProductInCart(userId: number) {
		return cartRepository.count({
			user: {
				id: userId
			}
		});
	}

	static async getCartByProductId(productId: number, userId: number) {
		return cartRepository.findOne({
			product: {
				id: productId
			},
			user: {
				id: userId
			}
		});
	}

	static async addProductToCart(
		user: User,
		product: Product,
		quantity: number
	) {
		let cart = await this.getCartByProductId(product.id, user.id);

		if (cart) {
			cart.quantity = cart.quantity + quantity;
		} else {
			cart = new Cart();
			cart.product = product;
			cart.user = user;
			cart.quantity = quantity;

			await cartRepository.create(cart);
		}

		if (cart.quantity > 99) {
			throw new GraphQLError(
				'The number of this product must not exceed 99 products'
			);
		}

		await cartRepository.save(cart);

		return cart;
	}

	static async updateProductInCart(
		user: User,
		product: Product,
		quantity: number
	) {
		const cart = await this.getCartByProductId(product.id, user.id);

		if (!cart) {
			throw new GraphQLError('Product not found in cart');
		}

		cart.quantity = quantity;

		await cartRepository.save(cart);

		return cart;
	}

	static async deleteProductInCart(user: User, product: Product) {
		const cart = await this.getCartByProductId(product.id, user.id);

		if (!cart) {
			throw new GraphQLError('Product not found in cart');
		}

		return cartRepository.remove(cart);
	}

	static async getCartsByCartIdsAndUserId(cartIds: number[], userId: number) {
		return cartRepository.find({
			id: {
				$in: cartIds
			},
			user: {
				id: userId
			}
		});
	}

	static async removeCarts(carts: Cart[]) {
		return cartRepository.remove(carts);
	}
}
