import nodemailer, { Transporter } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { MAIL_CONFIG } from '~configs/mail.config';

class MailUtil {
	private transporter!: Transporter<SMTPTransport.SentMessageInfo>;

	constructor() {
		if (!this.transporter) {
			this.transporter = nodemailer.createTransport(MAIL_CONFIG);
		}
	}
	sendMail(opts: Mail.Options) {
		this.transporter.sendMail(opts);
	}
	sendMailRecoveryPassword(targetMail: string, redirectUrl: string) {
		this.sendMail({
			to: targetMail,
			subject: 'Khôi phục mật khẩu',
			html: `
			<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 200px 0; color: #333">
				<div
				style="
					width: 100%;
					max-width: 600px;
					margin: 0 auto;
					background-color: #ffffff;
					padding: 20px;
					border: 1px solid #dddddd;
					box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
				"
				>
				<div style="text-align: center; padding-bottom: 20px">
					<h1 style="margin: 0; color: #007bff">Quên mật khẩu</h1>
				</div>
				<div style="line-height: 1.6">
					<p>Chào ${targetMail.split('@')[0]},</p>
					<p>
					Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình. Vui lòng nhấp vào nút bên dưới để đặt lại mật khẩu:
					</p>
					<a
					href="${redirectUrl}"
					style="
						display: block;
						width: 200px;
						margin: 20px auto;
						padding: 10px;
						text-align: center;
						background-color: #007bff;
						color: white;
						text-decoration: none;
						border-radius: 5px;
					"
					>Đặt lại mật khẩu</a
					>
					<p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
					<p>Trân trọng,<br />ThanhF</p>
				</div>
				<div style="text-align: center; font-size: 12px; color: #777; margin-top: 20px">
					<p>&copy; 2024 ThanhF. Mọi quyền được bảo lưu.</p>
				</div>
				</div>
		  	</body>`
		});
	}
}

export default new MailUtil();
