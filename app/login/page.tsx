import AuthForm from "@/components/AuthForm";

export const metadata = { title: "Log In | Shahnameh Tales" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return <AuthForm mode="login" redirectTo={next || "/"} />;
}
