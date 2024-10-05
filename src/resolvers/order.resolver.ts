import { GraphQLError, GraphQLResolveInfo } from 'graphql';
import {
	Arg,
	Ctx,
	Info,
	Int,
	Mutation,
	Query,
	UseMiddleware
} from 'type-graphql';
import { OrderStatus } from '~constants/order.constant';
import { PaymentProvider } from '~constants/payment.constant';
import { Order } from '~entities/order.entity';
import { Product } from '~entities/product.entity';
import { AuthMiddleware } from '~middlewares/auth.middleware';
import { CartService } from '~services/cart.service';
import { OrderService } from '~services/order.service';
import { ProductService } from '~services/product.service';
import { UserService } from '~services/user.service';
import { Context } from '~types/context.type';
import { CheckoutOrderInput } from '~types/inputs/order.input';
import { ResolverUtil } from '~utils/resolver.util';

export class OrderResolver {
	@UseMiddleware(AuthMiddleware.LoginRequire)
	@Mutation(() => String)
	async createOrder(
		@Ctx() ctx: Context,
		@Arg('cartIds', () => [Int]) cartIds: number[],
		@Arg('phone') phone: string,
		@Arg('address') address: string,
		@Arg('paymentProvider') paymentProvider: PaymentProvider,
		@Arg('fullName') fullName: string
	) {
		const userId = ctx.res.model.data.user.id;

		const user = await UserService.getUserById(userId);

		if (!user) {
			throw new GraphQLError('Something error with this user');
		}

		const carts = await CartService.getCartsByIdsAndUserId(cartIds, userId);
		if (carts.length <= 0) {
			throw new GraphQLError('Cart not found');
		}

		const orderItems = await OrderService.prepareOrderItem(carts);

		const order = await OrderService.createOrder(
			user,
			orderItems,
			phone,
			address,
			paymentProvider,
			fullName
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

		return true;
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

	@UseMiddleware(AuthMiddleware.LoginRequire)
	@Query(() => [Order])
	async searchOrder(
		@Info() info: GraphQLResolveInfo,
		@Ctx() ctx: Context,
		@Arg('search') search: string,
		@Arg('status', { nullable: true }) status?: OrderStatus
	) {
		const userId = ctx.res.model.data.user.id;

		const fields = ResolverUtil.getNodes(
			info.fieldNodes[0].selectionSet?.selections
		);

		const orders = await OrderService.getOrdersBySearch(
			search,
			userId,
			fields,
			status
		);
		const updatedOrderList: Order[] = [];
		for await (const order of orders) {
			//checking for order is expire for rating: current setting 1 min
			if (order.isAllowRating) {
				if (new Date().getTime() - order.shipTime.getTime() > 1000 * 60) {
					order.isAllowRating = false;
					updatedOrderList.push(order);
				}
			}
		}
		if (updatedOrderList.length > 0) {
			await OrderService.updateOrders(updatedOrderList);
		}

		return orders;
	}
}
