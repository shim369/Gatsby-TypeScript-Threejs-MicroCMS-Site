import { useActionState, useEffect, useRef, useState, type FocusEvent } from "react";
import { sisters } from "../data/site";
import { ArrowRight } from "./Icons";
import { delay } from "../utils/style";

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (key: string, opts: { action: string }) => Promise<string>;
    };
  }
}

const SITE_KEY = process.env.GATSBY_RECAPTCHA_SITE_KEY;

const fields = ["name", "email", "message"] as const;
type Field = (typeof fields)[number];
type Values = Record<Field, string>;
type Errors = Partial<Record<Field, string>>;
type State = { status: "idle" | "invalid" | "success" | "error"; values: Values; errors: Errors };

const empty: Values = { name: "", email: "", message: "" };

const rules: Record<Field, (v: string) => string> = {
  name: (v) => (v ? "" : "Please enter your name"),
  email: (v) =>
    !v ? "Please enter your email" : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "Please enter a valid email",
  message: (v) => (v ? "" : "Please enter a message"),
};

// Loads reCAPTCHA v3 on first submit only, so it costs nothing until used.
const getToken = (): Promise<string | undefined> => {
  if (!SITE_KEY) return Promise.resolve(undefined);
  return new Promise((resolve) => {
    const run = () =>
      window.grecaptcha!.ready(() =>
        window.grecaptcha!.execute(SITE_KEY, { action: "submit" }).then(resolve, () => resolve(undefined)),
      );
    if (window.grecaptcha) return run();
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
    script.onload = run;
    script.onerror = () => resolve(undefined);
    document.head.append(script);
  });
};

async function send(_: State, formData: FormData): Promise<State> {
  const values = Object.fromEntries(fields.map((f) => [f, String(formData.get(f) ?? "").trim()])) as Values;
  const errors: Errors = {};
  for (const f of fields) {
    const msg = rules[f](values[f]);
    if (msg) errors[f] = msg;
  }
  if (Object.keys(errors).length) return { status: "invalid", values, errors };

  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, googleReCaptchaToken: await getToken() }),
    });
    if (!res.ok) throw new Error(String(res.status));
    return { status: "success", values: empty, errors: {} };
  } catch {
    return { status: "error", values, errors: {} };
  }
}

const messages: Partial<Record<State["status"], string>> = {
  success: "Thank you! Your message has been sent.",
  error: "Sorry, something went wrong. Please try again.",
};

export default function Contact() {
  // Returning the submitted values keeps them in the fields after React resets the form.
  const [state, formAction, pending] = useActionState(send, { status: "idle", values: empty, errors: {} });
  const [blurErrors, setBlurErrors] = useState<Errors>({});
  const form = useRef<HTMLFormElement>(null);
  const errors = { ...state.errors, ...blurErrors };

  useEffect(() => {
    setBlurErrors({});
    if (state.status !== "invalid") return;
    const first = fields.find((f) => state.errors[f]);
    if (first) form.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  }, [state]);

  const check = (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const name = e.target.name as Field;
    setBlurErrors((prev) => ({ ...prev, [name]: rules[name](e.target.value.trim()) }));
  };

  const control = (name: Field) => ({
    id: name,
    name,
    placeholder: " ",
    defaultValue: state.values[name],
    onBlur: check,
    "aria-invalid": Boolean(errors[name]) || undefined,
    "aria-describedby": `err-${name}`,
  });

  return (
    <section className="section contact" id="contact" data-state="contact">
      <div className="wrap">
        <h2 className="reveal">Say hello.</h2>
        <p className="contact__lead reveal" style={delay(0.1)}>
          Have a project in mind, or a question about an article? Send a message and I'll get back to you
          within a few days.
        </p>

        <form
          ref={form}
          className="form reveal"
          action={formAction}
          noValidate
          style={delay(0.15)}
        >
          <div className="field">
            <input {...control("name")} autoComplete="name" />
            <label htmlFor="name">Name</label>
            <span className="field__err" id="err-name">{errors.name}</span>
          </div>
          <div className="field">
            <input {...control("email")} type="email" autoComplete="email" />
            <label htmlFor="email">Email</label>
            <span className="field__err" id="err-email">{errors.email}</span>
          </div>
          <div className="field">
            <textarea {...control("message")} />
            <label htmlFor="message">Message</label>
            <span className="field__err" id="err-message">{errors.message}</span>
          </div>
          <div className="form__foot">
            {SITE_KEY ? (
              <p className="form__note">
                Protected by reCAPTCHA. The Google <a href="https://policies.google.com/privacy">Privacy Policy</a>{" "}
                and <a href="https://policies.google.com/terms">Terms of Service</a> apply.
              </p>
            ) : (
              <span />
            )}
            <button className="btn btn--solid" type="submit" disabled={pending}>
              {pending ? "Sending…" : "Send message"} <ArrowRight />
            </button>
          </div>
          <p className="form__status" role="status" aria-live="polite">
            {messages[state.status]}
          </p>
        </form>

        <div className="sisters reveal">
          <p>Sister sites, built with the same content</p>
          <ul>
            {sisters.map((s) => (
              <li key={s.url}>
                <a className="pill" href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.name}
                  <span className="sr"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
