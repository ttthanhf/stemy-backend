import {
	Collection,
	Embeddable,
	Embedded,
	Entity,
	Enum,
	ManyToOne,
	OneToMany,
	Property,
	Rel
} from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Product } from './product.entity';
import { OrderStatus } from '~constants/order.constant';
import { Field, Int, ObjectType } from 'type-graphql';
import { PaymentProvider } from '~constants/payment.constant';

@ObjectType()
@Embeddable()
class OrderPaymentEmbeddable {
	@Field({ nullable: true })
	@Property({ nullable: true })
	id!: string;

	@Field()
	@Enum(() => PaymentProvider)
	provider!: PaymentProvider;

	@Field({ nullable: true })
	@Property({ type: 'datetime', nullable: true })
	time!: Date;
}

@ObjectType()
@Entity()
export class Order extends BaseEntity {
	@ManyToOne(() => User)
	user!: Rel<User>;

	@Field(() => Int)
	@Property()
	totalPrice!: number;

	@Field()
	@Property()
	address!: string;

	@Field()
	@Property()
	phone!: string;

	@Field()
	@Property()
	fullName!: string;

	@Field()
	@Property({ default: false })
	isAllowRating!: boolean;

	@Field({ nullable: true })
	@Property({ type: 'datetime', nullable: true })
	shipTime!: Date;

	@Field(() => OrderStatus)
	@Enum(() => OrderStatus)
	status!: OrderStatus;

	@Field(() => OrderPaymentEmbeddable)
	@Embedded(() => OrderPaymentEmbeddable)
	payment = new OrderPaymentEmbeddable();

	@Field(() => [OrderItem])
	@OneToMany(() => OrderItem, (orderItem) => orderItem.order)
	orderItems = new Collection<OrderItem>(this);
}

@ObjectType()
@Entity()
export class OrderItem extends BaseEntity {
	@Field(() => Order)
	@ManyToOne(() => Order)
	order!: Order;

	@Field(() => Product)
	@ManyToOne(() => Product)
	product!: Product;

	@Field(() => Int)
	@Property()
	quantity!: number;

	@Field(() => Int)
	@Property()
	productPrice!: number;

	@Field()
	@Property()
	hasLab!: boolean;

	@Field(() => Int)
	@Property()
	labPrice!: number;
}
