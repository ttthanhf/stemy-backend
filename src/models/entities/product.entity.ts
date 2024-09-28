import {
	Collection,
	Entity,
	Enum,
	ManyToMany,
	ManyToOne,
	OneToMany,
	OneToOne,
	Property,
	Rel
} from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { Field, Int, ObjectType } from 'type-graphql';
import { Feedback } from './feedback.entity';
import { CategoryType } from '~constants/category.constant';

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

	@Field(() => ProductLab, { nullable: true })
	@OneToOne(() => ProductLab, (productLab) => productLab.product, {
		nullable: true
	})
	lab?: Rel<ProductLab>;

	@Field(() => [ProductCategory])
	@ManyToMany(
		() => ProductCategory,
		(productCategory) => productCategory.products,
		{ owner: true }
	)
	categories = new Collection<ProductCategory>(this);

	@Field(() => [Feedback])
	@OneToMany(() => Feedback, (feedback) => feedback.product)
	feedbacks = new Collection<Feedback>(this);

	@Field(() => [ProductImage])
	@OneToMany(() => ProductImage, (productImage) => productImage.product)
	images = new Collection<ProductImage>(this);

	@Field(() => Int)
	@Property({ default: 0 })
	sold!: number;

	@Field(() => Int)
	@Property({ default: 0 })
	rating!: number;
}

@ObjectType()
@Entity()
export class ProductCategory extends BaseEntity {
	@Field(() => [Product])
	@ManyToMany(() => Product, (product) => product.categories)
	products = new Collection<Product>(this);

	@Field()
	@Property()
	name!: string;

	@Field()
	@Property()
	title!: string;

	@Field(() => [CategoryType])
	@Enum(() => CategoryType)
	type!: CategoryType;
}

@ObjectType()
@Entity()
export class ProductLab extends BaseEntity {
	@OneToOne(() => Product, (product) => product.lab, { owner: true })
	product!: Rel<Product>;

	@Field()
	@Property()
	url!: string;

	@Field(() => Int)
	@Property()
	price!: number;
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
