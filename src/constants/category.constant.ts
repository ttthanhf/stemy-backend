import { registerEnumType } from 'type-graphql';

export enum CategoryType {
	AGE = 'age',
	TOPIC = 'topic',
	PRODUCT = ' product'
}

registerEnumType(CategoryType, {
	name: 'CategoryType'
});
