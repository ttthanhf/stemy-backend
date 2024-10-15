import { PushToken } from '~entities/push-token.entity';
import { BaseRepository } from './base.repository';

class PushTokenRepository extends BaseRepository<PushToken> {
	constructor() {
		super(PushToken);
	}
}
export const pushTokenRepository = new PushTokenRepository();
