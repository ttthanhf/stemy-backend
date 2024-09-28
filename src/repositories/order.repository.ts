import { Order, OrderItem } from '~entities/order.entity';
import { BaseRepository } from './base.repository';

class OrderRepository extends BaseRepository<Order> {
	constructor() {
		super(Order);
	}
}

export const orderRepository = new OrderRepository();

class OrderItemRepository extends BaseRepository<OrderItem> {
	constructor() {
		super(OrderItem);
	}
}
export const orderItemRepository = new OrderItemRepository();
