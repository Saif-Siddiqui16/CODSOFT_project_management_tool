import formData from "form-data";
import Mailgun from "mailgun.js";
import dotenv from "dotenv";

dotenv.config();

// Initialize Mailgun client
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY, // from .env or Render env vars
  url: "https://api.mailgun.net",
});

// Keep the same sendMail signature
const sendMail = async ({ to, subject, html }) => {
  try {
    const result = await mg.messages.create(process.env.MAILGUN_DOMAIN, {
      from: process.env.MAILGUN_FROM,
      to,
      subject,
      html,
    });
    return { ok: true, info: result };
  } catch (error) {
    console.error("Mailgun Error:", error);
    return { ok: false, error };
  }
};

export default sendMail;
