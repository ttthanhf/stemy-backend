import { registerEnumType } from 'type-graphql';

export enum OrderStatus {
	DELIVERING = 'delivering',
	DELIVERED = 'delivered',
	RECEIVED = 'received',
	UNPAID = 'unpaid',
	PAID = 'paid',
	RATED = 'rated',
	UNRATED = 'unrated'
}

registerEnumType(OrderStatus, {
	name: 'OrderStatus'
});
