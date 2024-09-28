import { RoleRequire } from 'decorators/auth.decorator';
import { GraphQLError } from 'graphql';
import { Arg, Ctx, Mutation } from 'type-graphql';
import { Role } from '~constants/role.constant';
import { Ticket } from '~entities/ticket.entity';
import { OrderItemService } from '~services/order.service';
import { TicketCategoryService, TicketService } from '~services/ticket.service';
import { UserService } from '~services/user.service';
import { Context } from '~types/context.type';

export class TicketResolver {
	@RoleRequire([Role.CUSTOMER])
	@Mutation(() => Ticket)
	async createTicket(
		@Ctx() ctx: Context,
		@Arg('comment') comment: string,
		@Arg('title') title: string,
		@Arg('categoryId') categoryId: number,
		@Arg('orderItemId') orderItemId: number
	) {
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

		return await TicketService.createTicket(newTicket);
	}
}
