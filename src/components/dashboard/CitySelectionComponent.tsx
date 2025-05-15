import React from "react";
import { useTranslation } from "react-i18next";
import { cities, cityNames } from "@/data/cityData";
import { PropertyPlaceholders } from "@/types/placeholders";

interface CitySelectionComponentProps {
  placeholders: PropertyPlaceholders;
  handleCityChange: (cityName: string) => void;
  handleInputChange: (
    e: React.ChangeEvent<
      HTMLSelectElement | HTMLTextAreaElement | HTMLInputElement
    >,
  ) => void;
}

const CitySelectionComponent: React.FC<CitySelectionComponentProps> = ({
  placeholders,
  handleCityChange,
  handleInputChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("city.selectCity", "Select City")}
        </label>
        <select
          name="cityname"
          value={placeholders.cityname || ""}
          onChange={(e) => {
            handleCityChange(e.target.value);
          }}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="">{t("city.selectCity", "Select City")}</option>
          {cityNames.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      {placeholders.cityname && (
        <>
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t("city.cityTexts", "City Description Texts")}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {t(
                "city.textInstructions",
                "Edit the city description texts that will appear in the brochure.",
              )}
            </p>

            <div className="space-y-4">
              {[1, 2, 3, 4].map((index) => {
                // Create field name as string
                const fieldName = `city_text${index}`;

                return (
                  <div key={index}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("city.textSection", "Text Section {{number}}", {
                        number: index,
                      })}
                    </label>
                    <textarea
                      name={fieldName}
                      value={placeholders[fieldName] || ""}
                      onChange={handleInputChange}
                      rows={3}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder={t(
                        "city.textPlaceholder",
                        "Enter city description text {{number}}",
                        { number: index },
                      )}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CitySelectionComponent;
