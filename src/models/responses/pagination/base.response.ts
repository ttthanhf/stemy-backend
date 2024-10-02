import { ClassType, Field, Int, ObjectType } from 'type-graphql';
import { PageInfoArgs } from '~types/args/pagination.arg';
import { MapperUtil } from '~utils/mapper.util';

@ObjectType()
export class PageInfo {
	@Field(() => Int)
	currentItem: number = 0;

	@Field(() => Int)
	totalItem: number = 0;

	@Field(() => Int)
	currentPage: number = 0;

	@Field(() => Int)
	totalPage: number = 0;

	constructor(totalItem?: number, pageInfoArgs?: PageInfoArgs) {
		if (totalItem && pageInfoArgs) {
			Object.assign(this, MapperUtil.mapObjectToClass(pageInfoArgs, PageInfo));
			this.totalItem = totalItem;
			this.totalPage = Math.ceil(totalItem / this.currentItem);
		}
	}
}

export function BasePaginationResponse<TItem extends object>(
	TItemClass: ClassType<TItem>
) {
	@ObjectType(`Paginated${TItemClass.name}Response`)
	abstract class BasePaginationResponseClass {
		@Field(() => [TItemClass])
		items!: TItem[];

		@Field(() => PageInfo)
		pageInfo!: PageInfo;
	}

	return BasePaginationResponseClass;
}
