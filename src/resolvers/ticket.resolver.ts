import { RoleRequire } from 'decorators/auth.decorator';
import { GraphQLError, GraphQLResolveInfo } from 'graphql';
import { PageInfo } from 'models/responses/pagination/base.response';
import { TicketsWithPaginationResponse } from 'models/responses/pagination/ticket.response';
import {
	Arg,
	Args,
	Ctx,
	Info,
	Mutation,
	Query,
	UseMiddleware
} from 'type-graphql';
import { Role } from '~constants/role.constant';
import { TicketStatus } from '~constants/ticket.constant';
import { Ticket } from '~entities/ticket.entity';
import { User } from '~entities/user.entity';
import { AuthMiddleware } from '~middlewares/auth.middleware';
import { OrderItemService } from '~services/order.service';
import {
	TicketCategoryService,
	TicketImageService,
	TicketService
} from '~services/ticket.service';
import { UserService } from '~services/user.service';
import { PageInfoArgs, SortOrderArgs } from '~types/args/pagination.arg';
import { Context } from '~types/context.type';
import { FileScalar, FileUpload } from '~types/scalars/file.scalar';
import { ResolverUtil } from '~utils/resolver.util';

export class TicketResolver {
	@RoleRequire([Role.CUSTOMER])
	@Mutation(() => Boolean)
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
			await TicketCategoryService.getTicketCategoryById(categoryId);
		if (!category) {
			throw new GraphQLError('Category not found');
		}

		const orderItem = await OrderItemService.getOrderItemByIdAndUserId(
			orderItemId,
			userId
		);
		if (!orderItem) {
			throw new GraphQLError('Order item not found');
		}

		const oldTickets = await TicketService.getTicketsBySenderIdAndOrderItemId(
			userId,
			orderItemId
		);
		if (oldTickets.length > 3) {
			throw new GraphQLError('Maximum of this ticket for order item is 3');
		}

		const newTicket = new Ticket();
		newTicket.sender = user;
		newTicket.category = category;
		newTicket.orderItem = orderItem;
		newTicket.senderComment = comment;
		newTicket.title = title;

		//=============Assign Ticket For Staff Start=============\\
		async function getNewStaff(excludeStaffId: number = 0) {
			const staffs = await UserService.getNewStaffs(excludeStaffId);
			const worklessStaff = staffs.reduce((min, item) =>
				item.numberOfOpenTicket < min.numberOfOpenTicket ? item : min
			);
			return worklessStaff;
		}

		let replier: User;

		if (oldTickets.length == 0) {
			replier = await getNewStaff();
		} else {
			const previousTicket = oldTickets[oldTickets.length - 1];
			if (previousTicket.rating < 3) {
				replier = await getNewStaff(previousTicket.replier.id);
			} else {
				replier = previousTicket.replier;
			}
		}

		newTicket.replier = replier;

		replier.numberOfOpenTicket = replier.numberOfOpenTicket + 1;
		await UserService.updateUser(replier);
		//=============Assign Ticket For Staff End=========\\

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

		user.numberOfOpenTicket = user.numberOfOpenTicket - 1;
		await UserService.updateUser(user);

		//create image
		for await (const image of images) {
			await TicketImageService.createTicketImage(ticket, image, user.role);
		}

		return ticket;
	}

	@RoleRequire([Role.MANAGER])
	@Query(() => TicketsWithPaginationResponse)
	async tickets(
		@Info() info: GraphQLResolveInfo,
		@Args() pageInfoArgs: PageInfoArgs,
		@Args() sortOrderArgs: SortOrderArgs
	) {
		const fields = ResolverUtil.getFields(
			info.fieldNodes[0].selectionSet?.selections
		);

		const [tickets, totalItem] = await TicketService.getTicketsPagination(
			fields,
			pageInfoArgs,
			sortOrderArgs
		);

		const pageInfo = new PageInfo(totalItem, pageInfoArgs);

		return {
			items: tickets,
			pageInfo: pageInfo
		};
	}

	@UseMiddleware([AuthMiddleware.LoginRequire])
	@Mutation(() => Ticket)
	async ratingTicket(
		@Ctx() ctx: Context,
		@Arg('ticketId') ticketId: number,
		@Arg('rating') rating: number
	) {
		const userId = ctx.res.model.data.user.id;

		const ticket = await TicketService.getTicketByIdAndSenderId(
			ticketId,
			userId
		);
		if (!ticket) {
			throw new GraphQLError('Ticket not found');
		}
		if (ticket.status != TicketStatus.CLOSE) {
			throw new GraphQLError('Tickets have not yet been resolved for rating');
		}

		ticket.rating = rating;
		await TicketService.updateTicket(ticket);

		const replier = ticket.replier;
		const numberOfClosedTicket =
			await TicketService.countClosedTicketByReplierId(replier.id);

		replier.rating =
			(replier.rating * (numberOfClosedTicket - 1) + rating) /
			numberOfClosedTicket;
		await UserService.updateUser(replier);

		return Ticket;
	}

	@UseMiddleware([AuthMiddleware.LoginRequire])
	@Query(() => Ticket)
	async ticket(@Ctx() ctx: Context, @Arg('ticketId') ticketId: number) {
		const userId = ctx.res.model.data.user.id;
		const ticket = await TicketService.getTicketByIdAndUserId(ticketId, userId);
		if (!ticket) {
			throw new GraphQLError('Ticket not found');
		}

		return ticket;
	}

	@UseMiddleware([AuthMiddleware.LoginRequire])
	@Query(() => [Ticket])
	async myTickets(@Ctx() ctx: Context) {
		const userId = ctx.res.model.data.user.id;
		const tickets = await TicketService.getTicketsByUserId(userId);
		return tickets;
	}
}
