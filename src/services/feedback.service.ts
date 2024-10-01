import { Feedback } from '~entities/feedback.entity';
import { feedbackRepository } from '~repositories/feedback.repository';

export class FeedbackService {
	static async createFeedback(feedback: Feedback) {
		return feedbackRepository.createAndSave(feedback);
	}
}
