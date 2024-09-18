import { registerEnumType } from 'type-graphql';

export enum Oauth2Key {
	ID = 'id',
	SECRET = 'secret',
	REDIRECT_URI = 'redirect_uri'
}

export enum AuthProviderName {
	GOOGLE = 'google'
}

registerEnumType(AuthProviderName, {
	name: 'AuthProviderName'
});
