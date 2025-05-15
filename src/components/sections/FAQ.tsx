"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function FAQ() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const { t } = useTranslation();

  // Add event listener to open the first FAQ when triggered from navbar
  useEffect(() => {
    const handleOpenFirstFaq = () => {
      setOpenFaqIndex(0); // Open first FAQ item
    };

    // Listen for the custom event from the Navbar component
    document.addEventListener("openFirstFaq", handleOpenFirstFaq);

    // Cleanup
    return () => {
      document.removeEventListener("openFirstFaq", handleOpenFirstFaq);
    };
  }, []);

  // FAQ data with reordered questions
  const faqs = [
    {
      question: t(
        "faq.items.pricing.question",
        "How much does ExposeFlow cost?",
      ),
      answer: t(
        "faq.items.pricing.answer",
        "ExposeFlow offers flexible pricing plans starting at $XX/month for our Basic plan, which includes up to 10 brochures per month. Our Professional plan at $XX/month offers unlimited brochures and premium templates. Enterprise pricing is available for teams and agencies.",
      ),
    },
    {
      question: t(
        "faq.items.branding.question",
        "Can I add my brokerage's branding to the brochures?",
      ),
      answer: t(
        "faq.items.branding.answer",
        "Yes! ExposeFlow allows you to add your logo, custom colors, contact information, and other branding elements to ensure all your marketing materials are consistent with your brand identity.",
      ),
    },
    {
      question: t(
        "faq.items.customize.question",
        "Can I customize the generated content?",
      ),
      answer: t(
        "faq.items.customize.answer",
        "Yes, absolutely! While our AI generates high-quality content automatically, you can edit any text, change images, adjust layouts, and customize colors to match your brand. You have complete control over the final output.",
      ),
    },
    {
      question: t(
        "faq.items.formats.question",
        "What formats can I download my brochures in?",
      ),
      answer: t(
        "faq.items.formats.answer",
        "You can download your brochures as high-resolution PDFs ready for printing, web-optimized PDFs for digital sharing, or as image files (JPEG/PNG) for use in social media and other online platforms.",
      ),
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <section id="faq" className="my-20 px-4 bg-white">
      <h2 className="text-4xl font-bold text-center mb-12 text-[#171717]">
        {t("faq.title")}
      </h2>
      <div className="max-w-4xl mx-auto space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            style={{
              backgroundColor: openFaqIndex === index ? "#EDF0FF" : "#F8F8FC",
            }}
            className="rounded-lg overflow-hidden transition-all duration-200 group"
          >
            <div
              onClick={() => toggleFAQ(index)}
              className="p-6 cursor-pointer flex justify-between items-center"
            >
              <h3
                className={`text-lg transition-colors ${
                  openFaqIndex === index
                    ? "text-[#171717]"
                    : "text-[#171717] group-hover:text-[#5169FE]"
                }`}
              >
                {faq.question}
              </h3>
              <button
                className={`text-2xl transition-colors ${
                  openFaqIndex === index
                    ? "text-[#171717]"
                    : "text-[#171717] group-hover:text-[#5169FE]"
                }`}
              >
                {openFaqIndex === index ? "×" : "+"}
              </button>
            </div>
            {openFaqIndex === index && (
              <div className="px-6 pb-6 text-gray-600">{faq.answer}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
