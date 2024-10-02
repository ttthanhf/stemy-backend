import { ArgsType, Field, Int } from 'type-graphql';
import { SortOrder } from '~constants/sort-order.constant';

@ArgsType()
export class PageInfoArgs {
	@Field(() => Int, { defaultValue: 9 })
	currentItem: number = 9;

	@Field(() => Int, { defaultValue: 1 })
	currentPage: number = 1;
}

@ArgsType()
export class SortOrderArgs {
	@Field({ defaultValue: 'id' })
	sort: string = 'id';

	@Field(() => SortOrder, { defaultValue: SortOrder.ASC })
	order: SortOrder = SortOrder.ASC;
}
