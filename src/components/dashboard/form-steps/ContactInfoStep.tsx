"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { PropertyPlaceholders } from "@/types/placeholders";

interface ContactInfoStepProps {
  placeholders: PropertyPlaceholders;
  handleInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
  autoFilledFields: string[];
}

const ContactInfoStep: React.FC<ContactInfoStepProps> = ({
  placeholders,
  handleInputChange,
  autoFilledFields,
}) => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-[#171717] text-lg font-medium mb-4">
          {t('contactInfo.title')}
        </h3>
        <p className="text-gray-600 mb-4">
          {t('contactInfo.enterInfo')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              {t('contactInfo.phoneNumber')}
              {autoFilledFields.includes("phone_number") && (
                <span className="ml-2 text-xs bg-[#5169FE]/10 text-[#5169FE] px-2 py-0.5 rounded">
                  AI Filled
                </span>
              )}
            </label>
            <input
              type="text"
              name="phone_number"
              value={placeholders.phone_number || ""}
              onChange={handleInputChange}
              className={`w-full rounded-md px-3 py-2 text-[#171717] ${
                autoFilledFields.includes("phone_number")
                  ? "bg-[#5169FE]/5 border border-[#5169FE]/30"
                  : "bg-white border border-gray-300"
              } focus:ring-2 focus:ring-[#5169FE] focus:border-transparent`}
              placeholder={t('contactInfo.enterPhoneNumber')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              {t('contactInfo.emailAddress')}
              {autoFilledFields.includes("email_address") && (
                <span className="ml-2 text-xs bg-[#5169FE]/10 text-[#5169FE] px-2 py-0.5 rounded">
                  AI Filled
                </span>
              )}
            </label>
            <input
              type="email"
              name="email_address"
              value={placeholders.email_address || ""}
              onChange={handleInputChange}
              className={`w-full rounded-md px-3 py-2 text-[#171717] ${
                autoFilledFields.includes("email_address")
                  ? "bg-[#5169FE]/5 border border-[#5169FE]/30"
                  : "bg-white border border-gray-300"
              } focus:ring-2 focus:ring-[#5169FE] focus:border-transparent`}
              placeholder={t('contactInfo.enterEmailAddress')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              {t('contactInfo.websiteName')}
              {autoFilledFields.includes("website_name") && (
                <span className="ml-2 text-xs bg-[#5169FE]/10 text-[#5169FE] px-2 py-0.5 rounded">
                  AI Filled
                </span>
              )}
            </label>
            <input
              type="text"
              name="website_name"
              value={placeholders.website_name || ""}
              onChange={handleInputChange}
              className={`w-full rounded-md px-3 py-2 text-[#171717] ${
                autoFilledFields.includes("website_name")
                  ? "bg-[#5169FE]/5 border border-[#5169FE]/30"
                  : "bg-white border border-gray-300"
              } focus:ring-2 focus:ring-[#5169FE] focus:border-transparent`}
              placeholder={t('contactInfo.enterWebsiteName')}
            />
          </div>
        </div>

        <h4 className="text-[#171717] text-md font-medium mb-3">
          {t('contactInfo.brokerInfo')}
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              {t('contactInfo.brokerName')}
              {autoFilledFields.includes("broker_name") && (
                <span className="ml-2 text-xs bg-[#5169FE]/10 text-[#5169FE] px-2 py-0.5 rounded">
                  AI Filled
                </span>
              )}
            </label>
            <input
              type="text"
              name="broker_name"
              value={placeholders.broker_name || ""}
              onChange={handleInputChange}
              className={`w-full rounded-md px-3 py-2 text-[#171717] ${
                autoFilledFields.includes("broker_name")
                  ? "bg-[#5169FE]/5 border border-[#5169FE]/30"
                  : "bg-white border border-gray-300"
              } focus:ring-2 focus:ring-[#5169FE] focus:border-transparent`}
              placeholder={t('contactInfo.enterBrokerName')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              {t('contactInfo.brokerFirmName')}
              {autoFilledFields.includes("name_brokerfirm") && (
                <span className="ml-2 text-xs bg-[#5169FE]/10 text-[#5169FE] px-2 py-0.5 rounded">
                  AI Filled
                </span>
              )}
            </label>
            <input
              type="text"
              name="name_brokerfirm"
              value={placeholders.name_brokerfirm || ""}
              onChange={handleInputChange}
              className={`w-full rounded-md px-3 py-2 text-[#171717] ${
                autoFilledFields.includes("name_brokerfirm")
                  ? "bg-[#5169FE]/5 border border-[#5169FE]/30"
                  : "bg-white border border-gray-300"
              } focus:ring-2 focus:ring-[#5169FE] focus:border-transparent`}
              placeholder={t('contactInfo.enterBrokerFirmName')}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              {t('contactInfo.brokerFirmAddress')}
              {autoFilledFields.includes("address_brokerfirm") && (
                <span className="ml-2 text-xs bg-[#5169FE]/10 text-[#5169FE] px-2 py-0.5 rounded">
                  AI Filled
                </span>
              )}
            </label>
            <input
              type="text"
              name="address_brokerfirm"
              value={placeholders.address_brokerfirm || ""}
              onChange={handleInputChange}
              className={`w-full rounded-md px-3 py-2 text-[#171717] ${
                autoFilledFields.includes("address_brokerfirm")
                  ? "bg-[#5169FE]/5 border border-[#5169FE]/30"
                  : "bg-white border border-gray-300"
              } focus:ring-2 focus:ring-[#5169FE] focus:border-transparent`}
              placeholder={t('contactInfo.enterBrokerFirmAddress')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfoStep;
