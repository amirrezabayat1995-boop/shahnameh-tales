import StoryForm from "@/components/admin/StoryForm";

export const metadata = { title: "New Story | Admin" };

export default function NewStoryPage() {
  return (
    <div className="max-w-2xl">
      <h2 className="mb-6 font-[family-name:var(--font-display)] text-xl text-[var(--color-ivory)]">
        New story
      </h2>
      <StoryForm />
    </div>
  );
}
