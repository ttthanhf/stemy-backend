import { registerEnumType } from 'type-graphql';

export enum PaymentProvider {
	VNPAY = 'vnpay'
}

registerEnumType(PaymentProvider, {
	name: 'PaymentProvider'
});
