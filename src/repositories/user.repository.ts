import { User, UserLab } from '~entities/user.entity';
import { BaseRepository } from './base.repository';

class UserRepository extends BaseRepository<User> {
	constructor() {
		super(User);
	}
}
export const userRepository = new UserRepository();

class UserLabRepository extends BaseRepository<UserLab> {
	constructor() {
		super(UserLab);
	}
}
export const userLabRepository = new UserLabRepository();
