import {
	Collection,
	Entity,
	ManyToOne,
	OneToMany,
	Property,
	Rel
} from '@mikro-orm/core';
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

	@Field({ nullable: true })
	@Property({ nullable: true })
	note!: string;

	@Field(() => [FeedbackImage], { nullable: true })
	@OneToMany(() => FeedbackImage, (feedbackImage) => feedbackImage.feedback)
	images = new Collection<FeedbackImage>(this);

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

@ObjectType()
@Entity()
export class FeedbackImage extends BaseEntity {
	@ManyToOne(() => Feedback)
	feedback!: Feedback;

	@Field()
	@Property()
	url!: string;
}
