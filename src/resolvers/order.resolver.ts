import { RoleRequire } from 'decorators/auth.decorator';
import { GraphQLError, GraphQLResolveInfo } from 'graphql';
import { CountOrderResponse } from 'models/responses/order.model';
import { PageInfo } from 'models/responses/pagination/base.response';
import { OrdersWithPaginationResponse } from 'models/responses/pagination/order.response';
import {
	Arg,
	Args,
	Ctx,
	Info,
	Int,
	Mutation,
	Query,
	UseMiddleware
} from 'type-graphql';
import { OrderStatus } from '~constants/order.constant';
import { PaymentProvider } from '~constants/payment.constant';
import { Role } from '~constants/role.constant';
import { Cart } from '~entities/cart.entity';
import { Order, OrderItem } from '~entities/order.entity';
import { Product } from '~entities/product.entity';
import { UserLab } from '~entities/user.entity';
import { AuthMiddleware } from '~middlewares/auth.middleware';
import { CartService } from '~services/cart.service';
import { OrderItemService, OrderService } from '~services/order.service';
import { ProductService } from '~services/product.service';
import { UserLabService, UserService } from '~services/user.service';
import { PageInfoArgs, SortOrderArgs } from '~types/args/pagination.arg';
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
		const user = await UserService.getUserById(userId);
		if (!user) {
			throw new GraphQLError('Something error with this user');
		}

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

		//create user lab
		for await (const orderItem of order.orderItems) {
			if (orderItem.hasLab) {
				if (!orderItem.product.lab) {
					throw new Error(`ProductId: ${orderItem.product.id} don't have lab`);
				}

				const userLab = new UserLab();
				userLab.user = user;
				userLab.productLab = orderItem.product.lab;
				userLab.orderItem = orderItem;

				await UserLabService.createUserLab(userLab);
			}
		}

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
		@Ctx() ctx: Context,
		@Arg('search') search: string,
		@Arg('status', { nullable: true }) status?: OrderStatus
	) {
		const userId = ctx.res.model.data.user.id;
		const user = await UserService.getUserById(userId);
		if (!user) {
			throw new GraphQLError('User not found ???');
		}

		const orders = await OrderService.getOrdersBySearch(search, userId, status);
		await OrderService.handleOrderStatusBySystem(orders);

		return orders;
	}

	@RoleRequire([Role.MANAGER])
	@Query(() => OrdersWithPaginationResponse)
	async orders(
		@Info() info: GraphQLResolveInfo,
		@Args() pageInfoArgs: PageInfoArgs,
		@Args() sortOrderArgs: SortOrderArgs
	) {
		const fields = ResolverUtil.getFields(
			info.fieldNodes[0].selectionSet?.selections
		);

		const [orders, totalItem] = await OrderService.getOrdersPagination(
			fields,
			pageInfoArgs,
			sortOrderArgs
		);

		const pageInfo = new PageInfo(totalItem, pageInfoArgs);

		return {
			items: orders,
			pageInfo: pageInfo
		};
	}

	@UseMiddleware(AuthMiddleware.LoginRequire)
	@Query(() => Order)
	async order(@Ctx() ctx: Context, @Arg('id') id: number) {
		const userId = ctx.res.model.data.user.id;
		const user = await UserService.getUserById(userId);
		if (!user) {
			throw new GraphQLError('User not found ???');
		}

		if (user.role == Role.MANAGER) {
			const order = await OrderService.getOrderById(id);
			return order;
		}

		const order = await OrderService.getOrderByIdAndUserId(id, user.id);
		return order;
	}

	@UseMiddleware(AuthMiddleware.LoginRequire)
	@Mutation(() => [Cart])
	async reOrder(@Ctx() ctx: Context, @Arg('orderId') orderId: number) {
		const userId = ctx.res.model.data.user.id;
		const user = await UserService.getUserById(userId);
		if (!user) {
			throw new GraphQLError('Something error with this user');
		}

		const order = await OrderService.getOrderByIdAndUserId(orderId, userId);
		if (!order) {
			throw new GraphQLError('Order not found');
		}

		const carts: Cart[] = [];
		for await (const orderItem of order.orderItems) {
			const cart = await CartService.addProductToCart(
				user,
				orderItem.product,
				orderItem.quantity,
				orderItem.hasLab
			);
			carts.push(cart);
		}

		return carts;
	}

	@UseMiddleware(AuthMiddleware.LoginRequire)
	@Mutation(() => Order)
	async receiveOrder(@Ctx() ctx: Context, @Arg('orderId') orderId: number) {
		const userId = ctx.res.model.data.user.id;
		const user = await UserService.getUserById(userId);
		if (!user) {
			throw new GraphQLError('Something error with this user');
		}

		const order = await OrderService.getOrderByIdAndUserId(orderId, userId);
		if (!order) {
			throw new GraphQLError('Order not found');
		}
		if (order.status != OrderStatus.DELIVERED) {
			throw new GraphQLError('Order status must be delivered');
		}

		order.status = OrderStatus.RECEIVED;
		order.receiveTime = new Date();

		await OrderService.updateOrder(order);

		//active user lab
		for await (const orderItem of order.orderItems) {
			if (orderItem.userLab) {
				const userLab = orderItem.userLab;
				if (!userLab.isActive) {
					userLab.isActive = true;
					await UserLabService.updateUserLab(userLab);
				}
			}
		}

		return order;
	}

	@UseMiddleware(AuthMiddleware.LoginRequire)
	@Query(() => CountOrderResponse)
	async countOrder(@Ctx() ctx: Context) {
		const userId = ctx.res.model.data.user.id;
		const user = await UserService.getUserById(userId);
		if (!user) {
			throw new GraphQLError('Something error with this user');
		}

		const orders = await OrderService.getOrdersByUserId(userId);
		const countOrder = (
			[
				'delivering',
				'delivered',
				'received',
				'unpaid',
				'paid',
				'rated'
			] as OrderStatus[]
		).reduce(
			(acc, status) => {
				acc[status] = 0; // Gán mặc định 0 cho mỗi trạng thái
				return acc;
			},
			{} as Record<OrderStatus, number>
		);

		for (const order of orders) {
			countOrder[order.status]++;
		}

		return countOrder;
	}
}

export class OrderItemResolver {
	@UseMiddleware(AuthMiddleware.LoginRequire)
	@Query(() => OrderItem)
	async orderItem(@Ctx() ctx: Context, @Arg('id') id: number) {
		const userId = ctx.res.model.data.user.id;

		const orderItem = await OrderItemService.getOrderItemByIdAndUserId(
			id,
			userId
		);
		if (!orderItem) {
			throw new GraphQLError('Item not found');
		}

		return orderItem;
	}
}
