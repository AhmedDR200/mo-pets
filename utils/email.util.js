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
        from: `MO-PETS <${EMAIL_USER}>`,
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

    const subject =
        "Wholesale Access Request | طلب الوصول إلى أسعار الجملة";
    const html = `
  <div style="font-family: 'Poppins', 'Segoe UI', Arial, sans-serif; background-color: #fefaf5; padding: 32px;">
    <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 18px 40px rgba(115, 103, 240, 0.12); border: 3px solid #ffe4c4;">
      <div style="background: linear-gradient(135deg, #ff9f68, #ffd166); color: #40210f; padding: 28px; position: relative;">
        <span style="position: absolute; top: 12px; right: 18px; font-size: 32px;">🐾</span>
        <h1 style="margin: 0; font-size: 24px;">Friendly Wholesale OTP</h1>
        <p style="margin: 10px 0 0; font-size: 14px; opacity: 0.85;">
          A pawsome request needs your approval!<br/>
          هناك طلب ودود بانتظار موافقتك!
        </p>
        <span style="position: absolute; bottom: -18px; left: 28px; font-size: 42px;">🐶</span>
        <span style="position: absolute; bottom: -12px; right: 45px; font-size: 38px;">🐱</span>
      </div>
      <div style="padding: 32px; color: #40210f; font-size: 15px; line-height: 1.7; background-image: url('https://emojicdn.elk.sh/%F0%9F%90%B6'); background-repeat: no-repeat; background-position: 92% 12%; background-size: 48px;">
        <p style="margin-top: 0;">
          <strong style="color: #ff7b54;">Requester Email | البريد الإلكتروني للعميل:</strong><br/>
          ${requestEmail}
        </p>
        <div style="margin: 26px 0; text-align: center;">
          <span style="display: inline-block; font-size: 30px; letter-spacing: 10px; padding: 20px 26px; border-radius: 14px; border: 2px dashed rgba(255, 155, 68, 0.45); background-color: rgba(255, 209, 102, 0.18); color: #d97706; font-weight: 700; box-shadow: inset 0 0 0 3px rgba(255, 243, 224, 0.9);">
            ${otp}
          </span>
        </div>
        <p style="margin: 0 0 14px;">
          🐕 Please share this code with the requester. It will expire in <strong>2 hours</strong>.
        </p>
        <p style="margin: 0;">
          🐾 يرجى مشاركة هذا الرمز مع العميل. سينتهي صلاحيته خلال <strong>ساعتين</strong>.
        </p>
      </div>
      <div style="background-color: #fff3df; padding: 20px; text-align: center; font-size: 12px; color: #8c5a2f;">
        This email was generated automatically. If you did not expect it, you can safely ignore it.<br/>
        تم إنشاء هذا البريد الإلكتروني تلقائيًا. إذا لم تكن تتوقعه، يمكنك تجاهله بأمان.
        <div style="margin-top: 12px; font-size: 20px;">🐰🐾🐢</div>
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

