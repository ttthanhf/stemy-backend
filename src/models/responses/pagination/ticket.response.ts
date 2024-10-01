import { ObjectType } from 'type-graphql';
import { BasePaginationResponse } from './base.response';
import { Ticket } from '~entities/ticket.entity';

@ObjectType()
export class TicketsWithPaginationResponse extends BasePaginationResponse(
	Ticket
) {}
