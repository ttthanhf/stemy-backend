import { ArgsType, Field, Int } from 'type-graphql';

@ArgsType()
export class FilterSearchProduct {
	@Field({ defaultValue: '' })
	search: string = '';

	@Field(() => [Int], {
		defaultValue: [],
		nullable: true
	})
	categoryIds!: number[];

	@Field(() => Int, {
		defaultValue: 0,
		nullable: true
	})
	minRating: number = 0;

	@Field(() => Int, {
		defaultValue: 5,
		nullable: true
	})
	maxRating: number = 5;

	@Field(() => Int, {
		defaultValue: 0,
		nullable: true
	})
	minPrice: number = 0;

	@Field(() => Int, {
		defaultValue: 10000000,
		nullable: true
	})
	maxPrice: number = 10000000;
}
