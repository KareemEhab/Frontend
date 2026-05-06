import { Link, useNavigate } from "react-router-dom";
import logoUrl from "../assets/logo.png";
import cartIcon from "../assets/cart.svg";
import { useCart } from "../cart/CartContext";
import { Button } from "./Button";
import { clearAuthToken, getAuthToken } from "../auth/token";

export function AppNav() {
  const navigate = useNavigate();
  const loggedIn = Boolean(getAuthToken());
  const { itemCount } = useCart();

  return (
    <header className="border-b border-solid border-[#E2E8F0] bg-transparent px-[0.875rem] py-[1.875rem]">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link
          to="/"
          className="inline-flex shrink-0 items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00B8FF] focus-visible:ring-offset-2"
        >
          <img
            src={logoUrl}
            alt="Workshop"
            className="block h-8 w-auto max-h-10 object-contain sm:h-9"
          />
        </Link>

        <div className="flex flex-wrap items-center justify-end gap-6 sm:gap-10 md:gap-[5rem]">
          <Link
            to="/cart"
            aria-label="Shopping cart"
            className="relative inline-flex shrink-0 items-center justify-center rounded-none outline-none focus-visible:ring-2 focus-visible:ring-[#00B8FF] focus-visible:ring-offset-2"
          >
            <img
              src={cartIcon}
              alt=""
              width={15}
              height={18}
              className="block"
            />
            {itemCount > 0 ? (
              <span className="absolute -top-[0.375rem] -right-[0.375rem] flex h-[0.875rem] min-w-[0.875rem] items-center justify-center rounded-full bg-[#FD6F00] px-[0.125rem] font-sans text-[0.5625rem] font-normal leading-[100%] text-white">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            ) : null}
          </Link>

          <div className="flex shrink-0 items-center gap-3">
            {loggedIn ? (
              <Button
                variant="navLogin"
                type="button"
                onClick={() => {
                  clearAuthToken();
                  navigate("/", { replace: true });
                }}
              >
                Sign out
              </Button>
            ) : (
              <>
                <Button variant="navLogin" to="/login">
                  Login
                </Button>
                <Button variant="navSignUp" to="/register">
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
