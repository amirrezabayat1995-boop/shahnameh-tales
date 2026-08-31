import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import GlossaryTermForm from "@/components/admin/GlossaryTermForm";

export const metadata = { title: "Edit Glossary Term | Admin" };

export default async function EditGlossaryTermPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const glossaryTerm = await prisma.glossaryTerm.findUnique({ where: { id } });

  if (!glossaryTerm) {
    notFound();
  }

  return (
    <div className="max-w-2xl">
      <h2 className="mb-6 font-[family-name:var(--font-display)] text-xl text-[var(--color-ivory)]">
        Edit glossary term
      </h2>
      <GlossaryTermForm glossaryTerm={glossaryTerm} />
    </div>
  );
}
