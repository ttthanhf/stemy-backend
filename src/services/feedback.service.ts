import { env } from '~configs/env.config';
import { Feedback, FeedbackImage } from '~entities/feedback.entity';
import {
	feedbackImageRepository,
	feedbackRepository
} from '~repositories/feedback.repository';
import { FileUpload } from '~types/scalars/file.scalar';
import { NumberUtil } from '~utils/number.util';
import { UploadService } from './upload.service';

export class FeedbackService {
	static async createFeedback(feedback: Feedback) {
		return feedbackRepository.createAndSave(feedback);
	}
}

export class FeedbackImageService {
	static async createFeedbackImage(feedback: Feedback, image: FileUpload) {
		const imageName =
			'stemy-feedback-' +
			feedback.id +
			'-T-' +
			String(Date.now()) +
			'-' +
			NumberUtil.getRandomNumberByLength(3) +
			'.png';

		await UploadService.uploadFile(imageName, image.blobParts[0]);

		const feedbackImage = new FeedbackImage();
		feedbackImage.feedback = feedback;
		feedbackImage.url = env.S3_HOST + imageName;

		await feedbackImageRepository.createAndSave(feedbackImage);
	}
}
