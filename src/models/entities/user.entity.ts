import {
	AfterCreate,
	BeforeCreate,
	BeforeUpdate,
	Collection,
	Entity,
	Enum,
	EventArgs,
	ManyToOne,
	OneToMany,
	Property
} from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { Role } from '~constants/role.constant';
import { Field, ObjectType } from 'type-graphql';
import { UserStatus } from '~constants/status.constant';
import logger from '~utils/logger.util';
import { CryptoUtil } from '~utils/crypto.util';
import { OrderItem } from './order.entity';
import { ProductLab } from './product.entity';
import { Feedback } from './feedback.entity';

@ObjectType()
@Entity()
export class User extends BaseEntity {
	@Field()
	@Property()
	fullName!: string;

	@Field({ nullable: true })
	@Property({
		nullable: true
	})
	phone!: string;

	@Field()
	@Property()
	email!: string;

	@Property()
	password!: string;

	@Field(() => Role)
	@Enum(() => Role)
	role: Role = Role.CUSTOMER;

	@Field(() => UserStatus)
	@Enum(() => UserStatus)
	status: UserStatus = UserStatus.ACTIVE;

	@OneToMany(() => UserLab, (userLab) => userLab.user)
	labs = new Collection<UserLab>(this);

	@OneToMany(() => Feedback, (feedback) => feedback.user)
	feedbacks = new Collection<Feedback>(this);

	@BeforeCreate()
	async encryptPassword() {
		if (this.password) {
			this.password = await CryptoUtil.encryptPassword(this.password);
		}
	}

	@AfterCreate()
	async log() {
		logger.info('Create new user');
	}

	@BeforeUpdate()
	async encryptPasswordUpdate(args: EventArgs<this>) {
		if (args.changeSet?.payload.password) {
			this.password = await CryptoUtil.encryptPassword(
				args.changeSet.payload.password
			);
		}
	}
}

@Entity()
export class UserLab extends BaseEntity {
	@ManyToOne(() => User)
	user!: User;

	@ManyToOne(() => ProductLab)
	productLab!: ProductLab;

	@ManyToOne(() => OrderItem)
	orderItem!: OrderItem;

	@Property()
	isActive!: boolean;
}
