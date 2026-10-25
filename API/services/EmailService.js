import nodemailer from "nodemailer";
import { appConfig } from "../config/app.js";
import { emailConfig } from "../config/email.js";

const transporter = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    auth: {
        user: emailConfig.user,
        pass: emailConfig.password
    }
});

class EmailService {
    static async sendPostNotification(email, post, type) {
        const events = {
            post_updated: "A post you follow was updated",
            new_comment: "A post you follow has a new comment",
            post_deleted: "A post you follow was deleted"
        };
        const message = events[type];
        const baseUrl = (appConfig.appUrl ?? `http://localhost:${appConfig.port}`).replace(/\/$/, "");
        const link = `${baseUrl}/api/posts/${post.id}`;
        const text = type === "post_deleted"
            ? `${message}: ${post.title}`
            : `${message}: ${post.title}\nOpen the post: ${link}`;

        await transporter.sendMail({
            from: `"USOF" <${emailConfig.user}>`,
            to: email,
            subject: message,
            text
        });
    }

    static async sendVerificationEmail(email, verificationToken) {
        const frontendUrl = appConfig.frontendUrl.replace(/\/$/, "");
        const verificationLink =
            `${frontendUrl}/verify-email?token=${encodeURIComponent(verificationToken)}`;

        await transporter.sendMail({
            from: `"USOF" <${emailConfig.user}>`,
            to: email,
            subject: "Verify your email",
            text: `Verify your email: ${verificationLink}`,
            html: `
                <h2>Welcome to USOF</h2>
                <p>Click the link below to verify your email:</p>
                <a href="${verificationLink}" target="_blank">Verify email</a>
            `
        });
    }

    static async sendResetToken(email, token) {
        const frontendUrl = appConfig.frontendUrl.replace(/\/$/, "");
        const resetLink =
            `${frontendUrl}/password-reset?token=${encodeURIComponent(token)}`;

        await transporter.sendMail({
            from: `"USOF" <${emailConfig.user}>`,
            to: email,
            subject: "Reset your password",
            text: `Use this link to reset your password: ${resetLink}`,
            html: `
                <h2>Reset your password</h2>
                <p>We received a request to reset your password.</p>
                <p>Use the link below to reset your password:</p>
                <a href="${resetLink}" target="_blank">Reset password</a>
                <p>If you did not request a password reset, you can ignore this email.</p>
            `
        });
    }
}

export default EmailService;
