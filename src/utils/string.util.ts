export class StringUtil {
	static removeVietnameseTones(str: string) {
		str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
		str = str.replace(/đ/g, 'd').replace(/Đ/g, 'D');
		return str;
	}
}
