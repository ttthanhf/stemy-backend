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
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Product } from './product.entity';
import { OrderStatus } from '~constants/order.constant';
import { Field, Int, ObjectType } from 'type-graphql';
import { PaymentProvider } from '~constants/payment.constant';

@Embeddable()
class OrderPaymentEmbeddable {
	@Property({ nullable: true })
	id!: string;

	@Enum(() => PaymentProvider)
	provider!: PaymentProvider;
}

@ObjectType()
@Entity()
export class Order extends BaseEntity {
	@ManyToOne(() => User)
	user!: Rel<User>;

	@Property()
	totalPrice!: number;

	@Property()
	address!: string;

	@Property()
	phone!: string;

	@Enum(() => OrderStatus)
	status!: OrderStatus;

	@Embedded(() => OrderPaymentEmbeddable)
	payment = new OrderPaymentEmbeddable();

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
	@OneToOne(() => Product)
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
