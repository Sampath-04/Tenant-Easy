import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tenant Payment - Easy Tenant",
  description: "Submit your rent payment and view payment details",
};

export default function TenantPaymentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
