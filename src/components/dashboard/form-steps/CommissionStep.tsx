//INES Löschen

"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { PropertyPlaceholders } from "@/types/placeholders";

interface CommissionStepProps {
  placeholders: PropertyPlaceholders;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
}

const CommissionStep: React.FC<CommissionStepProps> = ({
  placeholders,
  handleInputChange,
}) => {
  const { t } = useTranslation();

  const commonInputClass =
    "w-full rounded-md px-3 py-2 text-[#171717] bg-white border border-gray-300 focus:ring-2 focus:ring-[#5169FE] focus:border-transparent";
  const commonLabelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="space-y-6 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-[#171717] text-lg font-medium mb-2">
        {t("commission.title")}
      </h3>
      <p className="text-gray-600 mb-4">{t("commission.enterInfo")}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Buyer Commission */}
        <div>
          <label className={commonLabelClass}>{t("commission.buyer")}</label>
          <input
            type="text"
            name="buyer_commission"
            value={placeholders.buyer_commission || ""}
            onChange={handleInputChange}
            className={commonInputClass}
            placeholder={t("commission.enterBuyer")}
          />
        </div>

        {/* Seller Commission */}
        <div>
          <label className={commonLabelClass}>{t("commission.seller")}</label>
          <input
            type="text"
            name="seller_commission"
            value={placeholders.seller_commission || ""}
            onChange={handleInputChange}
            className={commonInputClass}
            placeholder={t("commission.enterSeller")}
          />
        </div>
      </div>
    </div>
  );
};

export default CommissionStep;
