import GlossaryTermForm from "@/components/admin/GlossaryTermForm";

export const metadata = { title: "New Glossary Term | Admin" };

export default function NewGlossaryTermPage() {
  return (
    <div className="max-w-2xl">
      <h2 className="mb-6 font-[family-name:var(--font-display)] text-xl text-[var(--color-ivory)]">
        New glossary term
      </h2>
      <GlossaryTermForm />
    </div>
  );
}
