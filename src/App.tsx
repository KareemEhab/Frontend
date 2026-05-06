import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { CartProvider } from "./cart/CartContext";
import { RootLayout } from "./layouts/RootLayout";
import { CartPage } from "./pages/CartPage";
import { GalleryPage } from "./pages/GalleryPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { CourseDetailPage } from "./pages/CourseDetailPage";

function FooterLinkPage({ title }: { title: string }) {
  return (
    <div className="mx-auto max-w-[40rem] px-[1rem] py-[3rem] font-sans">
      <h1 className="text-[1.5rem] font-semibold text-[#0F172A]">{title}</h1>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <CartProvider>
      <Routes>
        <Route element={<RootLayout />}>
          <Route index element={<HomePage />} />
          <Route path="courses/:id" element={<CourseDetailPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="gallery" element={<GalleryPage />} />
          <Route path="contact" element={<FooterLinkPage title="Contact Us" />} />
          <Route path="articles" element={<FooterLinkPage title="Latest Articles" />} />
          <Route path="faq" element={<FooterLinkPage title="FAQ" />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}
