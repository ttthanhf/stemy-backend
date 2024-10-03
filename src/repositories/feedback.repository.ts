import { Feedback, FeedbackImage } from '~entities/feedback.entity';
import { BaseRepository } from './base.repository';

class FeedbackRepository extends BaseRepository<Feedback> {
	constructor() {
		super(Feedback);
	}
}
export const feedbackRepository = new FeedbackRepository();

class FeedbackImageRepository extends BaseRepository<FeedbackImage> {
	constructor() {
		super(FeedbackImage);
	}
}
export const feedbackImageRepository = new FeedbackImageRepository();
