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
import { Field, Float, ObjectType } from 'type-graphql';
import { TicketStatus } from '~constants/ticket.constant';
import { User } from './user.entity';
import { BaseEntity } from './base.entity';
import { OrderItem } from './order.entity';
import { Role } from '~constants/role.constant';

@ObjectType()
@Entity()
export class Ticket extends BaseEntity {
	@Field()
	@Property()
	title!: string;

	@Field(() => Float, { nullable: true })
	@Property({ type: 'float', nullable: true })
	rating!: number;

	@Field(() => TicketCategory)
	@ManyToOne(() => TicketCategory)
	category!: Rel<TicketCategory>;

	@Field(() => TicketStatus)
	@Enum(() => TicketStatus)
	status: TicketStatus = TicketStatus.OPEN;

	@Field(() => OrderItem)
	@ManyToOne(() => OrderItem)
	orderItem!: Rel<OrderItem>;

	@Field(() => User)
	@OneToOne(() => User)
	sender!: Rel<User>;

	@Field()
	@Property()
	senderComment!: string;

	@Field(() => [TicketImage])
	@OneToMany(() => TicketImage, (ticketImage) => ticketImage.ticket)
	images = new Collection<TicketImage>(this);

	@Field(() => User, { nullable: true })
	@OneToOne(() => User, { nullable: true })
	replier!: Rel<User>;

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
	@OneToMany(() => Ticket, (ticket) => ticket.category)
	tickets = new Collection<Ticket>(this);
}

@ObjectType()
@Entity()
export class TicketImage extends BaseEntity {
	@Field()
	@ManyToOne(() => Ticket)
	ticket!: Ticket;

	@Field()
	@Property()
	url!: string;

	@Field(() => Role)
	@Enum(() => Role)
	owner!: Role;
}
