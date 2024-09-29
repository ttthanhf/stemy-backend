/* eslint-disable @typescript-eslint/no-explicit-any */

export class ObjectUtil {
	static sortObjectVNPay<T extends Record<string, any>>(obj: T): T {
		const sorted = {} as T;
		const str: string[] = [];
		for (const key in obj) {
			if (Object.prototype.hasOwnProperty.call(obj, key)) {
				str.push(encodeURIComponent(key));
			}
		}
		str.sort();
		for (let i = 0; i < str.length; i++) {
			const originalKey = str[i];
			sorted[originalKey as keyof T] = encodeURIComponent(
				obj[originalKey as keyof T]
			).replace(/%20/g, '+') as any;
		}
		return sorted;
	}

	static cloneObject<T extends object, K extends keyof T>(
		obj: T,
		propertiesToRemove?: K[]
	): T {
		const clonedObj = JSON.parse(JSON.stringify(obj)) as T;

		if (propertiesToRemove) {
			for (const key of propertiesToRemove) {
				if (typeof key === 'string') {
					const parts = key.split('.');
					let temp: any = clonedObj;

					for (let i = 0; i < parts.length - 1; i++) {
						if (temp[parts[i]] === undefined) break;
						temp = temp[parts[i]];
					}

					delete temp[parts[parts.length - 1]];
				}
			}
		}

		return clonedObj;
	}
}
