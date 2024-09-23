import { registerEnumType } from 'type-graphql';

export enum OrderStatus {
	CREATED = 'created',
	DELIVERING = 'delivering',
	DELIVERED = 'delivered',
	FAIL = 'fail',
	PAID = 'paid'
}

registerEnumType(OrderStatus, {
	name: 'OrderStatus'
});
