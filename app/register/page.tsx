import AuthForm from "@/components/AuthForm";

export const metadata = { title: "Join | Shahnameh Tales" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return <AuthForm mode="register" redirectTo={next || "/"} />;
}
