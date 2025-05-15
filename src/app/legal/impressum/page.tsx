"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function Impressum() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white">
      {/* Same background decorations as in main page */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px]"></div>
        <div className="absolute top-[20%] left-[-20%] w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[80px] md:hidden"></div>
        <div className="absolute bottom-[30%] right-[-10%] w-[250px] h-[250px] bg-indigo-500/5 rounded-full blur-[80px] md:hidden"></div>
      </div>

      <Navbar />

      <div className="pt-24 md:pt-32 pb-16 px-4 sm:px-6 md:px-8">
        <div className="max-w-4xl mx-auto space-y-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            {t("legal.impressum.title", "Impressum")}
          </h1>

          <div className="space-y-3">
            <p className="text-lg text-gray-700">Ines Goetschel</p>
            <p className="text-lg text-gray-700">Sammlungsgasse 5</p>
            <p className="text-lg text-gray-700">89073 Ulm</p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-gray-800">
              {t("legal.impressum.contact", "Kontakt")}
            </h2>
            <p className="text-lg text-gray-700">Telefon: +49 17657562254</p>
            <p className="text-lg text-gray-700">
              E-Mail: support@exposeflow.ai
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-gray-800">
              {t(
                "legal.impressum.disputeResolution",
                "Verbraucherstreitbeilegung",
              )}
            </h2>
            <p className="text-lg text-gray-700">
              {t(
                "legal.impressum.disputeResolutionText",
                "Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.",
              )}
            </p>
          </div>

          <div className="pt-6">
            <Link href="/">
              <button className="text-[#5169FE] hover:text-[#4058e0] font-medium flex items-center transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 mr-2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                  />
                </svg>
                {t("legal.backToHome", "Zurück zur Startseite")}
              </button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
