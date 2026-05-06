import { Link } from "react-router-dom";
import logoFooter from "../assets/logo-footer.png";
import facebookIcon from "../assets/facebook.svg";
import twitterIcon from "../assets/twitter.svg";
import googleIcon from "../assets/google.svg";
import githubIcon from "../assets/github.svg";

const helpLinks = [
  { to: "/contact", label: "Contact Us" },
  { to: "/articles", label: "Latest Articles" },
  { to: "/faq", label: "FAQ" },
] as const;

const linkClass =
  "cursor-pointer font-sans text-[0.875rem] font-medium leading-[160%] text-[#CBD5E1] transition-colors duration-200 hover:text-[#F8FAFC]";

const columnHeadingClass =
  "font-sans text-[1.125rem] font-semibold leading-[150%] text-[#F1F5F9]";

export function SiteFooter() {
  return (
    <footer className="bg-[#1E293B] px-[2.6875rem] py-[6.875rem] font-sans">
      <div className="mx-auto flex w-full max-w-[90rem] flex-col items-start gap-[2rem] lg:flex-row lg:flex-nowrap lg:items-start lg:justify-center lg:gap-0">
        <Link
          to="/"
          className="inline-flex shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00B8FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1E293B]"
        >
          <img src={logoFooter} alt="Link Development" className="block h-auto max-h-[5.5rem] w-auto object-contain" />
        </Link>

        <div className="w-full max-w-[26rem] shrink-0 text-left lg:ml-[4.6875rem]">
          <p className="font-sans text-[0.875rem] font-normal leading-[150%] text-[#CBD5E1]">
            Empowering learners through accessible and engaging online education.
          </p>
          <p className="mt-[0.5rem] font-sans text-[0.875rem] font-normal leading-[150%] text-[#CBD5E1]">
            Byway is a leading online learning platform dedicated to providing high-quality, flexible, and affordable
            educational experiences.
          </p>
        </div>

        <div className="flex w-full flex-col items-start gap-[2.5rem] sm:flex-row sm:items-start sm:gap-[3rem] lg:ml-[11.0625rem] lg:w-auto lg:shrink-0 lg:gap-[4.5rem]">
          <nav className="flex min-w-0 flex-col items-start gap-[0.5rem]" aria-label="Get help">
            <h2 className={columnHeadingClass}>Get Help</h2>
            {helpLinks.map(({ to, label }) => (
              <Link key={to} to={to} className={linkClass}>
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex min-w-0 flex-col items-start gap-[0.5rem]">
            <h2 className={columnHeadingClass}>Contact Us</h2>
            <p className="font-sans text-[0.875rem] font-medium leading-[160%] text-[#CBD5E1]">
              123 Main Street, Anytown, CA 12345
            </p>
            <p className="font-sans text-[0.875rem] font-medium leading-[160%] text-[#CBD5E1]">Tel: +(123) 456-7890</p>
            <p className="font-sans text-[0.875rem] font-medium leading-[160%] text-[#CBD5E1]">Mail: bywayedu@webkul.in</p>

            <div className="mt-[0.5rem] flex flex-wrap items-center justify-start gap-[0.5rem]">
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-[2.5rem] w-[2.5rem] shrink-0 items-center justify-center rounded-full bg-[#1877F2] transition-opacity hover:opacity-90"
                aria-label="Facebook"
              >
                <img src={facebookIcon} alt="" width={30} height={30} className="h-[1.875rem] w-[1.875rem] object-contain" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-[2.5rem] w-[2.5rem] shrink-0 items-center justify-center rounded-full bg-black transition-opacity hover:opacity-90"
                aria-label="X (Twitter)"
              >
                <img src={twitterIcon} alt="" width={22} height={22} className="h-[1.375rem] w-[1.375rem] object-contain" />
              </a>
              <a
                href="https://www.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-[2.5rem] w-[2.5rem] shrink-0 items-center justify-center rounded-full bg-white transition-opacity hover:opacity-90"
                aria-label="Google"
              >
                <img src={googleIcon} alt="" width={26} height={26} className="h-[1.625rem] w-[1.625rem] object-contain" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-[2.5rem] w-[2.5rem] shrink-0 items-center justify-center rounded-full bg-black transition-opacity hover:opacity-90"
                aria-label="GitHub"
              >
                <img src={githubIcon} alt="" width={26} height={26} className="h-[1.625rem] w-[1.625rem] object-contain" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
