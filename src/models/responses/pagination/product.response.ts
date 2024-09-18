import { ObjectType } from 'type-graphql';
import { BasePaginationResponse } from './base.response';
import { Product } from '~entities/product.entity';

@ObjectType()
export class ProductsWithPaginationResponse extends BasePaginationResponse(
	Product
) {}
