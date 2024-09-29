import { Ticket } from '~entities/ticket.entity';
import {
	ticketCategoryRepository,
	ticketRepository
} from '~repositories/ticket.repository';

export class TicketService {
	static async createTicket(ticket: Ticket) {
		return ticketRepository.createAndSave(ticket);
	}

	static async getTicketById(ticketId: number) {
		return ticketRepository.findOne({
			id: ticketId
		});
	}

	static async updateTicket(ticket: Ticket) {
		return ticketRepository.save(ticket);
	}
}

export class TicketCategoryService {
	static async getTickerCategoryById(id: number) {
		return ticketCategoryRepository.findOne({
			id
		});
	}
}