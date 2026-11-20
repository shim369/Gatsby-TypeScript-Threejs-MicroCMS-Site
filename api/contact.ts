import nodemailer from "nodemailer";

type ContactBody = {
  name?: string;
  email?: string;
  message?: string;
  googleReCaptchaToken?: string;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const verifyRecaptcha = async (secret: string, token: string) => {
  const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    body: new URLSearchParams({ secret, response: token }),
  });
  const result: { success: boolean; score?: number; action?: string } = await res.json();
  const ok = result.success && result.action === "submit" && (result.score ?? 0) >= 0.5;
  if (!ok) console.warn(`reCAPTCHA verification failed: ${JSON.stringify(result)}`);
  return ok;
};

const error = (status: number, message: string) =>
  Response.json({ error: message }, { status });

// Vercel Function using the Web standard Request / Response API.
// Other HTTP methods get 405 automatically.
export async function POST(request: Request) {
  const body: ContactBody = await request.json().catch(() => ({}));
  const name = body.name?.trim();
  const email = body.email?.trim();
  const message = body.message?.trim();

  if (!name || !email || !message) return error(400, "Missing required fields");
  if (!EMAIL.test(email)) return error(400, "Invalid email");

  const { RECAPTCHA_SECRET_KEY, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_TO_EMAIL } =
    process.env;

  if (!SMTP_USER || !SMTP_PASS || !CONTACT_TO_EMAIL) {
    const missing = ["SMTP_USER", "SMTP_PASS", "CONTACT_TO_EMAIL"].filter((k) => !process.env[k]);
    console.error(`Missing env: ${missing.join(", ")}`);
    return error(500, "Mail is not configured");
  }

  if (RECAPTCHA_SECRET_KEY) {
    const token = body.googleReCaptchaToken;
    if (!token || !(await verifyRecaptcha(RECAPTCHA_SECRET_KEY, token))) {
      return error(403, "reCAPTCHA verification failed");
    }
  }

  const port = Number(SMTP_PORT || 465);
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
    return error(500, "Failed to send mail");
  }

  return Response.json({ ok: true });
}
