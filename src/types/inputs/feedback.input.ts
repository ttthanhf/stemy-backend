import { Field, Float, InputType, Int } from 'type-graphql';
import { FileScalar, FileUpload } from '~types/scalars/file.scalar';

@InputType()
export class CreateFeedbackInput {
	@Field({ nullable: true })
	note?: string;

	@Field(() => Float)
	rating!: number;

	@Field(() => Int)
	orderItemId!: number;

	@Field(() => [FileScalar], { nullable: true })
	images?: FileUpload[];
}
