import { Entity, ManyToOne, Property, Rel } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Product } from './product.entity';
import { OrderItem } from './order.entity';
import { Field, Int, ObjectType } from 'type-graphql';

@ObjectType()
@Entity()
export class Feedback extends BaseEntity {
	@Field(() => Int)
	@Property()
	rating!: number;

	@Field()
	@Property()
	comment!: string;

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
