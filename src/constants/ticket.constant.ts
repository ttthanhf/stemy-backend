import { registerEnumType } from 'type-graphql';

export enum TicketStatus {
	OPEN = 'open',
	CLOSE = 'close'
}

registerEnumType(TicketStatus, {
	name: 'TicketStatus'
});
