import { Ticket, TicketImage } from '~entities/ticket.entity';
import {
	ticketCategoryRepository,
	ticketImageRepository,
	ticketRepository
} from '~repositories/ticket.repository';
import { FileUpload } from '~types/scalars/file.scalar';
import { NumberUtil } from '~utils/number.util';
import { UploadService } from './upload.service';
import { env } from '~configs/env.config';
import { Role } from '~constants/role.constant';

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

export class TicketImageService {
	static async createTicketImage(
		ticket: Ticket,
		image: FileUpload,
		owner: Role
	) {
		const imageName =
			'stemy-ticket-' +
			ticket.id +
			'-T-' +
			String(Date.now()) +
			'-' +
			NumberUtil.getRandomNumberByLength(3) +
			'.png';

		await UploadService.uploadFile(imageName, image.blobParts[0]);

		const ticketImage = new TicketImage();
		ticketImage.ticket = ticket;
		ticketImage.url = env.S3_HOST + imageName;
		ticketImage.owner = owner;

		await ticketImageRepository.createAndSave(ticketImage);
	}
}
