import { ObjectType } from 'type-graphql';
import { BasePaginationResponse } from './base.response';
import { Order } from '~entities/order.entity';

@ObjectType()
export class OrdersWithPaginationResponse extends BasePaginationResponse(
	Order
) {}
