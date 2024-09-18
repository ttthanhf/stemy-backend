import { createSigner, createDecoder, createVerifier } from 'fast-jwt';
import { env } from '~configs/env.config';
import { JWT_CONFIG } from '~configs/jwt.config';

export class JWT {
	static sign(payload: object, expiresIn: number | string = env.JWT_EXPIRE) {
		const signSync = createSigner({
			...JWT_CONFIG,
			expiresIn: expiresIn
		});
		return signSync(payload);
	}
	static decode(token: string) {
		const decodeSync = createDecoder({ complete: true });
		return decodeSync(token);
	}

	static verify(token: string | number) {
		const verifySync = createVerifier(JWT_CONFIG);
		try {
			return verifySync(String(token));
		} catch {
			return null;
		}
	}
}
