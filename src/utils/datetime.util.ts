import { parse } from '@lukeed/ms';

export class DateTimeUtil {
	static convertToMillisecond(input: string) {
		//https://github.com/lukeed/ms
		return parse(input) || 0;
	}

	static calculateFutureTimestamp(input: string) {
		return Date.now() + this.convertToMillisecond(input);
	}

	static formatDateToYYYYMMDDHHMMSS(date: Date) {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		const hours = String(date.getHours()).padStart(2, '0');
		const minutes = String(date.getMinutes()).padStart(2, '0');
		const seconds = String(date.getSeconds()).padStart(2, '0');
		return `${year}${month}${day}${hours}${minutes}${seconds}`;
	}
}
