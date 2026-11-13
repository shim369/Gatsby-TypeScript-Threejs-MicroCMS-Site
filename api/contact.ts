import nodemailer from "nodemailer";
import type { VercelRequest, VercelResponse } from "@vercel/node";

type ContactBody = {
  name?: string;
  email?: string;
  message?: string;
  googleReCaptchaToken?: string;
};

const verifyRecaptcha = async (secret: string, token: string) => {
  const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    body: new URLSearchParams({ secret, response: token }),
  });
  const result: { success: boolean; score?: number; action?: string } =
    await res.json();
  return (
    result.success && result.action === "submit" && (result.score ?? 0) >= 0.5
  );
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { name, email, message, googleReCaptchaToken }: ContactBody =
    typeof req.body === "string" ? JSON.parse(req.body) : req.body ?? {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }

  const { RECAPTCHA_SECRET_KEY, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_TO_EMAIL } =
    process.env;

  if (RECAPTCHA_SECRET_KEY) {
    if (
      !googleReCaptchaToken ||
      !(await verifyRecaptcha(RECAPTCHA_SECRET_KEY, googleReCaptchaToken))
    ) {
      return res.status(403).json({ error: "reCAPTCHA verification failed" });
    }
  }

  const port = Number(SMTP_PORT || "465");
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST || "smtp.gmail.com",
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  try {
    await transporter.sendMail({
      from: SMTP_USER,
      to: CONTACT_TO_EMAIL,
      replyTo: email,
      subject: `【Gatsby Base】お問い合わせ: ${name.replace(/[\r\n]/g, " ")}`,
      text: `お名前: ${name}\nメールアドレス: ${email}\n\nメッセージ:\n${message}`,
    });
  } catch (err) {
    console.error("Failed to send contact mail", err);
    return res.status(500).json({ error: "Failed to send mail" });
  }

  return res.status(200).json({ ok: true });
}
