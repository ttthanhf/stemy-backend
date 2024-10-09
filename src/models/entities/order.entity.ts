import {
	Collection,
	Embeddable,
	Embedded,
	Entity,
	Enum,
	ManyToOne,
	OneToMany,
	OneToOne,
	Property,
	Rel
} from '@mikro-orm/core';
import { Field, Int, ObjectType } from 'type-graphql';
import { OrderStatus } from '~constants/order.constant';
import { PaymentProvider } from '~constants/payment.constant';
import { BaseEntity } from './base.entity';
import { Product } from './product.entity';
import { User, UserLab } from './user.entity';

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

	@Field({ nullable: true })
	@Property({ type: 'datetime', nullable: true })
	shipTime!: Date;

	@Field({ nullable: true })
	@Property({ type: 'datetime', nullable: true })
	receiveTime!: Date;

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

	@Field(() => UserLab, { nullable: true })
	@OneToOne(() => UserLab, (userLab) => userLab.orderItem, { nullable: true })
	userLab?: Rel<UserLab>;
}
