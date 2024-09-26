import { registerEnumType } from 'type-graphql';

export enum OrderStatus {
	DELIVERING = 'delivering',
	DELIVERED = 'delivered',
	UNPAID = 'unpaid',
	PAID = 'paid'
}

registerEnumType(OrderStatus, {
	name: 'OrderStatus'
});
