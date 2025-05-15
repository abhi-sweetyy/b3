import {
  PropertyPlaceholders,
  defaultPlaceholders,
} from "@/types/placeholders";

// Property data interface that maps to your JSON structure
export interface PropertyData {
  projectname: string;
  address: string;
  category: string;
  price: string;
  space: string;
  yearofconstruction: string;
  condition: string;
  qualityofequipment: string;
  balcony: string;
  summary: string;
  layoutdescription: string;
  phone: string;
  email: string;
  website: string;
  amenities: string[];
  powerbackup: string;
  security: string;
  gym: string;
  playarea: string;
  maintainence: string;
}

// Function to process property descriptions with AI ONLY - fully dynamic approach

export const processPropertyDescription = async (
  description: string,
  addressInfo?: {
    cityName?: string;
    street?: string;
  },
  skipDescriptions: boolean = false,
): Promise<{
  placeholders: Partial<PropertyPlaceholders>;
}> => {
  try {
    console.log(
      "Processing text with AI:",
      description.substring(0, 100) + "...",
    );

    const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("API key not configured");

    // Create a system prompt that either excludes or includes description generation
    // based on the skipDescriptions parameter
    let systemPrompt = `Extract property details from the provided text. For each field, respond in this structured format:

    FIELD: title
    VALUE: The exact property title extracted from text

    FIELD: address_street
    VALUE: Street name from the text

    And so on for all fields below. If information is not found, provide an empty value like "VALUE: ". Use this exact format for each field:

    Fields to extract:
    - title: 
    - address_street: 
    - address_house_nr: 
    - address_plz: 
    - cityname: 
    - object_type: Type of property. MUST be either 'apartment' or 'family_house'.
    - offer_type: Whether it is for sale or rent. MUST be either 'for_sale' or 'for_rent'.
    - construction_year: 
    - maintenance_fees: 
    - shortdescription: Create a concise short one-sentence summary (in German!) of the property
    - price: 
    - date_available: 
    - floor: 
    - number_units: 
    - property_area: 
    - number_floors: 
    - living_area: 
    - renovations: 
    - number_rooms: 
    - number_bedrooms: 
    - number_bathrooms: 
    - number_kitchens: 
    - tv: 
    - balcony_terrace: 
    - elevator: 
    - garage: 
    - flooring: 
    - heating_type: 
    - energy_certificate: 
    - energy_certificate_until: 
    - main_energy_source: 
    - buyer_commission: 
    - seller_commission: `;

    // Only include long-form descriptions in the prompt if we're not skipping them
    if (!skipDescriptions) {
      systemPrompt += `
    - descriptionlarge: 
    - descriptionextralarge: `;
    }

    // Add description guidance
    if (!skipDescriptions) {
      systemPrompt += `

    IMPORTANT: Follow this exact format for each field. Don't add any other text before or after.

    Generate the following descriptions (in German!):

    1. shortdescription should be a concise short one-sentence summary of this property (in German!). Create this even if there's no explicit summary in the text.

    2. descriptionlarge should be two paragraphs about the location using the address data.

    3. descriptionextralarge should be four to six long paragraphs with ten to fifteen sentences.
    `;
    } else {
      systemPrompt += `

    IMPORTANT: Follow this exact format for each field. Don't add any other text before or after.

    The shortdescription should be a concise short one-sentence summary of this property (in German!). Create this even if there's no explicit summary in the text.
    DO NOT generate descriptionlarge or descriptionextralarge - these will be handled separately.`;
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "Real Estate Extractor",
        },
        body: JSON.stringify({
          model: "meta-llama/llama-4-maverick:free",
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: description,
            },
          ],
          temperature: 0.1,
        }),
      },
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(
        `API request failed with status ${response.status}:`,
        errorBody,
      );
      return { placeholders: {} };
    }

    const data = await response.json();

    if (!data?.choices?.[0]?.message?.content) {
      console.error("Invalid API response structure:", JSON.stringify(data));
      return { placeholders: {} };
    }

    const rawContent = data.choices[0].message.content;

    // Check if rawContent is not a string or empty
    if (typeof rawContent !== "string") {
      console.error("AI response content is not a string:", typeof rawContent);
      return { placeholders: {} };
    }

    if (rawContent.trim().length === 0) {
      console.error("AI response content is empty");
      return { placeholders: {} };
    }

    console.log(
      "Raw AI response content (first 250 chars):",
      rawContent.length > 250
        ? rawContent.substring(0, 250) + "..."
        : rawContent,
    );

    // Parse the structured response format directly
    const extractedData = parseStructuredFormat(rawContent);
    console.log(
      "Extracted the following fields:",
      Object.keys(extractedData).join(", "),
    );

    // Format and create dynamic placeholders object
    const placeholders: Partial<PropertyPlaceholders> = {};

    // Copy valid fields to placeholders object
    Object.keys(extractedData)
      .filter((key) => key in defaultPlaceholders)
      .forEach((key) => {
        const value = extractedData[key];
        if (value !== null && value !== undefined) {
          // Use 'any' for assignment to bypass complex type checks
          (placeholders as any)[key] = String(value);
        }
      });

    // If we have address components but no full address, build it
    if (
      !placeholders.address &&
      (extractedData.address_street || extractedData.address_plz)
    ) {
      const streetPart = [
        extractedData.address_street,
        extractedData.address_house_nr,
      ]
        .filter(Boolean)
        .join(" ")
        .trim();
      const cityPart = [extractedData.address_plz, extractedData.cityname]
        .filter(Boolean)
        .join(" ")
        .trim();
      if (streetPart && cityPart)
        placeholders.address = `${streetPart}, ${cityPart}`;
      else if (streetPart) placeholders.address = streetPart;
      else if (cityPart) placeholders.address = cityPart;
    }

    // If we have address info from the user and we're generating descriptions,
    // update the existing description with location info
    if (!skipDescriptions && addressInfo && addressInfo.cityName) {
      // Enhance the existing description with location info
      placeholders.descriptionlarge = generateLocationDescription(
        addressInfo.cityName,
        addressInfo.street || "",
        placeholders.descriptionlarge || "",
      );
    }

    return { placeholders };
  } catch (error) {
    console.error("Error in processPropertyDescription:", error);
    return { placeholders: {} };
  }
};

