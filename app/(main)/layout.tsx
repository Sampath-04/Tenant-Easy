import { AuthProvider } from "../../contexts/AuthContext";
import { PropertyProvider } from "../../contexts/PropertyContext";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <PropertyProvider>
        {children}
      </PropertyProvider>
    </AuthProvider>
  );
}
