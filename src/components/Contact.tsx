import React, { useState } from "react";

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (key: string, opts: { action: string }) => Promise<string>;
    };
  }
}

const SITE_KEY = process.env.GATSBY_RECAPTCHA_SITE_KEY;

type Status = "idle" | "sending" | "success" | "error";

const getToken = (): Promise<string | undefined> => {
  if (!SITE_KEY) return Promise.resolve(undefined);
  return new Promise((resolve) => {
    const load = () =>
      window.grecaptcha!.ready(() =>
        window
          .grecaptcha!.execute(SITE_KEY, { action: "submit" })
          .then(resolve)
          .catch(() => resolve(undefined))
      );
    if (window.grecaptcha) return load();
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
    script.onload = load;
    script.onerror = () => resolve(undefined);
    document.head.appendChild(script);
  });
};

function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const values = {
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      message: String(data.get("message") ?? "").trim(),
    };

    const next: Record<string, string> = {};
    if (!values.name) next.name = "Name is required";
    if (!values.email) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
      next.email = "Email is invalid";
    if (!values.message) next.message = "Message is required";
    setErrors(next);
    if (Object.keys(next).length) return;

    setStatus("sending");
    try {
      const googleReCaptchaToken = await getToken();
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, googleReCaptchaToken }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="contact" id="a04">
      <div className="container">
        <h1 data-reveal>Contact</h1>
        <p className="contact-read" data-reveal>
          Have a project in mind, or just want to say hello? <br />Send me a message and I'll get back to you within a few days.
        </p>

        <form className="form-box" onSubmit={handleSubmit} noValidate data-reveal>
          <div className="form-item">
            <div className="field">
              <label htmlFor="name" className="sr-only">Name</label>
              <input id="name" name="name" placeholder="Name" autoComplete="name" />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>
            <div className="field">
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Email"
                autoComplete="email"
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>
            <div className="field">
              <label htmlFor="message" className="sr-only">Message</label>
              <textarea id="message" name="message" placeholder="Message"></textarea>
              {errors.message && <span className="field-error">{errors.message}</span>}
            </div>
            <button type="submit" disabled={status === "sending"}>
              {status === "sending" ? "Sending..." : "Submit"}
            </button>
            <p className="form-status" role="status" aria-live="polite">
              {status === "success" && "Thank you! Your message has been sent."}
              {status === "error" && "Sorry, something went wrong. Please try again."}
            </p>
          </div>
        </form>
        {SITE_KEY && (
          <p className="recaptcha">
            This site is protected by reCAPTCHA and the Google{" "}
            <a href="https://policies.google.com/privacy">Privacy Policy</a> and{" "}
            <a href="https://policies.google.com/terms">Terms of Service</a> apply.
          </p>
        )}

        <div className="bnr-box" data-stagger>
          <a className="stagger-item" href="https://nextbase-gsap.vercel.app/" target="_blank" rel="noreferrer">
            Next Base
            <i className="material-icons" aria-hidden="true">north_east</i>
          </a>
          <a className="stagger-item" href="https://nuxtbase-gsap.vercel.app/" target="_blank" rel="noreferrer">
            Nuxt Base
            <i className="material-icons" aria-hidden="true">north_east</i>
          </a>
          <a className="stagger-item" href="https://astrobase.vercel.app/" target="_blank" rel="noreferrer">
            Astro Base
            <i className="material-icons" aria-hidden="true">north_east</i>
          </a>
        </div>

        <p className="contact-read">Explore the sibling projects above, built with the same stack in different frameworks.</p>
        <div className="contact-logo" aria-hidden="true">GATSBY BASE</div>
      </div>
    </section>
  );
}

export default Contact;
