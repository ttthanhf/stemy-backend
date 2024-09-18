import { env } from '~configs/env.config';
import { QueryString } from '~utils/query-string.util';
import {
	OAUTH2_GOOGLE_TOKEN,
	OAUTH2_GOOGLE_USER_INFO,
	Oauth2Client
} from '~types/oauth2.type';
import { AuthProviderName } from '~constants/oauth2.constant';

export class Oauth2Service {
	private static OAUTH2: Record<AuthProviderName, Oauth2Client> = {
		google: {
			client_id: env.OAUTH2_GOOGLE_CLIENT_ID,
			client_secret: env.OAUTH2_GOOGLE_CLIENT_SECRET,
			redirect_uri: {
				login: env.OAUTH2_GOOGLE_REDIRECT_URI_LOGIN
			}
		}
	} as const;

	private static getOauth2GoogleURL() {
		const querystring = QueryString.stringify({
			response_type: 'code',
			client_id: this.OAUTH2.google.client_id,
			redirect_uri: this.OAUTH2.google.redirect_uri.login,
			scope: 'email+profile+openid'
		});
		return 'https://accounts.google.com/o/oauth2/v2/auth?' + querystring;
	}

	static getOauth2URL(authProviderName: AuthProviderName) {
		switch (authProviderName) {
			case AuthProviderName.GOOGLE:
				return this.getOauth2GoogleURL();
			default:
				return null;
		}
	}

	private static async getGoogleToken(
		code: string
	): Promise<OAUTH2_GOOGLE_TOKEN> {
		const querystring = QueryString.stringify({
			code,
			client_id: this.OAUTH2[AuthProviderName.GOOGLE]['client_id'],
			client_secret: this.OAUTH2[AuthProviderName.GOOGLE]['client_secret'],
			redirect_uri: this.OAUTH2[AuthProviderName.GOOGLE]['redirect_uri'].login,
			grant_type: 'authorization_code'
		});

		const fetchData = await fetch(
			'https://oauth2.googleapis.com/token?' + querystring,
			{
				method: 'POST'
			}
		);

		return await fetchData.json();
	}
	private static async getGoogleUserInfo(
		access_token: string,
		token_type: string
	): Promise<OAUTH2_GOOGLE_USER_INFO> {
		const fetchData = await fetch(
			'https://www.googleapis.com/oauth2/v3/userinfo',
			{
				headers: {
					Authorization: token_type + ' ' + access_token
				}
			}
		);
		return await fetchData.json();
	}

	static async getInfoByLoginWithGoogle(code: string) {
		const tokenData = await this.getGoogleToken(code);
		const userInfo = await this.getGoogleUserInfo(
			tokenData.access_token,
			tokenData.token_type
		);

		return {
			email: userInfo.email,
			name: userInfo.name
		};
	}
}
