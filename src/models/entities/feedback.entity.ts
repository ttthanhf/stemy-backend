import { Entity, ManyToOne, Property, Rel } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Product } from './product.entity';
import { OrderItem } from './order.entity';
import { Field, Float, ObjectType } from 'type-graphql';

@ObjectType()
@Entity()
export class Feedback extends BaseEntity {
	@Field(() => Float)
	@Property()
	rating!: number;

	@Field()
	@Property()
	note!: string;

	@Field(() => User)
	@ManyToOne(() => User)
	user!: Rel<User>;

	@Field(() => Product)
	@ManyToOne(() => Product)
	product!: Rel<Product>;

	@Field(() => OrderItem)
	@ManyToOne(() => OrderItem)
	orderItem!: Rel<OrderItem>;
}
