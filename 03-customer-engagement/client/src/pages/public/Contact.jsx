import { useBusinessSettings } from "../../context/BusinessSettingsContext";
import InquiryForm from "../../components/InquiryForm";
import WhatsAppButton from "../../components/WhatsAppButton";
import "../../components/WhatsAppButton.css";
import "./Contact.css";

export default function Contact() {
  const { settings, loadState } = useBusinessSettings();

  if (loadState === "loading") return <p>Loading…</p>;
  if (loadState === "error" || !settings) return <p>Something went wrong. Please try again later.</p>;

  return (
    <div className="contact-page">
      <h1>Contact Us</h1>

      <div className="contact-grid">
        <div className="contact-info">
          {settings.address && (
            <div className="contact-info__row">
              <strong>Address</strong>
              <p>{settings.address}</p>
            </div>
          )}
          {settings.workingHours && (
            <div className="contact-info__row">
              <strong>Working Hours</strong>
              <p>{settings.workingHours}</p>
            </div>
          )}
          {settings.phone && (
            <div className="contact-info__row">
              <strong>Phone</strong>
              <p><a href={`tel:${settings.phone}`}>{settings.phone}</a></p>
            </div>
          )}
          {settings.email && (
            <div className="contact-info__row">
              <strong>Email</strong>
              <p><a href={`mailto:${settings.email}`}>{settings.email}</a></p>
            </div>
          )}

          <div className="contact-info__actions">
            {settings.whatsappNumber && (
              <WhatsAppButton
                whatsappNumber={settings.whatsappNumber}
                message={`Hi ${settings.businessName || ""}, I have a question.`}
              />
            )}
            {settings.mapUrl && (
              <a href={settings.mapUrl} target="_blank" rel="noopener noreferrer" className="contact-map-link">
                View on Map
              </a>
            )}
          </div>

          {settings.mapUrl && (
            <div className="contact-map-embed">
              <iframe
                title="Business location"
                src={settings.mapUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          )}
        </div>

        <div>
          <h2>Send a Message</h2>
          <InquiryForm />
        </div>
      </div>
    </div>
  );
}
