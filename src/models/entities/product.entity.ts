import {
	Collection,
	Entity,
	ManyToOne,
	OneToMany,
	OneToOne,
	Property,
	Rel
} from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { Field, ObjectType } from 'type-graphql';
import { Feedback } from './feedback.entity';

@ObjectType()
@Entity()
export class Product extends BaseEntity {
	@Field()
	@Property()
	name!: string;

	@Field()
	@Property()
	description!: string;

	@Field()
	@Property()
	price!: number;

	@Field(() => ProductCategory)
	@ManyToOne(() => ProductCategory)
	category!: Rel<ProductCategory>;

	@Field(() => [Feedback])
	@OneToMany(() => Feedback, (feedback) => feedback.product)
	feedbacks = new Collection<Feedback>(this);
}

@ObjectType()
@Entity()
export class ProductCategory extends BaseEntity {
	@Field()
	@Property()
	name!: string;
}

@ObjectType()
@Entity()
export class ProductLab extends BaseEntity {
	@Field()
	@Property()
	url!: string;

	@OneToOne(() => Product)
	product!: Product;
}
