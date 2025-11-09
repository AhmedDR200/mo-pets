const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
    const {
        EMAIL_HOST,
        EMAIL_PORT,
        EMAIL_USER,
        EMAIL_PASSWORD,
        ADMIN_EMAIL,
    } = process.env;

    if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASSWORD) {
        throw new Error(
            "Email configuration is missing. Please set EMAIL_HOST, EMAIL_PORT, EMAIL_USER, and EMAIL_PASSWORD.",
        );
    }

    const transporter = nodemailer.createTransport({
        host: EMAIL_HOST,
        port: Number(EMAIL_PORT),
        secure: true,
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: `E-Commerce <${EMAIL_USER}>`,
        to: options.email || ADMIN_EMAIL,
        subject: options.subject,
        text: options.message,
        html: options.html,
    };

    await transporter.sendMail(mailOptions);
};

const notifyAdminWithOtp = async ({ otp, requestEmail }) => {
    const { ADMIN_EMAIL } = process.env;

    if (!ADMIN_EMAIL) {
        throw new Error("ADMIN_EMAIL environment variable is not configured.");
    }

    const subject = "Wholesale Access Request | طلب الوصول إلى أسعار الجملة";
    const html = `
  <div style="font-family: Arial, 'Segoe UI', Tahoma, sans-serif; background-color: #f7f7f9; padding: 24px;">
    <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);">
      <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #ffffff; padding: 24px;">
        <h1 style="margin: 0; font-size: 22px;">Wholesale Access OTP</h1>
        <p style="margin: 8px 0 0; font-size: 14px; opacity: 0.85;">
          Secure one-time code to review the wholesale access request.<br/>
          رمز مرور لمرة واحدة لمراجعة طلب الوصول إلى أسعار الجملة.
        </p>
      </div>
      <div style="padding: 24px; color: #0f172a; font-size: 15px; line-height: 1.6;">
        <p style="margin-top: 0;">
          <strong>Requester Email | البريد الإلكتروني للعميل:</strong><br/>
          ${requestEmail}
        </p>
        <div style="margin: 24px 0; text-align: center;">
          <span style="display: inline-block; font-size: 28px; letter-spacing: 12px; padding: 18px 24px; border-radius: 10px; border: 1px solid rgba(37, 99, 235, 0.25); background-color: rgba(37, 99, 235, 0.07); color: #1d4ed8; font-weight: 600;">
            ${otp}
          </span>
        </div>
        <p style="margin: 0 0 12px;">
          Please share this code with the requester. It will expire in <strong>2 hours</strong>.
        </p>
        <p style="margin: 0;">
          يرجى مشاركة هذا الرمز مع العميل. سينتهي صلاحيته خلال <strong>ساعتين</strong>.
        </p>
      </div>
      <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b;">
        This email was generated automatically. If you did not expect it, you can safely ignore it.<br/>
        تم إنشاء هذا البريد الإلكتروني تلقائيًا. إذا لم تكن تتوقعه، يمكنك تجاهله بأمان.
      </div>
    </div>
  </div>
  `;

    await sendEmail({
        email: ADMIN_EMAIL,
        subject,
        html,
    });
};

module.exports = { sendEmail, notifyAdminWithOtp };

