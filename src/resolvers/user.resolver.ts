import { GraphQLError, GraphQLResolveInfo } from 'graphql';
import {
	Arg,
	Args,
	Ctx,
	Info,
	Mutation,
	Query,
	Resolver,
	UseMiddleware
} from 'type-graphql';
import { User, UserLab } from '~entities/user.entity';
import { ResolverUtil } from '~utils/resolver.util';
import { UpdateUserArg, UserArg } from '~types/args/user.arg';
import { Context } from '~types/context.type';
import { AuthMiddleware } from '~middlewares/auth.middleware';
import { UserLabService, UserService } from '~services/user.service';
import { RoleRequire } from 'decorators/auth.decorator';
import { Role } from '~constants/role.constant';
import { FileScalar, FileUpload } from '~types/scalars/file.scalar';

@Resolver(() => User)
export class UserResolver {
	@RoleRequire([Role.STAFF])
	@Query(() => [User])
	async users(@Info() info: GraphQLResolveInfo) {
		const fields = ResolverUtil.getNodes(
			info.fieldNodes[0].selectionSet?.selections
		);

		return await UserService.getAllUser(fields);
	}

	@RoleRequire([Role.STAFF])
	@Query(() => User, { nullable: true })
	async user(@Args() userArgs: UserArg, @Info() info: GraphQLResolveInfo) {
		const fields = ResolverUtil.getNodes(
			info.fieldNodes[0].selectionSet?.selections
		);
		const filters = Object.assign({}, userArgs);

		return await UserService.getUserWithFilters(filters, fields);
	}

	@UseMiddleware(AuthMiddleware.LoginRequire)
	@Query(() => User)
	async me(@Info() info: GraphQLResolveInfo, @Ctx() ctx: Context) {
		const fields = ResolverUtil.getNodes(
			info.fieldNodes[0].selectionSet?.selections
		);
		const userId = ctx.res.model.data.user.id;
		const user = await UserService.getUserById(userId, fields);

		return user;
	}

	@UseMiddleware(AuthMiddleware.LoginRequire)
	@Mutation(() => User)
	async updateUser(@Ctx() ctx: Context, @Args() updateUserArg: UpdateUserArg) {
		const userId = ctx.res.model.data.user.id;
		const user = await UserService.getUserById(userId);
		if (!user) {
			throw new GraphQLError('Something error with this user');
		}

		user.phone = updateUserArg.phone || user.phone;
		user.email = updateUserArg.email || user.email;
		user.fullName = updateUserArg.fullName || user.fullName;
		user.address = updateUserArg.address || user.address;

		await UserService.updateUser(user);

		return user;
	}

	@UseMiddleware(AuthMiddleware.LoginRequire)
	@Mutation(() => User)
	async updateAvatar(
		@Ctx() ctx: Context,
		@Arg('image', () => FileScalar)
		image: FileUpload
	) {
		if (!image.type.startsWith('image/')) {
			throw new GraphQLError(image.name + ' not a image');
		}
		if (image.blobParts[0].byteLength > 1000000) {
			throw new GraphQLError(image.name + ' must not exceed 1MB');
		}

		const userId = ctx.res.model.data.user.id;
		const user = await UserService.getUserById(userId);
		if (!user) {
			throw new GraphQLError('Something error with this user');
		}

		const url = await UserService.uploadAvatar(user, image);

		user.avatar = url;

		await UserService.updateUser(user);

		return user;
	}

	@UseMiddleware(AuthMiddleware.LoginRequire)
	@Query(() => [UserLab])
	async userLabs(@Ctx() ctx: Context, @Info() info: GraphQLResolveInfo) {
		const fields = ResolverUtil.getNodes(
			info.fieldNodes[0].selectionSet?.selections
		);

		const userId = ctx.res.model.data.user.id;
		const user = await UserService.getUserById(userId);
		if (!user) {
			throw new GraphQLError('Something error with this user');
		}

		const userLabs = await UserLabService.getUserLabsByUserId(user.id, fields);
		return userLabs;
	}
}
