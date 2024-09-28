import { Ticket, TicketCategory } from '~entities/ticket.entity';
import { BaseRepository } from './base.repository';

class TicketRepository extends BaseRepository<Ticket> {
	constructor() {
		super(Ticket);
	}
}
export const ticketRepository = new TicketRepository();

class TicketCategoryRepository extends BaseRepository<TicketCategory> {
	constructor() {
		super(TicketCategory);
	}
}
export const ticketCategoryRepository = new TicketCategoryRepository();
