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
			{ populate: ['product', 'product.images', 'product.lab'] }
		);
	}

	static async countProductInCart(userId: number) {
		return cartRepository.count({
			user: {
				id: userId
			}
		});
	}

	static async getCartByProductIdAndUserId(
		productId: number,
		userId: number,
		hasLab: boolean
	) {
		return cartRepository.findOne(
			{
				product: {
					id: productId
				},
				user: {
					id: userId
				},
				hasLab: hasLab
			},
			{ populate: ['product', 'product.images', 'product.lab'] }
		);
	}

	static async addProductToCart(
		user: User,
		product: Product,
		quantity: number,
		hasLab: boolean
	) {
		const cart = await this.getCartByProductIdAndUserId(
			product.id,
			user.id,
			hasLab
		);

		if (cart) {
			cart.quantity = cart.quantity + quantity;
			if (cart.quantity > 99) {
				throw new GraphQLError(
					'The number of this product must not exceed 99 products'
				);
			}

			await cartRepository.save(cart);

			return cart;
		}

		if (quantity > 99) {
			throw new GraphQLError(
				'The number of this product must not exceed 99 products'
			);
		}

		const newCart = new Cart();
		newCart.product = product;
		newCart.user = user;
		newCart.quantity = quantity;
		newCart.hasLab = hasLab;

		return await cartRepository.createAndSave(newCart);
	}

	static async updateProductInCart(
		user: User,
		cartId: number,
		quantity: number
	) {
		const cart = await this.getCartByIdAndUserId(cartId, user.id);

		if (!cart) {
			throw new GraphQLError('Product not found in cart');
		}

		cart.quantity = quantity;

		await cartRepository.save(cart);

		return cart;
	}

	static async deleteCarts(user: User, cartIds: [number]) {
		const carts = await this.getCartsByIdsAndUserId(cartIds, user.id);

		return cartRepository.remove(carts);
	}

	static async getCartsByIdsAndUserId(cartIds: number[], userId: number) {
		return cartRepository.find(
			{
				id: {
					$in: cartIds
				},
				user: {
					id: userId
				}
			},
			{ populate: ['product', 'product.lab'] }
		);
	}

	static async getCartByIdAndUserId(cartId: number, userId: number) {
		return cartRepository.findOne({
			user: {
				id: userId
			},
			id: cartId
		});
	}

	static async removeCarts(carts: Cart[]) {
		return cartRepository.remove(carts);
	}
}
