import { registerEnumType } from 'type-graphql';

export enum OrderStatus {
	DELIVERING = 'delivering',
	DELIVERED = 'delivered',
	RECEIVED = 'received',
	UNPAID = 'unpaid',
	PAID = 'paid',
	RATED = 'rated'
}

registerEnumType(OrderStatus, {
	name: 'OrderStatus'
});
