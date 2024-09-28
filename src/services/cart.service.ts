import { GraphQLError } from 'graphql';
import { Cart } from '~entities/cart.entity';
import { Product } from '~entities/product.entity';
import { User } from '~entities/user.entity';
import cartRepository from '~repositories/cart.repository';
import { UserLabService } from './user.service';

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

	static async getCartByProductIdAndHasLab(
		productId: number,
		userId: number,
		hasLab: boolean
	) {
		return cartRepository.findOne({
			hasLab: hasLab,
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
		quantity: number,
		hasLab: boolean
	) {
		if (hasLab) {
			if (quantity > 1) {
				throw new GraphQLError(
					'Only add 1 quantity for product included lab selected'
				);
			}

			const isUserHasThisLab = await UserLabService.isUserHasThisLabByProductId(
				user.id,
				product.id
			);
			if (isUserHasThisLab) {
				throw new GraphQLError('You already have this lab for this product');
			}

			const isProductHasLabInCart = await cartRepository.count({
				hasLab: true,
				user: {
					id: user.id
				},
				product: {
					id: product.id
				}
			});
			if (isProductHasLabInCart > 0) {
				throw new GraphQLError('This product has lab selected already in cart');
			}

			const cart = new Cart();
			cart.product = product;
			cart.user = user;
			cart.quantity = quantity;
			cart.hasLab = hasLab;

			await cartRepository.createAndSave(cart);

			return cart;
		}

		let cart = await this.getCartByProductIdAndHasLab(
			product.id,
			user.id,
			false
		);

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

		cart.hasLab = hasLab;

		await cartRepository.save(cart);

		return cart;
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

		if (cart.hasLab) {
			throw new GraphQLError('This cart cant update because it has lab');
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
		return cartRepository.find({
			id: {
				$in: cartIds
			},
			user: {
				id: userId
			}
		});
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
