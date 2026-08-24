// Builds a WhatsApp deep link: wa.me/<number>?text=<prefilled message>
// Opening this link starts a chat with the message already typed in.
export default function WhatsAppButton({ whatsappNumber, message, label = "Chat on WhatsApp" }) {
  if (!whatsappNumber) return null;

  // wa.me requires digits only (no +, spaces, or dashes)
  const cleanNumber = whatsappNumber.replace(/[^\d]/g, "");
  const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="whatsapp-button">
      {label}
    </a>
  );
}
