import ContactForm from "@/components/ContactForm";

export const metadata = { title: "Contact | Shahnameh Tales" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-xl px-6 py-20">
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold italic text-[var(--color-ivory)]">
        Contact us
      </h1>
      <p className="mt-3 mb-10 font-[family-name:var(--font-body)] text-[var(--color-ivory)]/70">
        Questions, corrections, or just want to say hello? Send a message
        below.
      </p>
      <ContactForm />
    </div>
  );
}
