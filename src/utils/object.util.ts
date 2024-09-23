/* eslint-disable @typescript-eslint/no-explicit-any */

export class ObjectUtil {
	static sortObject<T extends Record<string, any>>(obj: T): T {
		const sorted: Partial<T> = {};
		const keys = Object.keys(obj).sort();

		for (const key of keys) {
			const value = obj[key];
			sorted[key as keyof T] = value;
		}

		return sorted as T;
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
