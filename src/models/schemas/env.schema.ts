import { Static, Type } from '@sinclair/typebox';
import { LogLevel, ServerEnvironment } from '~constants/server.constant';

export const envTypeSchema = Type.Object({
	SERVER_PORT: Type.Number(),
	SERVER_LOG_LEVEL: Type.Enum(LogLevel),
	SERVER_LOG_DB_DEBUG: Type.Boolean(),
	SERVER_ENVIRONMENT: Type.Enum(ServerEnvironment),

	OAUTH2_GOOGLE_CLIENT_ID: Type.String(),
	OAUTH2_GOOGLE_CLIENT_SECRET: Type.String(),
	OAUTH2_GOOGLE_REDIRECT_URI_LOGIN: Type.String(),

	MAIL_USER: Type.String(),
	MAIL_PASSWORD: Type.String(),

	DB_MARIABD_USER: Type.String(),
	DB_MARIABD_PASSWORD: Type.String(),
	DB_MARIABD_HOST: Type.String(),
	DB_MARIABD_PORT: Type.Number(),
	DB_MARIABD_DATABASE: Type.String(),

	DB_REDIS_HOST: Type.String(),
	DB_REDIS_PORT: Type.Number(),

	JWT_EXPIRE: Type.String(),
	JWT_ALGORITHM: Type.String(),
	JWT_KEY: Type.String()
});

export type EnvType = Static<typeof envTypeSchema>;
