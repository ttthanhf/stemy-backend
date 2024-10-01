import { GraphQLError } from 'graphql';
import { Arg, Ctx, Int, Mutation, UseMiddleware } from 'type-graphql';
import { Feedback } from '~entities/feedback.entity';
import { AuthMiddleware } from '~middlewares/auth.middleware';
import { FeedbackService } from '~services/feedback.service';
import { OrderItemService } from '~services/order.service';
import { ProductService } from '~services/product.service';
import { UserService } from '~services/user.service';
import { Context } from '~types/context.type';

export class FeedbackResolver {
	@UseMiddleware([AuthMiddleware.LoginRequire])
	@Mutation(() => Feedback)
	async createFeedback(
		@Ctx() ctx: Context,
		@Arg('note') note: string,
		@Arg('rating') rating: number,
		@Arg('orderItemId', () => Int) orderItemId: number
	) {
		const userId = ctx.res.model.data.user.id;
		const user = await UserService.getUserById(userId);
		if (!user) {
			throw new GraphQLError('Something error with this user');
		}

		const orderItem = await OrderItemService.getOrderItemByIdAndUserId(
			orderItemId,
			userId
		);
		if (!orderItem) {
			throw new GraphQLError('Order item not found');
		}

		const newFeedback = new Feedback();
		newFeedback.user = user;
		newFeedback.rating = rating;
		newFeedback.note = note;
		newFeedback.orderItem = orderItem;
		newFeedback.product = orderItem.product;

		const feedback = await FeedbackService.createFeedback(newFeedback);

		const product = orderItem.product;
		const feedbacksLength = product.feedbacks.length;
		const newRating =
			(product.rating * feedbacksLength + rating) / (feedbacksLength + 1);

		product.rating = parseFloat(newRating.toFixed(2));

		await ProductService.updateProducts([product]);

		return feedback;
	}
}
