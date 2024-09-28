import { Entity, ManyToOne, Property, Rel } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Product } from './product.entity';
import { Field, Int, ObjectType } from 'type-graphql';

@ObjectType()
@Entity()
export class Cart extends BaseEntity {
	@Field(() => User)
	@ManyToOne(() => User)
	user!: Rel<User>;

	@Field(() => Product)
	@ManyToOne(() => Product)
	product!: Rel<Product>;

	@Field(() => Int)
	@Property()
	quantity!: number;

	@Field()
	@Property()
	hasLab!: boolean;
}
