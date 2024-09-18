import { registerEnumType } from 'type-graphql';

export enum Role {
	MANAGER = 'manager',
	STAFF = 'staff',
	CUSTOMER = 'customer',
	ADMIN = 'admin'
}

registerEnumType(Role, {
	name: 'Role'
});
