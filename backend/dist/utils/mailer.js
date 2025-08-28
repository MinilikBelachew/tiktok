import nodemailer from "nodemailer";
const sendResetEmail = async (to, token) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        }
    });
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await transporter.sendMail({
        from: `Betting App <${process.env.EMAIL}>`,
        to,
        subject: "Password Reset Request",
        html: `
            <p>Hi,</p>
            <p>You requested a password reset. Click the link below to reset your password:</p>
            <p><a href="${resetLink}">Reset Password</a></p>
            <p>If you did not request this, please ignore this email.</p>
            <p>Thanks,</p>
            <p>Betting App Team</p>
        `,
    });
};
export default sendResetEmail;
