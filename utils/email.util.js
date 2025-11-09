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

    const subject = "New Wholesale Access Request";
    const message = [
        "A user has requested access to wholesale pricing.",
        "",
        `Requesting email: ${requestEmail}`,
        `One-Time Passcode: ${otp}`,
        "",
        "The passcode will expire in 2 hours.",
    ].join("\n");

    await sendEmail({
        email: ADMIN_EMAIL,
        subject,
        message,
    });
};

module.exports = { sendEmail, notifyAdminWithOtp };

