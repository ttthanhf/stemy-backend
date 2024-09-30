import { Ticket, TicketCategory, TicketImage } from '~entities/ticket.entity';
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

class TicketImageRepository extends BaseRepository<TicketImage> {
	constructor() {
		super(TicketImage);
	}
}
export const ticketImageRepository = new TicketImageRepository();