// Function to parse the structured format response
function parseStructuredFormat(text: string): Record<string, string> {
  const result: Record<string, string> = {};

  try {
    // Split the text by "FIELD:" to get individual field blocks
    const fieldBlocks = text
      .split("FIELD:")
      .filter((block) => block.trim().length > 0);

    for (const block of fieldBlocks) {
      try {
        // Extract field name (first line after "FIELD:")
        const lines = block.trim().split("\n");
        if (lines.length < 2) continue;

        const fieldName = lines[0].trim();

        // Find the VALUE: line
        const valueLine = lines.find((line) =>
          line.trim().startsWith("VALUE:"),
        );
        if (!valueLine) continue;

        // Extract the value part (after "VALUE:")
        const value = valueLine
          .substring(valueLine.indexOf("VALUE:") + 6)
          .trim();

        // Store in result
        result[fieldName] = value;
      } catch (e) {
        console.error("Error parsing field block:", e);
        // Continue to next block on error
      }
    }

    // Fallback: If parsing fails or no fields are found, try regex extraction
    if (Object.keys(result).length === 0) {
      console.log("Structured format parsing failed, trying regex fallback");
      return extractFieldsWithRegex(text);
    }

    return result;
  } catch (error) {
    console.error("Error in parseStructuredFormat:", error);
    return extractFieldsWithRegex(text); // Fallback to regex extraction
  }
}

