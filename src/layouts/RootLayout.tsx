import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import { AppNav } from "../components/AppNav";
import { SiteFooter } from "../components/SiteFooter";

export function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col font-sans">
      <Toaster position="top-center" richColors />
      <AppNav />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
