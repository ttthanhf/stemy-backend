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
import { Field, Int, ObjectType } from 'type-graphql';
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

	@Field(() => Int)
	@Property()
	price!: number;

	@Field(() => ProductCategory)
	@ManyToOne(() => ProductCategory)
	category!: Rel<ProductCategory>;

	@Field(() => [Feedback])
	@OneToMany(() => Feedback, (feedback) => feedback.product)
	feedbacks = new Collection<Feedback>(this);

	@Field(() => [ProductImage])
	@OneToMany(() => ProductImage, (productImage) => productImage.product)
	images = new Collection<ProductImage>(this);

	@Field(() => Int)
	@Property({ default: 0 })
	sold!: number;
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
	@OneToOne(() => Product)
	product!: Product;

	@Field()
	@Property()
	url!: string;
}

@ObjectType()
@Entity()
export class ProductImage extends BaseEntity {
	@ManyToOne(() => Product)
	product!: Product;

	@Field()
	@Property()
	url!: string;
}
