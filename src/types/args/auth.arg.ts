import { ArgsType, Field } from 'type-graphql';

@ArgsType()
export class EmailAndPasswordArg {
	@Field(() => String)
	email!: string;

	@Field(() => String)
	password!: string;
}
