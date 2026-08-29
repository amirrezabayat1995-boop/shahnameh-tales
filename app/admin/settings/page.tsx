import { getSiteSetting } from "@/lib/data";
import SiteSettingForm from "@/components/admin/SiteSettingForm";

export const metadata = { title: "Site Settings | Admin" };

export default async function AdminSettingsPage() {
  const donateUrl = (await getSiteSetting("donate_url")) ?? "";

  return (
    <div className="max-w-lg">
      <h2 className="mb-6 font-[family-name:var(--font-display)] text-xl text-[var(--color-ivory)]">
        Site settings
      </h2>
      <SiteSettingForm
        settingKey="donate_url"
        label="Donation link"
        placeholder="https://..."
        initialValue={donateUrl}
      />
    </div>
  );
}
