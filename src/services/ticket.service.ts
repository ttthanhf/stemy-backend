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
import { PageInfoArgs, SortOrderArgs } from '~types/args/pagination.arg';
import { PaginationUtil } from '~utils/pagination.util';
import { TicketStatus } from '~constants/ticket.constant';

export class TicketService {
	static async createTicket(ticket: Ticket) {
		return ticketRepository.createAndSave(ticket);
	}

	static async getTicketById(ticketId: number) {
		return ticketRepository.findOne({
			id: ticketId
		});
	}

	static async getTicketsByUserId(userId: number) {
		return ticketRepository.find({
			$or: [
				{
					sender: {
						id: userId
					}
				},
				{
					replier: {
						id: userId
					}
				}
			]
		});
	}

	static async getTicketByIdAndUserId(ticketId: number, userId: number) {
		return ticketRepository.findOne({
			id: ticketId,
			$or: [
				{
					sender: {
						id: userId
					}
				},
				{
					replier: {
						id: userId
					}
				}
			]
		});
	}

	static async getTicketByIdAndSenderId(ticketId: number, senderId: number) {
		return ticketRepository.findOne(
			{
				id: ticketId,
				sender: {
					id: senderId
				}
			},
			{ populate: ['replier'] }
		);
	}

	static async countClosedTicketByReplierId(replierId: number) {
		return ticketRepository.count({
			replier: {
				id: replierId
			},
			status: TicketStatus.CLOSE
		});
	}

	static async updateTicket(ticket: Ticket) {
		return ticketRepository.save(ticket);
	}

	static async getTicketsPagination(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		fields: any,
		pageInfoArgs: PageInfoArgs,
		sortOrderArgs: SortOrderArgs
	) {
		const pageResult = PaginationUtil.avoidTrashInput(pageInfoArgs);
		return ticketRepository.findAndCount(
			{},
			{
				fields: fields,
				...pageResult,
				orderBy: {
					[sortOrderArgs.sort]: sortOrderArgs.order
				}
			}
		);
	}

	static async getTicketsBySenderIdAndOrderItemId(
		senderId: number,
		orderItemId: number
	) {
		return ticketRepository.find(
			{
				sender: {
					id: senderId
				},
				orderItem: {
					id: orderItemId
				}
			},
			{ populate: ['replier'] }
		);
	}
}

export class TicketCategoryService {
	static async getTicketCategoryById(id: number) {
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
