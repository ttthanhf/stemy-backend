import { PDFDocument } from 'pdf-lib';
import { HttpRequest, HttpResponse } from 'uWebSockets.js';
import { UserLabService } from '~services/user.service';
import { JWTUtil } from '~utils/jwt.util';

export class DownloadController {
	static async downloadLab(res: HttpResponse, req: HttpRequest) {
		const orderItemId = req.getParameter(0);
		const access_token = req.getHeader('authorization');

		const token = JWTUtil.verify(access_token);
		if (!token) {
			res.model.errors = {
				message: 'Token not valid'
			};
			return res.model.send();
		}

		const userId = token.payload.id;

		const lab = await UserLabService.getUserLabByUserIdAndOrderItemId(
			userId,
			Number(orderItemId)
		);

		if (!lab) {
			res.model.errors = {
				message: 'User not permission for this lab'
			};
			return res.model.send();
		}
		if (!lab.isActive) {
			res.model.errors = {
				message: 'This lab not active yet'
			};
			return res.model.send();
		}

		const response = await fetch(lab.productLab.url);
		const arrayBuffer = await response.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		const pdfDoc = await PDFDocument.load(buffer);
		const pages = pdfDoc.getPages();
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		pages.forEach((page, index) => {
			// const { width, height } = page.getSize();
			page.drawText(
				`${lab.user.fullName} - ${lab.orderItem.order.id} - Copy right by Stemy`,
				{
					x: 50,
					y: 30,
					size: 12
				}
			);
		});

		const pdfBytesModified = await pdfDoc.save();

		res.writeHeader('Content-Type', 'application/pdf');
		res.end(pdfBytesModified);
		return;
	}
}
