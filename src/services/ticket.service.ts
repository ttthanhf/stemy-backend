import { ReplyTicketImage, Ticket, TicketImage } from '~entities/ticket.entity';
import {
	replyTicketImageRepository,
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
		return ticketRepository.findOne(
			{
				id: ticketId
			},
			{
				populate: [
					'sender',
					'replier',
					'orderItem',
					'orderItem.product',
					'category',
					'images',
					'replyImages'
				]
			}
		);
	}

	static async getTicketsByUserId(userId: number, status?: TicketStatus) {
		const statusQuery = status
			? {
					status
				}
			: {};
		return ticketRepository.find(
			{
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
				],
				...statusQuery
			},
			{
				populate: [
					'category',
					'orderItem',
					'orderItem.product',
					'orderItem.product.images',
					'images',
					'replyImages'
				]
			}
		);
	}

	static async getTicketByIdAndUserId(ticketId: number, userId: number) {
		return ticketRepository.findOne(
			{
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
			},
			{
				populate: [
					'sender',
					'replier',
					'orderItem',
					'orderItem.product',
					'orderItem.product.images',
					'category',
					'images',
					'replyImages'
				]
			}
		);
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
	static async getTicketCategories() {
		return ticketCategoryRepository.find({});
	}

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

		await UploadService.uploadFile(imageName, Buffer.concat(image.blobParts));

		const ticketImage = new TicketImage();
		ticketImage.ticket = ticket;
		ticketImage.url = env.S3_HOST + imageName;
		ticketImage.owner = owner;

		await ticketImageRepository.createAndSave(ticketImage);
	}

	static async createReplyTicketImage(
		ticket: Ticket,
		image: FileUpload,
		owner: Role
	) {
		const imageName =
			'stemy-reply-ticket-' +
			ticket.id +
			'-T-' +
			String(Date.now()) +
			'-' +
			NumberUtil.getRandomNumberByLength(3) +
			'.png';

		await UploadService.uploadFile(imageName, image.blobParts[0]);

		const replyTicketImage = new ReplyTicketImage();
		replyTicketImage.ticket = ticket;
		replyTicketImage.url = env.S3_HOST + imageName;
		replyTicketImage.owner = owner;

		await replyTicketImageRepository.createAndSave(replyTicketImage);
	}
}
