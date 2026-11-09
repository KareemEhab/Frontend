import { Link } from "react-router-dom";
import breadcrumbArrowWhite from "../../assets/breadcrumb-arrow-white.svg";

const crumbClass =
  "font-sans text-[0.875rem] font-normal leading-[150%] text-[#334155] transition-colors hover:text-[#0F172A] hover:underline";

export function CheckoutHeader() {
  return (
    <div className="flex flex-wrap items-center gap-6.25">
      <h1 className="font-sans text-[1.5rem] font-semibold leading-[140%] text-[#0F172A]">Checkout Page</h1>
      <nav className="flex flex-wrap items-center gap-2" aria-label="Breadcrumb">
        <Link to="/" className={crumbClass}>
          Details
        </Link>
        <img src={breadcrumbArrowWhite} alt="" width={24} height={24} className="h-2.5 w-auto shrink-0" />
        <Link to="/cart" className={crumbClass}>
          Shopping Cart
        </Link>
        <img src={breadcrumbArrowWhite} alt="" width={24} height={24} className="h-2.5 w-auto shrink-0" />
        <span className="font-sans text-[0.875rem] font-normal leading-[150%] text-[#2563EB]" aria-current="page">
          Checkout
        </span>
      </nav>
    </div>
  );
}

