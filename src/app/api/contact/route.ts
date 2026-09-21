import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[character] ?? character);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const subject = typeof body.subject === "string" ? body.subject.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    // Bots commonly fill hidden fields. Return success without sending so they do not retry.
    if (body.website) return NextResponse.json({ message: "Message received" });

    if (!name || name.length > 100 || !emailPattern.test(email) || email.length > 254 || !message || message.length > 3000 || subject.length > 160) {
      return NextResponse.json({ error: "Please check the form fields" }, { status: 400 });
    }

    const user = process.env.EMAIL_USER;
    const password = process.env.EMAIL_APP_PASSWORD;
    const recipients = [process.env.EMAIL_RECIPIENT_1, process.env.EMAIL_RECIPIENT_2, "ekramjim002@gmail.com"].filter(Boolean) as string[];

    if (!user || !password) {
      console.error("Contact form email credentials are not configured");
      return NextResponse.json({ error: "Contact service is unavailable" }, { status: 503 });
    }

    const emailSubject = subject || `Portfolio message from ${name}`;
    const transporter = nodemailer.createTransport({ service: "gmail", auth: { user, pass: password } });

    await transporter.sendMail({
      from: user,
      to: recipients.join(", "),
      replyTo: email,
      subject: emailSubject,
      text: `Name: ${name}\nEmail: ${email}\nSubject: ${emailSubject}\n\n${message}`,
      html: `<h2>New portfolio message</h2><p><strong>Name:</strong> ${escapeHtml(name)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><p><strong>Subject:</strong> ${escapeHtml(emailSubject)}</p><p><strong>Message:</strong></p><p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>`,
    });

    return NextResponse.json({ message: "Message sent" });
  } catch (error) {
    console.error("Contact form error", error);
    return NextResponse.json({ error: "Message could not be sent" }, { status: 500 });
  }
}
