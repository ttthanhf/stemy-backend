import { Feedback } from '~entities/feedback.entity';
import { BaseRepository } from './base.repository';

class FeedbackRepository extends BaseRepository<Feedback> {
	constructor() {
		super(Feedback);
	}
}
export const feedbackRepository = new FeedbackRepository();
