import { ClassType, Field, Int, ObjectType } from 'type-graphql';
import { Product } from '~entities/product.entity';
import { PageInfoArgs } from '~types/args/pagination.arg';
import { MapperUtil } from '~utils/mapper.util';

@ObjectType()
export class PageInfo {
	@Field(() => Int)
	currentItem!: number;

	@Field(() => Int)
	totalItem!: number;

	@Field(() => Int)
	currentPage!: number;

	@Field(() => Int)
	totalPage!: number;

	constructor(totalItem?: number, pageInfoArgs?: PageInfoArgs) {
		if (totalItem && pageInfoArgs) {
			Object.assign(this, MapperUtil.mapObjectToClass(pageInfoArgs, PageInfo));
			this.totalItem = totalItem;
			this.totalPage = Math.ceil(totalItem / this.currentItem);
		}
	}
}

function BasePaginationResponse<TItem extends object>(
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

@ObjectType()
export class ProductsPaginatedResponse extends BasePaginationResponse(
	Product
) {}
