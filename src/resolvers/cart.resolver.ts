import { GraphQLError } from 'graphql';
import { Arg, Ctx, Int, Mutation, Query, UseMiddleware } from 'type-graphql';
import { Cart } from '~entities/cart.entity';
import { AuthMiddleware } from '~middlewares/auth.middleware';
import { CartService } from '~services/cart.service';
import { ProductService } from '~services/product.service';
import { UserService } from '~services/user.service';
import { Context } from '~types/context.type';

@UseMiddleware(AuthMiddleware.LoginRequire)
export class CartResolver {
	@Query(() => [Cart])
	async carts(@Ctx() ctx: Context) {
		const userId = ctx.res.model.data.user.id;

		const carts = await CartService.getCartsByUserId(userId);

		return carts;
	}

	@Query(() => Number)
	async countCart(@Ctx() ctx: Context) {
		const userId = ctx.res.model.data.user.id;

		return await CartService.countProductInCart(userId);
	}

	@Mutation(() => Cart)
	async addToCart(
		@Ctx() ctx: Context,
		@Arg('productId') productId: number,
		@Arg('quantity') quantity: number,
		@Arg('hasLab') hasLab: boolean
	) {
		if (quantity <= 0) {
			throw new GraphQLError(
				'The quantity of imported products cannot be less than or equal to 0'
			);
		}

		const userId = ctx.res.model.data.user.id;

		const user = await UserService.getUserById(userId);

		if (!user) {
			throw new GraphQLError('Something wrong with this user');
		}

		const product = await ProductService.getProductById(productId);

		if (!product) {
			throw new GraphQLError('Product not exist');
		}

		const cart = await CartService.addProductToCart(
			user,
			product,
			quantity,
			hasLab
		);

		return cart;
	}

	@Mutation(() => Cart)
	async updateCart(
		@Ctx() ctx: Context,
		@Arg('cartId') cartId: number,
		@Arg('quantity') quantity: number
	) {
		if (quantity <= 0) {
			throw new GraphQLError(
				'The quantity of imported products cannot be less than or equal to 0'
			);
		}

		const userId = ctx.res.model.data.user.id;

		const user = await UserService.getUserById(userId);

		if (!user) {
			throw new GraphQLError('Something wrong with this user');
		}

		const cart = await CartService.updateProductInCart(user, cartId, quantity);

		return cart;
	}

	@Mutation(() => String)
	async deleteCarts(
		@Ctx() ctx: Context,
		@Arg('cartId', () => [Int]) cartIds: [number]
	) {
		const userId = ctx.res.model.data.user.id;

		const user = await UserService.getUserById(userId);

		if (!user) {
			throw new GraphQLError('Something wrong with this user');
		}

		await CartService.deleteCarts(user, cartIds);

		return 'Success';
	}
}
