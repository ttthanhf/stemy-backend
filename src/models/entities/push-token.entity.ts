import { Entity, ManyToOne, Property, Unique } from '@mikro-orm/core';
import { Field, ObjectType } from 'type-graphql';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@ObjectType()
@Entity()
@Unique({ properties: ['deviceId', 'user'] })
export class PushToken extends BaseEntity {
	@Field()
	@Property()
	deviceId!: string;

	@Field()
	@Property()
	token!: string;

	@Field()
	@Property()
	platform!: string;

	@Field(() => User)
	@ManyToOne(() => User)
	user!: User;

	@Field()
	@Property({ default: true })
	isActive!: boolean;
}
