"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { PropertyPlaceholders } from "@/types/placeholders";

interface AmenitiesStepProps {
  placeholders: PropertyPlaceholders;
  handleInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
  autoFilledFields?: string[]; // Add this prop to track AI-filled fields
}

// Define a type for the keys used in dynamic fields
type DynamicAmenityFieldKey =
  | "property_area"
  | "number_floors"
  | "floor"
  | "number_units";

const AmenitiesStep: React.FC<AmenitiesStepProps> = ({
  placeholders,
  handleInputChange,
  autoFilledFields = [], // Default to empty array if not provided
}) => {
  const { t } = useTranslation();

  const commonLabelClass = "block text-sm font-medium text-gray-700 mb-1";
  const sectionTitleClass =
    "text-gray-800 text-md font-semibold mb-3 pt-4 border-t border-gray-200 mt-4"; // Added separator

  // Determine which fields to show based on object_type
  const objectType = placeholders.object_type;
  let dynamicFields: {
    labelKey: string;
    name: DynamicAmenityFieldKey;
    placeholderKey: string;
  }[] = [];

  if (objectType === "family_house") {
    dynamicFields = [
      {
        labelKey: "amenities.customLabel.house.p1",
        name: "property_area",
        placeholderKey: "amenities.enterPropertyArea",
      },
      {
        labelKey: "amenities.customLabel.house.p2",
        name: "number_floors",
        placeholderKey: "amenities.enterNumberFloors",
      },
    ];
  } else if (objectType === "apartment") {
    dynamicFields = [
      {
        labelKey: "amenities.customLabel.apartment.p1",
        name: "floor",
        placeholderKey: "amenities.enterFloor",
      },
      {
        labelKey: "amenities.customLabel.apartment.p2",
        name: "number_units",
        placeholderKey: "amenities.enterNumberUnits",
      },
    ];
  }

  // Helper function to get the input class based on whether it's autofilled
  const getInputClass = (fieldName: string) => {
    return `w-full rounded-md px-3 py-2 text-[#171717] ${
      autoFilledFields.includes(fieldName)
        ? "bg-blue-50 border border-blue-300"
        : "bg-white border border-gray-300"
    } focus:ring-2 focus:ring-[#5169FE] focus:border-transparent`;
  };

  return (
    <div className="space-y-6 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-[#171717] text-lg font-medium mb-2">
        {t("amenities.title")}
      </h3>
      <p className="text-gray-600 mb-4">{t("amenities.enterInfo")}</p>

      {/* Property Details Section */}
      <h4 className={sectionTitleClass}>{t("amenities.detailsTitle")}</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Dynamic fields based on object_type */}
        {dynamicFields.map((field) => (
          <div key={field.name}>
            <label className={`${commonLabelClass} flex items-center`}>
              {t(field.labelKey)}
              {autoFilledFields.includes(field.name) && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                  {t("basicInfo.aiFilled")}
                </span>
              )}
            </label>
            <input
              type="text"
              name={field.name}
              value={placeholders[field.name] || ""}
              onChange={handleInputChange}
              className={getInputClass(field.name)}
              placeholder={t(field.placeholderKey)}
            />
          </div>
        ))}

        {/* Remaining static fields */}
        <div>
          <label className={`${commonLabelClass} flex items-center`}>
            {t("amenities.livingArea")}
            {autoFilledFields.includes("living_area") && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                {t("basicInfo.aiFilled")}
              </span>
            )}
          </label>
          <input
            type="text"
            name="living_area"
            value={placeholders.living_area || ""}
            onChange={handleInputChange}
            className={getInputClass("living_area")}
            placeholder={t("amenities.enterLivingArea")}
          />
        </div>
        <div>
          <label className={`${commonLabelClass} flex items-center`}>
            {t("amenities.renovations")}
            {autoFilledFields.includes("renovations") && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                {t("basicInfo.aiFilled")}
              </span>
            )}
          </label>
          <input
            type="text"
            name="renovations"
            value={placeholders.renovations || ""}
            onChange={handleInputChange}
            className={getInputClass("renovations")}
            placeholder={t("amenities.enterRenovations")}
          />
        </div>
        <div>
          <label className={`${commonLabelClass} flex items-center`}>
            {t("amenities.numberRooms")}
            {autoFilledFields.includes("number_rooms") && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                {t("basicInfo.aiFilled")}
              </span>
            )}
          </label>
          <input
            type="text"
            name="number_rooms"
            value={placeholders.number_rooms || ""}
            onChange={handleInputChange}
            className={getInputClass("number_rooms")}
            placeholder={t("amenities.enterNumberRooms")}
          />
        </div>
        <div>
          <label className={`${commonLabelClass} flex items-center`}>
            {t("amenities.numberBedrooms")}
            {autoFilledFields.includes("number_bedrooms") && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                {t("basicInfo.aiFilled")}
              </span>
            )}
          </label>
          <input
            type="text"
            name="number_bedrooms"
            value={placeholders.number_bedrooms || ""}
            onChange={handleInputChange}
            className={getInputClass("number_bedrooms")}
            placeholder={t("amenities.enterNumberBedrooms")}
          />
        </div>
        <div>
          <label className={`${commonLabelClass} flex items-center`}>
            {t("amenities.numberBathrooms")}
            {autoFilledFields.includes("number_bathrooms") && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                {t("basicInfo.aiFilled")}
              </span>
            )}
          </label>
          <input
            type="text"
            name="number_bathrooms"
            value={placeholders.number_bathrooms || ""}
            onChange={handleInputChange}
            className={getInputClass("number_bathrooms")}
            placeholder={t("amenities.enterNumberBathrooms")}
          />
        </div>
        <div>
          <label className={`${commonLabelClass} flex items-center`}>
            {t("amenities.numberKitchens")}
            {autoFilledFields.includes("number_kitchens") && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                {t("basicInfo.aiFilled")}
              </span>
            )}
          </label>
          <input
            type="text"
            name="number_kitchens"
            value={placeholders.number_kitchens || ""}
            onChange={handleInputChange}
            className={getInputClass("number_kitchens")}
            placeholder={t("amenities.enterNumberKitchens")}
          />
        </div>
      </div>

      {/* Features Section */}
      <h4 className={sectionTitleClass}>{t("amenities.featuresTitle")}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {" "}
        {/* Changed to 2 columns for better spacing */}
        <div>
          <label className={`${commonLabelClass} flex items-center`}>
            {t("amenities.flooring")}
            {autoFilledFields.includes("flooring") && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                {t("basicInfo.aiFilled")}
              </span>
            )}
          </label>
          <input
            type="text"
            name="flooring"
            value={placeholders.flooring || ""}
            onChange={handleInputChange}
            className={getInputClass("flooring")}
            placeholder={t("amenities.enterFlooring")}
          />
        </div>
        <div>
          <label className={`${commonLabelClass} flex items-center`}>
            {t("amenities.heatingType")}
            {autoFilledFields.includes("heating_type") && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                {t("basicInfo.aiFilled")}
              </span>
            )}
          </label>
          <input
            type="text"
            name="heating_type"
            value={placeholders.heating_type || ""}
            onChange={handleInputChange}
            className={getInputClass("heating_type")}
            placeholder={t("amenities.enterHeatingType")}
          />
        </div>
        {/* Replaced YesNoSelect with text inputs */}
        <div>
          <label className={`${commonLabelClass} flex items-center`}>
            {t("amenities.tv")}
            {autoFilledFields.includes("tv") && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                {t("basicInfo.aiFilled")}
              </span>
            )}
          </label>
          <input
            type="text"
            name="tv"
            value={placeholders.tv || ""}
            onChange={handleInputChange}
            className={getInputClass("tv")}
            placeholder={t("amenities.describeTV")}
          />
        </div>
        <div>
          <label className={`${commonLabelClass} flex items-center`}>
            {t("amenities.balconyTerrace")}
            {autoFilledFields.includes("balcony_terrace") && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                {t("basicInfo.aiFilled")}
              </span>
            )}
          </label>
          <input
            type="text"
            name="balcony_terrace"
            value={placeholders.balcony_terrace || ""}
            onChange={handleInputChange}
            className={getInputClass("balcony_terrace")}
            placeholder={t("amenities.describeBalcony")}
          />
        </div>
        <div>
          <label className={`${commonLabelClass} flex items-center`}>
            {t("amenities.elevator")}
            {autoFilledFields.includes("elevator") && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                {t("basicInfo.aiFilled")}
              </span>
            )}
          </label>
          <input
            type="text"
            name="elevator"
            value={placeholders.elevator || ""}
            onChange={handleInputChange}
            className={getInputClass("elevator")}
            placeholder={t("amenities.describeElevator")}
          />
        </div>
        <div>
          <label className={`${commonLabelClass} flex items-center`}>
            {t("amenities.garage")}
            {autoFilledFields.includes("garage") && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                {t("basicInfo.aiFilled")}
              </span>
            )}
          </label>
          <input
            type="text"
            name="garage"
            value={placeholders.garage || ""}
            onChange={handleInputChange}
            className={getInputClass("garage")}
            placeholder={t("amenities.describeGarage")}
          />
        </div>
      </div>

      {/* Energy Information Section */}
      <h4 className={sectionTitleClass}>{t("amenities.energyTitle")}</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className={`${commonLabelClass} flex items-center`}>
            {t("amenities.energyCertificate")}
            {autoFilledFields.includes("energy_certificate") && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                {t("basicInfo.aiFilled")}
              </span>
            )}
          </label>
          <select
            name="energy_certificate"
            value={placeholders.energy_certificate || ""}
            onChange={handleInputChange}
            className={getInputClass("energy_certificate")}
          >
            <option value="">{t("amenities.selectPlease")}</option>
            <option value="available_attached">
              {t("amenities.energyCertificate.availableAttached")}
            </option>
            <option value="in_progress">
              {t("amenities.energyCertificate.inProgress")}
            </option>
          </select>
        </div>
        <div>
          <label className={`${commonLabelClass} flex items-center`}>
            {t("amenities.energyCertificateUntil")}
            {autoFilledFields.includes("energy_certificate_until") && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                {t("basicInfo.aiFilled")}
              </span>
            )}
          </label>
          <input
            type="text"
            name="energy_certificate_until"
            value={placeholders.energy_certificate_until || ""}
            onChange={handleInputChange}
            className={getInputClass("energy_certificate_until")}
            placeholder={t("amenities.enterEnergyCertificateUntil")}
          />
        </div>
        <div className="md:col-span-2">
          <label className={`${commonLabelClass} flex items-center`}>
            {t("amenities.mainEnergySource")}
            {autoFilledFields.includes("main_energy_source") && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                {t("basicInfo.aiFilled")}
              </span>
            )}
          </label>
          <input
            type="text"
            name="main_energy_source"
            value={placeholders.main_energy_source || ""}
            onChange={handleInputChange}
            className={getInputClass("main_energy_source")}
            placeholder={t("amenities.enterMainEnergySource")}
          />
        </div>
      </div>
    </div>
  );
};

export default AmenitiesStep;
