import { RoleRequire } from 'decorators/auth.decorator';
import { GraphQLError } from 'graphql';
import { Arg, Ctx, Mutation } from 'type-graphql';
import { Role } from '~constants/role.constant';
import { TicketStatus } from '~constants/ticket.constant';
import { Ticket } from '~entities/ticket.entity';
import { OrderItemService } from '~services/order.service';
import {
	TicketCategoryService,
	TicketImageService,
	TicketService
} from '~services/ticket.service';
import { UserService } from '~services/user.service';
import { Context } from '~types/context.type';
import { FileScalar, FileUpload } from '~types/scalars/file.scalar';

export class TicketResolver {
	@RoleRequire([Role.CUSTOMER])
	@Mutation(() => Ticket)
	async createTicket(
		@Ctx() ctx: Context,
		@Arg('comment') comment: string,
		@Arg('title') title: string,
		@Arg('categoryId') categoryId: number,
		@Arg('orderItemId') orderItemId: number,
		@Arg('images', () => [FileScalar], { defaultValue: [] })
		images: FileUpload[]
	) {
		if (images.length > 5) {
			throw new GraphQLError('Only upload a maximum of 5 images');
		}

		images.forEach((image) => {
			if (!image.type.startsWith('image/')) {
				throw new GraphQLError(image.name + ' not a image');
			}
			if (image.blobParts[0].byteLength > 1000000) {
				throw new GraphQLError(image.name + ' must not exceed 1MB');
			}
		});

		const userId = ctx.res.model.data.user.id;
		const user = await UserService.getUserById(userId);
		if (!user) {
			throw new GraphQLError('User not found');
		}

		const category =
			await TicketCategoryService.getTickerCategoryById(categoryId);
		if (!category) {
			throw new GraphQLError('Category not found');
		}

		const orderItem = await OrderItemService.getOrderItemByIdAndUserId(
			orderItemId,
			userId
		);
		if (!orderItem) {
			throw new GraphQLError('Order not found');
		}

		const newTicket = new Ticket();
		newTicket.sender = user;
		newTicket.category = category;
		newTicket.orderItem = orderItem;
		newTicket.senderComment = comment;
		newTicket.title = title;

		const ticket = await TicketService.createTicket(newTicket);

		//create image
		for await (const image of images) {
			await TicketImageService.createTicketImage(ticket, image, user.role);
		}

		return ticket;
	}

	@RoleRequire([Role.CUSTOMER])
	@Mutation(() => Ticket)
	async replyTicket(
		@Ctx() ctx: Context,
		@Arg('comment') comment: string,
		@Arg('ticketId') ticketId: number,
		@Arg('images', () => [FileScalar], { defaultValue: [] })
		images: FileUpload[]
	) {
		if (images.length > 5) {
			throw new GraphQLError('Only upload a maximum of 5 images');
		}

		images.forEach((image) => {
			if (!image.type.startsWith('image/')) {
				throw new GraphQLError(image.name + ' not a image');
			}
			if (image.blobParts[0].byteLength > 1000000) {
				throw new GraphQLError(image.name + ' must not exceed 1MB');
			}
		});

		const userId = ctx.res.model.data.user.id;
		const user = await UserService.getUserById(userId);
		if (!user) {
			throw new GraphQLError('User error');
		}

		const ticket = await TicketService.getTicketById(ticketId);

		if (!ticket) {
			throw new GraphQLError('Ticket not found');
		}
		if (ticket.status == TicketStatus.CLOSE) {
			throw new GraphQLError('Ticket already answered');
		}

		ticket.replier = user;
		ticket.replierComment = comment;
		ticket.closedAt = new Date();
		ticket.status = TicketStatus.CLOSE;

		await TicketService.updateTicket(ticket);

		//create image
		for await (const image of images) {
			await TicketImageService.createTicketImage(ticket, image, user.role);
		}

		return ticket;
	}
}
