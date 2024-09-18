import { HttpRequest, HttpResponse } from 'uWebSockets.js';
import { HTTP_STATUS_CODE } from '~constants/http-status-code.constant';
import { AuthProviderName } from '~constants/oauth2.constant';
import { User } from '~entities/user.entity';
import { Oauth2Service } from '~services/oauth2.service';
import { UserService } from '~services/user.service';
import { QueryString } from '~utils/query-string.util';

export class AuthController {
	static async redirectLoginOauth2(res: HttpResponse, req: HttpRequest) {
		const authProviderName = req.getParameter(0) as AuthProviderName;

		const url = Oauth2Service.getOauth2URL(authProviderName);
		if (!url) {
			res.model.statusCode = HTTP_STATUS_CODE.BAD_REQUEST;
			res.model.errors = {
				message: 'Oauth2 not support'
			};
			return res.model.send();
		}
		return res.model.redirect(url);
	}

	static async getUrlLoginOauth2(res: HttpResponse, req: HttpRequest) {
		const authProviderName = req.getParameter(0) as AuthProviderName;
		const url = Oauth2Service.getOauth2URL(authProviderName);
		if (!url) {
			res.model.statusCode = HTTP_STATUS_CODE.BAD_REQUEST;
			res.model.errors = {
				message: 'Oauth2 not support'
			};
			return res.model.send();
		}
		res.model.data = {
			url
		};
		return res.model.send();
	}

	static async loginOauth2(res: HttpResponse, req: HttpRequest) {
		const authProviderName = req.getParameter(0) as AuthProviderName;
		const url = Oauth2Service.getOauth2URL(authProviderName);
		if (!url) {
			res.model.statusCode = HTTP_STATUS_CODE.BAD_REQUEST;
			res.model.errors = {
				message: 'Oauth2 not support'
			};
			return res.model.send();
		}

		const { code } = QueryString.parse(req.getQuery());
		const info = await Oauth2Service.getInfoByLoginWithGoogle(code);
		let user = await UserService.getUserByEmail(info.email);
		if (!user) {
			user = new User();
			user.email = info.email;
			user.fullName = info.name;

			user = await UserService.createNewUser(user);
		}

		const access_token = UserService.generateUserAccessToken(user);
		res.model.data = {
			access_token
		};
		return res.model.send();
	}
}
