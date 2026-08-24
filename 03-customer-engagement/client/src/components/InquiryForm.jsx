import { useState } from "react";
import axiosClient from "../api/axiosClient";
import "./InquiryForm.css";

export default function InquiryForm({ itemId = null, itemName = null }) {
  const [form, setForm] = useState({ customerName: "", phone: "", email: "", subject: "", message: "" });
  const [website, setWebsite] = useState(""); // honeypot field — real users never see or fill this
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [errorMessage, setErrorMessage] = useState("");

  function handleChange(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      await axiosClient.post("/public/inquiries", { ...form, itemId, website });
      setStatus("success");
      setForm({ customerName: "", phone: "", email: "", subject: "", message: "" });
    } catch (err) {
      setStatus("error");
      setErrorMessage(err.response?.data?.message || "Something went wrong. Please try again later.");
    }
  }

  if (status === "success") {
    return (
      <div className="inquiry-form__success">
        Thank you — your message has been sent. We'll get back to you soon.
      </div>
    );
  }

  return (
    <form className="inquiry-form" onSubmit={handleSubmit}>
      {itemName && <p className="inquiry-form__context">Regarding: <strong>{itemName}</strong></p>}

      {status === "error" && <div className="inquiry-form__error">{errorMessage}</div>}

      <label htmlFor="customerName">Name</label>
      <input id="customerName" value={form.customerName} onChange={handleChange("customerName")} required />

      <div className="inquiry-form__row">
        <div>
          <label htmlFor="phone">Phone</label>
          <input id="phone" value={form.phone} onChange={handleChange("phone")} />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={form.email} onChange={handleChange("email")} />
        </div>
      </div>
      <p className="inquiry-form__hint">Provide at least a phone number or an email so we can reply.</p>

      {!itemName && (
        <>
          <label htmlFor="subject">Subject</label>
          <input id="subject" value={form.subject} onChange={handleChange("subject")} />
        </>
      )}

      <label htmlFor="message">Message</label>
      <textarea id="message" value={form.message} onChange={handleChange("message")} rows={4} required />

      {/* Honeypot: hidden from real visitors via CSS, but bots that auto-fill every
          field will fill this one in too, revealing themselves. */}
      <div className="inquiry-form__honeypot" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <button type="submit" disabled={status === "submitting"}>
        {status === "submitting" ? "Sending…" : "Send Inquiry"}
      </button>
    </form>
  );
}
