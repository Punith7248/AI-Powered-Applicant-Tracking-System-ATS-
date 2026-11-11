import nodemailer from "nodemailer";
export async function sendNotice(to, subject, text) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[EMAIL PREVIEW] To: ${to} | ${subject}\n${text}`);
    return;
  }
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
  await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, text });
}
