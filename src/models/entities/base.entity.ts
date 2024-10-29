import { PrimaryKey, Property } from '@mikro-orm/core';
import { Field, ID, ObjectType } from 'type-graphql';

@ObjectType()
export abstract class BaseEntity {
	@Field(() => ID)
	@PrimaryKey({
		autoincrement: true,
		unique: true,
		index: true
	})
	readonly id!: number;

	@Field()
	@Property({ type: 'datetime' })
	readonly createdAt: Date = new Date();

	@Field({ nullable: true })
	@Property({ onUpdate: () => new Date(), type: 'datetime', nullable: true })
	readonly updatedAt!: Date;

	@Field({ nullable: true })
	@Property({ type: 'datetime', nullable: true })
	deletedAt!: Date;

	@Field()
	@Property({ default: false })
	isDelete: boolean = false;
}