// Fallback regex extraction function
function extractFieldsWithRegex(text: string): Record<string, string> {
  try {
    const result: Record<string, string> = {};

    // Define patterns for common fields
    const patterns: Record<string, RegExp> = {
      title: /(?:title|property|house|apartment)[:\s]+["']?([^"'\n.,]+)["']?/i,
      address_street: /(?:address|street)[:\s]+["']?([^"'\n.,]+)["']?/i,
      price: /(?:price|cost)[:\s]+["']?([^"'\n]+)["']?/i,
      // We'll still keep this pattern, but will create a fallback summary later
      shortdescription:
        /(?:summary|short\s*description)[:\s]+["']?([^"'\n.]+)["']?/i,
      construction_year: /(?:year|built|construction)[:\s]+["']?(\d{4})["']?/i,
      living_area: /(?:living|area|size|space)[:\s]+["']?([^"'\n]+m²)["']?/i,
      property_area:
        /(?:property|land|plot|grund)[:\s]+["']?([^"'\n]+m²)["']?/i,
      number_rooms: /(?:rooms|zimmer)[:\s]+["']?(\d+)["']?/i,
      object_type: /(?:type|property\s*type)[:\s]+["']?([^"'\n.,]+)["']?/i,
      offer_type: /(?:for\s*sale|for\s*rent|zu\s*verkaufen|zu\s*vermieten)/i,
      balcony_terrace:
        /(?:balcony|terrace|balkon|terrasse)[:\s]+["']?([^"'\n.]+)["']?/i,
      garage: /(?:garage|parking|stellplatz)[:\s]+["']?([^"'\n.]+)["']?/i,
      heating_type: /(?:heating|heizung)[:\s]+["']?([^"'\n.]+)["']?/i,
      phone_number: /(?:phone|tel|telefon)[:\s]+["']?([^"'\n]+)["']?/i,
      email_address: /(?:email|e-mail)[:\s]+["']?([^"'\n]+@[^"'\n]+)["']?/i,
      website_name: /(?:website|web|url)[:\s]+["']?([^"'\n]+)["']?/i,
    };

    // Extract the offer type explicitly from the text
    if (text.match(/(?:for\s*sale|kaufen|zu\s*verkaufen|verkauf)/i)) {
      result.offer_type = "for_sale";
    } else if (text.match(/(?:for\s*rent|mieten|zu\s*vermieten|vermietung)/i)) {
      result.offer_type = "for_rent";
    }

    // Try to identify property type from common keywords
    if (text.match(/(?:house|haus|einfamilienhaus)/i)) {
      result.object_type = "family_house";
    } else if (text.match(/(?:apartment|wohnung|appartement)/i)) {
      result.object_type = "apartment";
    } else if (text.match(/(?:villa|landhaus)/i)) {
      result.object_type = "villa";
    } else if (text.match(/(?:commercial|gewerbe|büro|office)/i)) {
      result.object_type = "commercial";
    }

    // For each pattern, try to extract the value
    for (const [field, pattern] of Object.entries(patterns)) {
      const match = text.match(pattern);
      if (match && match[1]) {
        result[field] = match[1].trim();
      }
    }

    // Extract description paragraphs more flexibly
    const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 5);

    // Create a shortdescription if one wasn't found by the regex
    if (!result.shortdescription) {
      // Get the first non-empty sentence from the text, limited to ~100 chars
      const firstSentence = text.split(/[.!?][\s\n]+/)[0];
      if (firstSentence && firstSentence.length > 10) {
        // Limit to a reasonable length and add ellipsis if needed
        const maxLength = 100;
        result.shortdescription =
          firstSentence.length > maxLength
            ? firstSentence.substring(0, maxLength) + "..."
            : firstSentence;
      } else if (paragraphs.length > 0) {
        // Use first paragraph as fallback
        const firstPara = paragraphs[0].trim();
        result.shortdescription =
          firstPara.length > 100
            ? firstPara.substring(0, 100) + "..."
            : firstPara;
      }
    }

    if (paragraphs.length >= 2 && !result.descriptionlarge) {
      result.descriptionlarge = paragraphs[1].trim();
    }

    if (paragraphs.length >= 3 && !result.descriptionextralarge) {
      result.descriptionextralarge = paragraphs.slice(2, 4).join("\n\n").trim();
    }

    return result;
  } catch (error) {
    console.error("Error in extractFieldsWithRegex:", error);
    return {}; // Return empty object on error
  }
}

/**
 * Generates a location-specific property description based on address details
 * @param cityName The name of the city
 * @param street The street name
 * @param originalDescription Optional original AI-extracted description to enhance
 * @returns Enhanced description that references the location
 */
export const generateLocationDescription = (
  cityName: string,
  street: string = "",
  originalDescription: string = "",
): string => {
  try {
    // If we have no city, return original description
    if (!cityName) return originalDescription;

    // Extract any good details from the original description
    let propertyFeatures = "";
    if (originalDescription) {
      // Try to extract property features from original description
      // This is a simple approach - could be enhanced with more NLP techniques
      const sentences = originalDescription
        .split(/[.!?]+/)
        .filter((s) => s.trim().length > 0);
      const featureSentences = sentences.filter(
        (s) =>
          !s.toLowerCase().includes(cityName.toLowerCase()) &&
          !s.toLowerCase().includes("lage") &&
          !s.toLowerCase().includes("umgebung") &&
          !s.toLowerCase().includes("standort"),
      );

      if (featureSentences.length > 0) {
        propertyFeatures = featureSentences.slice(0, 2).join(". ") + ".";
      }
    }

    // Build location-specific description
    let description = "";

    // First paragraph: General location
    if (cityName.toLowerCase() === "berlin") {
      description = `Die Immobilie befindet sich in Berlin, der pulsierenden Hauptstadt Deutschlands. Berlin ist bekannt für seine reiche Geschichte, vielfältige Kultur und ausgezeichnete Infrastruktur mit zahlreichen Einkaufsmöglichkeiten, Restaurants und Freizeitangeboten.`;
    } else if (
      cityName.toLowerCase() === "münchen" ||
      cityName.toLowerCase() === "muenchen"
    ) {
      description = `Die Immobilie befindet sich in München, der bayerischen Landeshauptstadt mit hoher Lebensqualität. München bietet eine perfekte Mischung aus Tradition und Moderne, mit ausgezeichneter Infrastruktur, kulturellen Angeboten und der Nähe zu den Alpen.`;
    } else if (cityName.toLowerCase() === "hamburg") {
      description = `Die Immobilie befindet sich in Hamburg, der grünen Hafenstadt im Norden. Hamburg besticht durch seine Wasserlage, kulturellen Highlights und exzellente Verkehrsanbindung.`;
    } else {
      description = `Die Immobilie befindet sich in ${cityName}, einer attraktiven Lage mit guter Infrastruktur. Die Umgebung bietet alle Annehmlichkeiten des täglichen Bedarfs und eine gute Verkehrsanbindung.`;
    }

    // Second paragraph: Specific street location if available
    if (street) {
      description += `\n\nDie ${street} ist eine ${getStreetDescription(cityName)} Lage, die sich durch ${getNeighborhoodFeatures(cityName)} auszeichnet. Die Verkehrsanbindung ist ausgezeichnet, und alle Einrichtungen des täglichen Bedarfs sind gut erreichbar.`;
    } else {
      description += `\n\nDie Lage zeichnet sich durch eine gute Verkehrsanbindung aus. Alle Einrichtungen des täglichen Bedarfs wie Einkaufsmöglichkeiten, Ärzte und Schulen befinden sich in der Nähe.`;
    }

    // Add property features if available
    if (propertyFeatures) {
      description += `\n\n${propertyFeatures}`;
    }

    return description;
  } catch (error) {
    console.error("Error in generateLocationDescription:", error);
    return originalDescription || "";
  }
};

// Helper functions for more variety in descriptions
function getStreetDescription(cityName: string): string {
  try {
    const descriptions = [
      "zentrale",
      "ruhige",
      "grüne",
      "familienfreundliche",
      "beliebte",
      "gut angebundene",
      "verkehrsgünstige",
      "attraktive",
    ];

    // Use city name to generate a consistent but seemingly random choice
    const seed = cityName.length;
    return descriptions[seed % descriptions.length];
  } catch (error) {
    console.error("Error in getStreetDescription:", error);
    return "attraktive"; // Default fallback
  }
}

function getNeighborhoodFeatures(cityName: string): string {
  try {
    const features = [
      "Nähe zu Parks und Grünflächen",
      "gute Einkaufsmöglichkeiten",
      "ausgezeichnete Verkehrsanbindung",
      "vielfältige Gastronomie",
      "kulturelle Angebote",
      "hervorragende Schulen und Kindergärten",
      "eine angenehme Nachbarschaft",
    ];

    // Pick 2-3 features based on city name as seed
    const seed = cityName.length;
    const feature1 = features[seed % features.length];
    const feature2 = features[(seed + 3) % features.length];

    return `${feature1} und ${feature2}`;
  } catch (error) {
    console.error("Error in getNeighborhoodFeatures:", error);
    return "gute Infrastruktur und Verkehrsanbindung"; // Default fallback
  }
}
