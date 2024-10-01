import { ArgsType, Field, Int } from 'type-graphql';

@ArgsType()
export class FilterSearchProduct {
	@Field({ defaultValue: '' })
	search!: string;

	@Field(() => [Int], {
		defaultValue: []
	})
	categoryIds!: number[];

	@Field(() => Int, {
		defaultValue: 0
	})
	minRating!: number;

	@Field(() => Int, {
		defaultValue: 5
	})
	maxRating!: number;

	@Field(() => Int, {
		defaultValue: 0
	})
	minPrice!: number;

	@Field(() => Int, {
		defaultValue: 10000000
	})
	maxPrice!: number;
}
