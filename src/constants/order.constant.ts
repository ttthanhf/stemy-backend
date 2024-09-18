import { registerEnumType } from 'type-graphql';

export enum OrderStatus {
	CREATED = 'created',
	DELIVERING = 'delivering',
	DELIVERED = 'delivered',
	FAIL = 'fail'
}

registerEnumType(OrderStatus, {
	name: 'OrderStatus'
});
