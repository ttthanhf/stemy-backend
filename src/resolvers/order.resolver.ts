import { GraphQLError } from 'graphql';
import { Arg, Ctx, Int, Mutation, UseMiddleware } from 'type-graphql';
import { OrderStatus } from '~constants/order.constant';
import { PaymentProvider } from '~constants/payment.constant';
import { Product } from '~entities/product.entity';
import { AuthMiddleware } from '~middlewares/auth.middleware';
import { CartService } from '~services/cart.service';
import { OrderService } from '~services/order.service';
import { ProductService } from '~services/product.service';
import { UserService } from '~services/user.service';
import { Context } from '~types/context.type';
import { CheckoutOrderInput } from '~types/inputs/order.input';

export class OrderResolver {
	@UseMiddleware(AuthMiddleware.LoginRequire)
	@Mutation(() => String)
	async createOrder(
		@Ctx() ctx: Context,
		@Arg('cartIds', () => Int) cartIds: number[],
		@Arg('phone') phone: string,
		@Arg('address') address: string,
		@Arg('paymentProvider') paymentProvider: PaymentProvider
	) {
		const userId = ctx.res.model.data.user.id;

		const user = await UserService.getUserById(userId);

		if (!user) {
			throw new GraphQLError('Something error with this user');
		}

		const carts = await CartService.getCartsByIdsAndUserId(cartIds, userId);

		const orderItems = await OrderService.prepareOrderItem(carts);

		const order = await OrderService.createOrder(
			user,
			orderItems,
			phone,
			address,
			paymentProvider
		);

		const VNPayUrl = OrderService.getVNPayURL(order);

		await CartService.removeCarts(carts);

		return VNPayUrl;
	}

	@UseMiddleware(AuthMiddleware.LoginRequire)
	@Mutation(() => Boolean)
	async checkoutOrder(
		@Ctx() ctx: Context,
		@Arg('input') input: CheckoutOrderInput
	) {
		const userId = ctx.res.model.data.user.id;

		OrderService.checkOrderSecureHash(input);

		const orderId = Number(input.vnp_OrderInfo);
		const order = await OrderService.updateOrderStatusToPaid(orderId, userId);

		const products: Product[] = [];
		for (const orderItem of order.orderItems) {
			const product = orderItem.product;
			product.sold += 1;
			products.push(product);
		}
		await ProductService.updateProducts(products);

		return 'Success';
	}

	@UseMiddleware(AuthMiddleware.LoginRequire)
	@Mutation(() => String)
	async repayOrder(@Ctx() ctx: Context, @Arg('orderId') orderId: number) {
		const userId = ctx.res.model.data.user.id;
		const user = await UserService.getUserById(userId);
		if (!user) {
			throw new GraphQLError('Something error with this user');
		}

		const order = await OrderService.getOrderByIdAndUserId(orderId, userId);
		if (!order) {
			throw new GraphQLError('Order not found');
		}
		if (order.status != OrderStatus.UNPAID) {
			throw new GraphQLError('Order already paid');
		}

		const VNPayUrl = OrderService.getVNPayURL(order);
		return VNPayUrl;
	}
}
