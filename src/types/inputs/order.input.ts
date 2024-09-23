import { Field, InputType } from 'type-graphql';

@InputType()
export class CheckoutOrderInput {
	@Field()
	vnp_Amount!: string;

	@Field()
	vnp_BankCode!: string;

	@Field()
	vnp_BankTranNo!: string;

	@Field()
	vnp_CardType!: string;

	@Field()
	vnp_OrderInfo!: string;

	@Field()
	vnp_PayDate!: string;

	@Field()
	vnp_ResponseCode!: string;

	@Field()
	vnp_TmnCode!: string;

	@Field()
	vnp_TransactionNo!: string;

	@Field()
	vnp_TransactionStatus!: string;

	@Field()
	vnp_TxnRef!: string;

	@Field()
	vnp_SecureHash!: string;
}
