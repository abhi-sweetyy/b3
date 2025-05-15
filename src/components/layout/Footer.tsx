"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useState } from "react";

export default function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  // Function to scroll to sections
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Handle newsletter subscription
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // This would normally connect to a backend service
    console.log(`Subscribed with email: ${email}`);
    setSubscribed(true);
    setEmail("");

    // Reset subscription confirmation after 5 seconds
    setTimeout(() => {
      setSubscribed(false);
    }, 5000);
  };

  return (
    <footer className="w-full bg-gradient-to-b from-white to-blue-50/50 pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Logo and menus in a single row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Logo and Company Description */}
          <div className="md:col-span-1">
            <div className="flex items-center mb-4">
              <img
                src="/favicon.png"
                alt="ExposeFlow Logo"
                className="h-10 w-auto mr-3"
              />
              <span className="text-[#5169FE] font-bold text-2xl">
                ExposeFlow
              </span>
            </div>
            <p className="text-gray-600 text-sm max-w-xs">
              {t(
                "footer.companyDesc",
                "AI-powered brochure generation platform for real estate professionals.",
              )}
            </p>
            <div className="flex mt-4 space-x-4">
              {/* Facebook Icon */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#5169FE] transition-colors"
                aria-label="Facebook"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>

              {/* YouTube Icon */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#5169FE] transition-colors"
                aria-label="YouTube"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>

              {/* LinkedIn Icon */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#5169FE] transition-colors"
                aria-label="LinkedIn"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div className="md:col-span-1">
            <h3 className="font-semibold text-gray-800 mb-4">
              {t("footer.product", "Product")}
            </h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => scrollToSection("features")}
                  className="text-gray-600 hover:text-[#5169FE] transition-colors text-sm text-left"
                >
                  {t("footer.features", "Features")}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("faq")}
                  className="text-gray-600 hover:text-[#5169FE] transition-colors text-sm text-left"
                >
                  {t("footer.pricing", "Pricing")}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("features")}
                  className="text-gray-600 hover:text-[#5169FE] transition-colors text-sm text-left"
                >
                  {t("footer.howItWorks", "How it Works")}
                </button>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="md:col-span-1">
            <h3 className="font-semibold text-gray-800 mb-4">
              {t("footer.company", "Company")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-gray-600 hover:text-[#5169FE] transition-colors text-sm"
                >
                  {t("footer.about", "About")}
                </Link>
              </li>
              <li>
                <a
                  href="mailto:info@exposeflow.ai"
                  className="text-gray-600 hover:text-[#5169FE] transition-colors text-sm"
                >
                  {t("footer.contact", "Contact")}
                </a>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("faq")}
                  className="text-gray-600 hover:text-[#5169FE] transition-colors text-sm text-left"
                >
                  {t("footer.faq", "FAQ")}
                </button>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="md:col-span-1">
            <h3 className="font-semibold text-gray-800 mb-4">
              {t("footer.legal", "Legal")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/legal/impressum"
                  className="text-gray-600 hover:text-[#5169FE] transition-colors text-sm"
                >
                  {t("footer.imprint", "Imprint")}
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/terms"
                  className="text-gray-600 hover:text-[#5169FE] transition-colors text-sm"
                >
                  {t("footer.termsOfService", "Terms of Service")}
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/privacy"
                  className="text-gray-600 hover:text-[#5169FE] transition-colors text-sm"
                >
                  {t("footer.privacyPolicy", "Privacy Policy")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section with copyright */}
        <div className="border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-600 text-center">
            {t("footer.copyright", "© {{year}} ExposeFlow", {
              year: currentYear,
            })}
          </p>
        </div>
      </div>
    </footer>
  );
}
