import { GraphQLError } from 'graphql';
import { Arg, Ctx, Mutation, UseMiddleware } from 'type-graphql';
import { OrderStatus } from '~constants/order.constant';
import { Feedback } from '~entities/feedback.entity';
import { AuthMiddleware } from '~middlewares/auth.middleware';
import {
	FeedbackImageService,
	FeedbackService
} from '~services/feedback.service';
import { OrderService } from '~services/order.service';
import { ProductService } from '~services/product.service';
import { UserService } from '~services/user.service';
import { Context } from '~types/context.type';
import { CreateFeedbackInput } from '~types/inputs/feedback.input';
import { ArrayUtil } from '~utils/array.util';

export class FeedbackResolver {
	@UseMiddleware([AuthMiddleware.LoginRequire])
	@Mutation(() => Boolean)
	async createFeedback(
		@Ctx() ctx: Context,
		@Arg('input', () => [CreateFeedbackInput]) input: CreateFeedbackInput[],
		@Arg('orderId') orderId: number
	) {
		for (const item of input) {
			if (item.images) {
				if (item.images.length > 5) {
					throw new GraphQLError('Only upload a maximum of 5 images');
				}

				item.images.forEach((image) => {
					if (!image.type.startsWith('image/')) {
						throw new GraphQLError(image.name + ' not a image');
					}
					if (image.blobParts[0].byteLength > 1000000) {
						throw new GraphQLError(image.name + ' must not exceed 1MB');
					}
				});
			}
		}

		const userId = ctx.res.model.data.user.id;
		const user = await UserService.getUserById(userId);
		if (!user) {
			throw new GraphQLError('Something error with this user');
		}

		const order = await OrderService.getOrderByIdAndUserId(orderId, userId);
		if (!order) {
			throw new GraphQLError('Order not found');
		}
		if (order.status != OrderStatus.RECEIVED) {
			throw new GraphQLError('Only rating when order status is received');
		}

		const orderItemIdsInput = input.map((item) => item.orderItemId);
		const orderItemIds = order.orderItems.map((item) => item.id);
		if (!ArrayUtil.compareArraysUnordered(orderItemIdsInput, orderItemIds)) {
			throw new GraphQLError('Need the same and full ids order item in order');
		}

		for (const item of input) {
			const newFeedback = new Feedback();
			newFeedback.user = user;
			newFeedback.rating = item.rating;
			if (item.note) {
				newFeedback.note = item.note;
			}

			const orderItem = order.orderItems.find(
				(orderItem) => orderItem.id == item.orderItemId
			);
			if (!orderItem) {
				throw new GraphQLError('OrderItem not in this order');
			}

			newFeedback.orderItem = orderItem;
			newFeedback.product = orderItem.product;

			const feedback = await FeedbackService.createFeedback(newFeedback);

			const product = orderItem.product;
			const feedbacksLength = product.feedbacks.length;
			const newRating =
				(product.rating * feedbacksLength + item.rating) /
				(feedbacksLength + 1);

			product.rating = parseFloat(newRating.toFixed(1));

			// Create image
			if (item.images) {
				for await (const image of item.images) {
					await FeedbackImageService.createFeedbackImage(feedback, image);
				}
			}

			await ProductService.updateProducts([product]);
		}

		order.status = OrderStatus.RATED;
		await OrderService.updateOrder(order);

		return true;
	}
}
