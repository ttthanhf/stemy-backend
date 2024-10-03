import { ArgsType, Field, Int } from 'type-graphql';

@ArgsType()
export class UserArg {
	@Field(() => Int)
	id!: number;
}

@ArgsType()
export class UpdateUserArg {
	@Field({ nullable: true })
	phone?: string;

	@Field({ nullable: true })
	email?: string;

	@Field({ nullable: true })
	fullName?: string;
}
