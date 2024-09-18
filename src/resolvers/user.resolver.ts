import { GraphQLResolveInfo } from 'graphql';
import { Args, Info, Query, Resolver } from 'type-graphql';
import { User } from '~entities/user.entity';
import userRepository from '~repositories/user.repository';
import { ResolverUtil } from '~utils/resolver.util';
import { UserArg } from '~types/args/user.arg';

@Resolver(() => User)
export class UserResolver {
	@Query(() => [User])
	async users(@Info() info: GraphQLResolveInfo) {
		const fields = ResolverUtil.getNodes(
			info.fieldNodes[0].selectionSet?.selections
		);
		const users = await userRepository.find({}, { fields });
		return users;
	}

	@Query(() => User, { nullable: true })
	async user(@Args() userArgs: UserArg, @Info() info: GraphQLResolveInfo) {
		const fields = ResolverUtil.getNodes(
			info.fieldNodes[0].selectionSet?.selections
		);
		const filters = Object.assign({}, userArgs);

		return await userRepository.findOne(filters, {
			fields
		});
	}
}
