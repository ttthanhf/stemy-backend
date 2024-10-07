import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class CountOrderResponse {
	@Field()
	delivering!: number;

	@Field()
	delivered!: number;

	@Field()
	received!: number;

	@Field()
	unpaid!: number;

	@Field()
	paid!: number;

	@Field()
	rated!: number;
}
