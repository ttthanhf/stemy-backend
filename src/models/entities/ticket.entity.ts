import {
	Collection,
	Entity,
	Enum,
	ManyToOne,
	OneToMany,
	OneToOne,
	Property,
	Rel
} from '@mikro-orm/core';
import { Field, ObjectType } from 'type-graphql';
import { TicketStatus } from '~constants/ticket.constant';
import { User } from './user.entity';
import { BaseEntity } from './base.entity';
import { OrderItem } from './order.entity';

@ObjectType()
@Entity()
export class Ticket extends BaseEntity {
	@Field()
	@Property()
	title!: string;

	@Field(() => TicketCategory)
	@OneToMany(() => TicketCategory, (ticketCategory) => ticketCategory.tickets)
	category!: Rel<TicketCategory>;

	@Field(() => TicketStatus)
	@Enum(() => TicketStatus)
	status: TicketStatus = TicketStatus.OPEN;

	@Field(() => OrderItem)
	@ManyToOne(() => OrderItem)
	orderItem!: OrderItem;

	@Field(() => User)
	@OneToOne(() => User)
	sender!: User;

	@Field()
	@Property()
	senderComment!: string;

	@Field(() => User, { nullable: true })
	@OneToOne(() => User, { nullable: true })
	replier!: User;

	@Field({ nullable: true })
	@Property({ nullable: true })
	replierComment!: string;

	@Field({ nullable: true })
	@Property({ type: 'datetime', nullable: true })
	closedAt!: Date;
}

@ObjectType()
@Entity()
export class TicketCategory extends BaseEntity {
	@Field()
	@Property()
	name!: string;

	@Field(() => [Ticket])
	@ManyToOne(() => Ticket)
	tickets = new Collection<Ticket>(this);
}
