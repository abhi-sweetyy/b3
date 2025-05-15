import { createInstance } from "i18next";
import { initReactI18next } from "react-i18next";

// Create i18n instance
const i18n = createInstance();

// Initialize i18n with async detection
const initI18n = async () => {
  await i18n.use(initReactI18next).init({
    lng: "de", // Change to German as default language
    fallbackLng: "de", // Change fallback to German as well
    debug: false, // Disable debug mode
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    react: {
      useSuspense: false, // This is important to prevent issues with SSR
      bindI18n: "languageChanged loaded", // Trigger re-render on language change AND initial load
      bindI18nStore: "added removed", // Trigger re-render when resources are added/removed
    },
    resources: {
      en: {
        translation: {
          // Navigation
          features: "Features",
          demo: "Demo",
          benefits: "Benefits",
          faq: "FAQ",
          login: "Login",
          getStarted: "Get Started",
          pricing: "Pricing",

          // Hero Section
          "hero.title": "Real Estate Brochures",
          "hero.subtitle": "simplified",
          "hero.description":
            "With ExposeFlow, create stunning real estate marketing materials in minutes without design experience",
          "hero.feature1": "Generate brochures based on your existing designs",
          "hero.feature2":
            "Edit and finalize the brochures according to your preferences",
          "hero.feature3":
            "Save time creating professional marketing materials",
          "hero.startCreating": "Start creating",
          "hero.seeExamples": "View Demo",

          // TrustedBy Section
          "trustedBy.title":
            "Trusted by real estate professionals from top agencies",

          // Features Section
          "features.title": "How ExposeFlow Works",
          "features.step1.title": "Enter Property Details",
          "features.step1.description":
            "Upload photos and enter key property information using our simple form interface",
          "features.step2.title": "AI Generates Content",
          "features.step2.description":
            "Our AI writes compelling property descriptions and lays out a professional design",
          "features.step3.title": "Download Your Brochure",
          "features.step3.description":
            "Preview, edit if needed, and download your ready-to-use professional brochure",
          "features.getStarted": "Get Started",

          "descriptions.generating": "Generating...",
          "descriptions.generateButton": "Generate Descriptions",
          "descriptions.generationSuccess":
            "Descriptions generated successfully",
          "descriptions.generationFailed": "Failed to generate descriptions",

          // Tab Features
          "features.tabs.photoEnhancement": "Photo Enhancement",
          "features.tabs.aiText": "AI-Powered Text Generation",
          "features.tabs.templates": "Professional Templates",
          "features.learnMore": "Learn more",
          "features.photoEnhancement.description":
            "Automatically enhance your property photos with AI suggested professional filters and adjustments. Our technology detects and improves lighting, colors, and clarity to make your listings stand out.",
          "features.aiText.description":
            "Generate compelling property descriptions automatically using advanced AI technology. Our system creates engaging, accurate content that highlights the best features of your properties without the need for manual writing.",
          "features.aiText.imageAlt": "AI Text Generation",
          "features.templates.description":
            "Choose from a variety of professionally designed templates for your brochures or use your previous designs. Our collection of layouts ensures you'll find the perfect style to showcase any property type.",
          "features.templates.imageAlt": "Professional brochure templates",

          // Features Grid Section
          "features.grid.mainTitle": "What Makes Us Different",
          "features.grid.customBranding.title": "Custom Branding",
          "features.grid.customBranding.description":
            "Our team integrates your existing designs directly into the tool.",
          "features.grid.photoEditing.title": "Integrated Photo Editing",
          "features.grid.photoEditing.description":
            "Edit images directly in the tool for professional brochures.",
          "features.grid.fullyCustomizable.title": "Fully Customizable",
          "features.grid.fullyCustomizable.description":
            "Adjust your brochures afterward – text, images, and layout.",
          "features.grid.pageSelection.title": "Page Selection",
          "features.grid.pageSelection.description":
            "Choose specifically which sections to include in your brochure.",
          "features.grid.options.title": "Various Templates",
          "features.grid.options.description":
            "Select from a variety of professional templates.",
          "features.grid.automation.title": "Automations",
          "features.grid.automation.description":
            "Use automations like map creation to save time.",

          // Demo Section
          "demo.title": "See ExposeFlow in Action",
          "demo.placeholder": "Video Demo Placeholder",

          // Benefits Section
          "benefits.title": "Why Choose ExposeFlow",
          "benefits.saveMoney.title": "Save Money",
          "benefits.saveMoney.description":
            "No expensive design software needed",
          "benefits.saveTime.title": "Save Time",
          "benefits.saveTime.description":
            "Create brochures in minutes, not hours",
          "benefits.professional.title": "Professional Results",
          "benefits.professional.description":
            "Impress clients with high-quality materials",

          // Testimonial Section
          "testimonial.quote":
            "ExposeFlow allows me to create compelling exposes much more easily - a real time saver for my real estate business! The ease of use and professional designs are particularly helpful. I also have the option of using my own previous designs as templates.",
          "testimonial.name": "Franz Sorger",
          "testimonial.position": "Real Estate Broker",

          // FAQ Section
          "faq.title": "FAQ",
          "faq.items.pricing.question": "How much does ExposeFlow cost?",
          "faq.items.pricing.answer":
            "ExposeFlow offers flexible pricing plans starting at $9.99/month for our Basic plan, which includes up to 10 brochures per month. Our Professional plan at $19.99/month offers unlimited brochures and premium templates. Enterprise pricing is available for teams and agencies.",
          "faq.items.experience.question":
            "Do I need design experience to use ExposeFlow?",
          "faq.items.experience.answer":
            "Not at all! ExposeFlow is specifically designed for real estate professionals with no design experience. Our templates and AI-powered tools handle all the design work for you, so you can create professional-looking brochures in minutes.",
          "faq.items.customize.question":
            "Can I customize the generated content?",
          "faq.items.customize.answer":
            "Yes, absolutely! While our AI generates high-quality content automatically, you can edit any text, change images, adjust layouts, and customize colors to match your brand. You have complete control over the final output.",
          "faq.items.formats.question":
            "What formats can I download my brochures in?",
          "faq.items.formats.answer":
            "You can download your brochures as high-resolution PDFs ready for printing, web-optimized PDFs for digital sharing, or as image files (JPEG/PNG) for use in social media and other online platforms.",
          "faq.items.limits.question":
            "How many properties can I create brochures for?",
          "faq.items.limits.answer":
            "The number of brochures you can create depends on your subscription plan. Our Basic plan allows up to 10 brochures per month, while our Professional and Enterprise plans offer unlimited brochure creation.",
          "faq.items.branding.question":
            "Can I add my brokerage's branding to the brochures?",
          "faq.items.branding.answer":
            "Yes! ExposeFlow allows you to add your logo, custom colors, contact information, and other branding elements to ensure all your marketing materials are consistent with your brand identity.",

          "footer.product": "Product",
          "footer.features": "Features",
          "footer.pricing": "Pricing",
          "footer.howItWorks": "How it Works",
          "footer.company": "Company",
          "footer.about": "About",
          "footer.contact": "Contact",
          "footer.faq": "FAQ",
          "footer.legal": "Legal",
          "footer.imprint": "Imprint",
          "footer.privacyPolicy": "Privacy Policy",
          "footer.termsOfService": "Terms of Service",
          "footer.companyDesc":
            "AI-powered brochure generation platform for real estate professionals.",
          "footer.copyright": "© {{year}} ExposeFlow",

          // CTA Section
          "cta.title": "Ready to Transform Your Real Estate Marketing?",
          "cta.description":
            "Join thousands of real estate professionals who are saving time and winning more listings with our AI-powered brochure maker.",
          "cta.trustedBy": "Trusted by:",
          "cta.startToday": "Start Creating Today",
          "cta.signUp":
            "Sign up in 60 seconds and create your first brochure for free.",
          "cta.getStartedFree": "Get Started — It's Free",
          "cta.noCredit": "No credit card required",
          "cta.bookDemo": "Book a Demo",
          "cta.bookDemoDescription":
            "Schedule a 30-minute appointment with our team.",
          "cta.scheduleButton": "Choose a Time",

          // Authentication pages
          "auth.signup.title": "Create an Account",
          "auth.signup.email": "Email address",
          "auth.signup.password": "Create password",
          "auth.signup.button": "Sign up",
          "auth.signup.loading": "Signing up...",
          "auth.signup.emailPlaceholder": "Your email address",
          "auth.signup.passwordPlaceholder": "Create a strong password",
          "auth.signup.haveAccount": "Already have an account?",
          "auth.signup.signIn": "Sign in",
          "auth.signup.backToHome": "Back to home",

          "auth.signin.title": "Login",
          "auth.signin.email": "Email address",
          "auth.signin.password": "Password",
          "auth.signin.button": "Sign in",
          "auth.signin.loading": "Signing in...",
          "auth.signin.emailPlaceholder": "Your email address",
          "auth.signin.passwordPlaceholder": "Your password",
          "auth.signin.forgotPassword": "Forgot your password?",
          "auth.signin.noAccount": "Don't have an account?",
          "auth.signin.signup": "Sign up",
          "auth.signin.backToHome": "Back to home",

          // Dashboard Section
          "dashboard.title": "Dashboard",
          "dashboard.subtitle": "Create and manage your real estate brochures",
          "dashboard.credits": "Credits",
          "dashboard.buyCredits": "Buy Credits",
          "dashboard.createBrochure": "Create New Brochure",
          "dashboard.loading": "Loading your dashboard...",
          "dashboard.settingUp": "Setting up your account...",
          "dashboard.menu": "Menu",
          "dashboard.myBrochures": "My Brochures",
          "dashboard.accountSettings": "Account Settings",
          "dashboard.billing": "Billing",
          "dashboard.signOut": "Sign Out",

          "templateSelector.noPreview": "No preview available",
          "templateSelector.classicColorless.name":
            "Classic Colorless Template",
          "templateSelector.classicColorless.description":
            "A simple, color-free design, perfect for printing",
          "templateSelector.classic.name": "Classic Template",
          "templateSelector.classic.description":
            "Traditional design with subtle grey accents",
          "templateSelector.colorful.name": "Colorful Template",
          "templateSelector.colorful.description":
            "Vibrant template with warm brown tones",

          "templateSelector.viewAllTemplates": "View All Templates",
          "templateSelector.allTemplates": "All Templates",

          "brochures.title": "My Brochures",
          "brochures.subtitle": "View and manage your real estate brochures",
          "brochures.createNew": "Create New Brochure",
          "brochures.yourBrochures": "Your Brochures",
          "brochures.noBrochuresYet": "You haven't created any brochures yet",
          "brochures.createFirstDescription":
            "Create your first professional real estate brochure with our easy-to-use AI templates",
          "brochures.createFirstButton": "Create Your First Brochure",

          // Billing Page
          "billing.mustBeLoggedIn": "You must be logged in to purchase credits",
          "billing.invalidPackage": "Invalid package selected",
          "billing.purchaseSuccess":
            "Successfully purchased {{credits}} credits!",
          "billing.purchaseFailed":
            "Failed to process your purchase. Please try again.",
          "billing.loading": "Loading...",
          "billing.title": "Billing & Credits",
          "billing.subtitle":
            "Purchase credits to create brochures and use premium features",
          "billing.currentBalance": "Current Balance",
          "billing.credits": "Credits",
          "billing.costPerBrochure": "Each brochure costs 1 credit to generate",
          "billing.buyMoreCredits": "Buy More Credits",
          "billing.creditPackages": "Credit Packages",
          "billing.choosePackage": "Choose a package that suits your needs",
          "billing.mostPopular": "Most Popular",
          "billing.bestValue": "Best Value",
          "billing.whatsIncluded": "What's included",
          "billing.justPerCredit": "Just ${{price}} per credit",
          "billing.processing": "Processing...",
          "billing.purchaseNow": "Purchase Now",
          "billing.howCreditsWork": "How Credits Work",
          "billing.purchaseCredits": "Purchase Credits",
          "billing.purchaseCreditsDesc":
            "Buy credit packages that best suit your needs.",
          "billing.createBrochures": "Create Brochures",
          "billing.createBrochuresDesc":
            "Use 1 credit for each brochure you generate.",
          "billing.noExpiration": "No Expiration",
          "billing.noExpirationDesc":
            "Your credits never expire and can be used anytime.",

          // Account Page
          "account.fillAllFields":
            "Please fill in all required fields correctly",
          "account.savingInfo": "Saving your information...",
          "account.saveFailed": "Failed to save your information",
          "account.profileUpdated": "Profile updated successfully",
          "account.profileCompleted":
            "Profile completed successfully! Redirecting to dashboard...",
          "account.unexpectedError": "An unexpected error occurred",
          "account.settings": "Account Settings",
          "account.completeProfile": "Complete Your Profile",
          "account.manageProfile": "Manage your profile information",
          "account.beforeCreate":
            "Before you can create brochures, we need some basic information about you",
          "account.backToDashboard": "Back to Dashboard",
          "account.brokerProfileInfo": "Broker Profile Information",
          "account.infoForBrochures":
            "This information will be used in your real estate brochures and templates.",
          "account.companyLogo": "Company Logo",
          "account.brokerPhoto": "Broker Photo",
          "account.remove": "Remove",
          "account.logoRequired": "Business logo is required",
          "account.photoRequired": "Broker photo is required",
          "account.contactInfo": "Contact Information",
          "account.brokerName": "Broker Name",
          "account.companyName": "Company Name",
          "account.emailAddress": "Email Address",
          "account.phoneNumber": "Phone Number",
          "account.faxNumber": "Fax Number",
          "account.website": "Website",
          "account.address": "Address",
          "account.optional": "optional",
          "account.brokerNamePlaceholder": "John Smith",
          "account.companyNamePlaceholder": "Real Estate Company LLC",
          "account.emailPlaceholder": "john@realestate.com",
          "account.phonePlaceholder": "+1 (123) 456-7890",
          "account.faxPlaceholder": "+1 (123) 456-7891",
          "account.websitePlaceholder": "www.yourcompany.com",
          "account.addressPlaceholder":
            "123 Main Street, Apt 4B, New York, NY 10001",
          "account.websiteNote":
            "Enter your website address (https:// will be added automatically if needed)",
          "account.addressNote":
            "Enter complete address: street name, house number, ZIP code, and city",
          "account.validEmailRequired": "Valid email address is required",
          "account.phoneRequired": "Phone number is required",
          "account.websiteRequired": "Website is required",
          "account.saveProfileInfo": "Save Profile Information",

          // Form Steps
          "formSteps.template.title": "Template",
          "formSteps.template.description": "Select a template",
          "formSteps.pages.title": "Pages",
          "formSteps.pages.description": "Select pages",
          "formSteps.basicInfo.title": "Basic Info",
          "formSteps.basicInfo.description": "Enter basic info",
          "formSteps.descriptions.title": "Descriptions",
          "formSteps.descriptions.description": "Enter property descriptions",
          "formSteps.images.title": "Images",
          "formSteps.images.description": "Upload images",
          "formSteps.amenities.title": "Amenities",
          "formSteps.amenities.description": "Add amenities & features",
          "formSteps.commission.title": "Commission",
          "formSteps.commission.description": "Enter commission details",
          "formSteps.contactInfo.title": "Contact Info",
          "formSteps.contactInfo.description": "Add contact info",
          "formSteps.review.title": "Review",
          "formSteps.review.description": "Review your project",

          // Form Navigation
          "form.previous": "Previous",
          "form.next": "Next",
          "form.createBrochure": "Create Brochure",
          "form.creating": "Creating...",

          // Form Validation Errors
          "error.selectTemplate": "Please select a template to continue",
          "error.selectPages": "Please select pages to continue",
          "error.titleRequired": "Project title is required",
          "error.loginRequired": "You must be logged in to create a project",
          "error.objectTypeRequired": "Please select an Object Type",
          "error.offerTypeRequired": "Please select an Offer Type",

          // API Error Messages
          "api.connectionFailed": "API connection failed.",
          "api.keyMissing":
            "OpenRouter API key is missing. Please add it to your .env file.",
          "api.keyInvalidFormat":
            "OpenRouter API key has invalid format. It should start with 'sk-or-v1-'.",
          "api.keyInvalid":
            "Invalid OpenRouter API key. Please check your credentials.",
          "api.rateLimit":
            "OpenRouter API rate limit exceeded. Please try again later.",
          "api.networkError":
            "Network error connecting to OpenRouter API. Check your internet connection.",
          "api.verifyFailed": "Failed to verify API connection",

          // Document Processing
          "document.extracting": "Extracting property information...",
          "document.extractFailed":
            "Failed to extract information from document",
          "document.extractSuccess": "Successfully extracted {{count}} field",
          "document.extractSuccess_plural":
            "Successfully extracted {{count}} fields",
          "document.missingFields":
            "Some critical fields couldn't be extracted: {{fields}}. Please fill them manually.",
          "document.noFieldsExtracted":
            "No fields could be extracted from the document. Please fill in fields manually.",
          "basicInfo.documentTitle": "Document Upload",
          "basicInfo.uploadInstructions":
            "Upload a document or paste text to extract property information",
          "basicInfo.clickToUpload": "Click to upload",
          "basicInfo.dragDrop": "or drag and drop",
          "basicInfo.supportedFormats": "DOCX, TXT, RTF",
          "basicInfo.orPaste": "Or paste text below",
          "basicInfo.pasteHere": "Paste property description text here...",
          "basicInfo.processing": "Processing...",
          "basicInfo.extractInfo": "Extract Information",
          "basicInfo.requiredInfo": "Required Information",
          "basicInfo.fillEdit": "Fill in or edit the following information",
          "basicInfo.propertyTitle": "Property Title",
          "basicInfo.aiFilled": "AI Filled",
          "basicInfo.enterTitle": "Enter property title",
          "basicInfo.address": "Address",
          "basicInfo.enterAddress": "Enter property address",

          "basicInfo.addressSearch": "Adresssuche mit Autovervollständigung",
          "basicInfo.enterAddress": "Adresse eingeben für Vorschläge",
          "basicInfo.addressSearchHelp":
            "Gib eine Adresse ein und wähle aus den Vorschlägen",
          "basicInfo.cityNotInList":
            "Die erkannte Stadt ist nicht in der Liste. Bitte wähle manuell.",

          "basicInfo.shortDescription": "Short Description",
          "basicInfo.enterShortDescription": "Enter a short description",
          "basicInfo.price": "Price",
          "basicInfo.enterPrice": "Enter property price",
          "basicInfo.dateAvailable": "Date Available",
          "basicInfo.enterDateAvailable": "Enter date available",
          "basicInfo.sitePlanDescription": "Site Plan Description",
          "basicInfo.enterSitePlanDescription": "Enter site plan description",
          "basicInfo.detailedDescription": "Detailed Description",
          "basicInfo.enterDetailedDescription":
            "Enter detailed property description",
          "basicInfo.regenerateCriticalFields": "Regenerate Critical Fields",

          "basicInfo.addressStreet": "Street",
          "basicInfo.addressHouseNr": "House No.",
          "basicInfo.addressPlz": "ZIP Code",
          "basicInfo.addressCity": "City",
          "basicInfo.enterAddressStreet": "Enter street name",
          "basicInfo.enterAddressHouseNr": "Enter house number",
          "basicInfo.enterAddressPlz": "Enter ZIP code",
          "basicInfo.enterAddressCity": "Enter city",
          "basicInfo.objectType": "Object Type",
          "basicInfo.selectObjectType": "Select object type",
          "objectType.apartment": "Apartment",
          "objectType.family_house": "Family House",
          "basicInfo.offerType": "Offer Type",
          "basicInfo.selectOfferType": "Select offer type",
          "offerType.for_sale": "For Sale",
          "offerType.for_rent": "For Rent",
          "basicInfo.constructionYear": "Construction Year",
          "basicInfo.enterConstructionYear": "Enter construction year",
          "basicInfo.maintenanceFees": "Maintenance Fees",
          "basicInfo.enterMaintenanceFees":
            "Enter maintenance fees (e.g., €200/month)",

          "imagesStep.buildingLayoutMapDesc":
            "An interactive map showing the property location",
          "imagesStep.orUploadManually": "Or upload an image manually:",
          "maps.loading": "Loading map...",
          "maps.retry": "Retry",
          "maps.updateImage": "Update Image",
          "maps.locationMap": "Property Location Map",
          "maps.missingData": "Address or API key is missing",
          "maps.loadError": "Failed to load Google Maps",
          "maps.geocodeError": "Could not find location on map",
          "maps.captureError": "Failed to capture map image",

          // Pages selection translations for English
          "pagesSelection.title": "Pages to Include",
          "pagesSelection.description":
            "Select which pages to include in your brochure",
          "pagesSelection.images": "images",
          "pagesSelection.image": "image",
          "pages.projectOverview": "Project Overview",
          "pages.cityDescription": "City Description",
          "pages.buildingLayout": "Building Layout Plan",
          "pages.amenities": "Amenities",
          "pages.description": "Description",
          "pages.exteriorPhotos": "Exterior Photos",
          "pages.interiorPhotos": "Interior Photos",
          "pages.floorPlan": "Floor Plan",
          "pages.energyCertificate": "Excerpt from Energy Certificate",
          "pages.termsConditions": "Terms & Conditions",

          // ImagesStep translations
          "imagesStep.companyLogo": "Company Logo",
          "imagesStep.companyLogoDesc":
            "Upload your company logo that will appear on all pages",
          "imagesStep.agentPhoto": "Agent Photo",
          "imagesStep.agentPhotoDesc":
            "Upload a professional photo of the agent",
          "imagesStep.projectOverview": "Project Overview Image",
          "imagesStep.projectOverviewDesc": "Upload the main project image",
          "imagesStep.buildingLayout": "Building Layout Plan",
          "imagesStep.buildingLayoutDesc": "Upload the building layout plan",
          "imagesStep.exteriorPhotos": "Exterior Photos",
          "imagesStep.exteriorPhotosDesc":
            "Upload exterior photos of the property (max 2)",
          "imagesStep.exteriorPhoto1": "Exterior Photo 1",
          "imagesStep.exteriorPhoto2": "Exterior Photo 2",
          "imagesStep.interiorPhotos": "Interior Photos",
          "imagesStep.interiorPhotosDesc":
            "Upload interior photos of the property (max 2)",
          "imagesStep.interiorPhoto1": "Interior Photo 1",
          "imagesStep.interiorPhoto2": "Interior Photo 2",
          "imagesStep.floorPlan": "Floor Plan",
          "imagesStep.floorPlanDesc": "Upload the floor plan image",
          "imagesStep.energyCertificate": "Energy Certificate",
          "imagesStep.energyCertificateDesc":
            "Upload the energy certificate images (max 2)",
          "imagesStep.energyPage1": "Energy Certificate Page 1",
          "imagesStep.energyPage2": "Energy Certificate Page 2",
          "imagesStep.uploadInfo":
            "Upload images for your selected pages. The system will automatically organize them in your brochure.",

          // ImageUploader translations
          "imageUploader.addImage": "Add Image",
          "imageUploader.uploading": "Uploading...",
          "imageUploader.dropHere": "Drop file here or click to browse",
          "imageUploader.uploadImages": "Upload Property Images",
          "imageUploader.dragAndDrop":
            "Drag and drop your images here, or click to browse your files",
          "imageUploader.supportedFormats":
            "Supported formats: JPG, PNG, WEBP • Max size: 5MB",
          "imageUploader.edit": "Edit",
          "imageUploader.remove": "Remove",
          "imageUploader.enhanceImage": "Enhance Image",
          "imageUploader.enhanceTip":
            "Increase Lighting in image. Click reset if needed",
          "imageUploader.enhancing": "Enhancing image...",
          "imageUploader.saving": "Saving image...",
          "imageUploader.saveChanges": "Save Changes",
          "imageUploader.reset": "Reset",
          "imageUploader.adjustments": "Adjustments",
          "imageUploader.brightness": "Brightness",
          "imageUploader.contrast": "Contrast",
          "imageUploader.blurAreas": "Blur Areas",
          "imageUploader.drawingMode": "Drawing Mode",
          "imageUploader.selectMode": "Select Mode",
          "imageUploader.blurStrength": "Blur Strength",
          "imageUploader.blurInstructions1":
            "Click and drag to draw blur regions",
          "imageUploader.blurInstructions2":
            "Double-click a region to remove it",
          "imageUploader.clearBlur": "Clear All Blur Regions",
          "imageUploader.editBeforeUpload": "Edit Before Upload",

          // AmenitiesStep translations
          "amenities.title": "Property Amenities & Features",
          "amenities.enterInfo":
            "Enter details about the property's specifics and features.",
          "amenities.shortDescription": "Short Description",
          "amenities.enterShortDescription":
            "Enter a short description highlighting key amenities",
          "amenities.additionalFeatures": "Additional Feature Details",
          "amenities.enterAdditionalFeatures":
            "Enter additional information about property features and amenities",
          "amenities.detailsTitle": "Property Details",
          "amenities.floor": "Floor",
          "amenities.enterFloor": "e.g., 3rd floor, Ground floor",
          "amenities.numberUnits": "Number of Units",
          "amenities.enterNumberUnits": "e.g., 10",
          "amenities.propertyArea": "Property Area (sqm)",
          "amenities.enterPropertyArea": "e.g., 1500 sqm",
          "amenities.numberFloors": "Number of Floors",
          "amenities.enterNumberFloors": "e.g., 5",
          "amenities.livingArea": "Living Area (sqm)",
          "amenities.enterLivingArea": "e.g., 120 sqm",
          "amenities.renovations": "Last Renovation",
          "amenities.enterRenovations": "e.g., 2022, Core renovation",
          "amenities.numberRooms": "Number of Rooms",
          "amenities.enterNumberRooms": "e.g., 4",
          "amenities.numberBedrooms": "Number of Bedrooms",
          "amenities.enterNumberBedrooms": "e.g., 2",
          "amenities.numberBathrooms": "Number of Bathrooms",
          "amenities.enterNumberBathrooms": "e.g., 1.5",
          "amenities.numberKitchens": "Number of Kitchens",
          "amenities.enterNumberKitchens": "e.g., 1",
          "amenities.featuresTitle": "Features",
          "amenities.tv": "TV Connection",
          "amenities.balconyTerrace": "Balcony/Terrace",
          "amenities.elevator": "Elevator",
          "amenities.garage": "Garage/Parking",
          "amenities.flooring": "Flooring Type",
          "amenities.enterFlooring": "e.g., Hardwood, Tiles",
          "amenities.heatingType": "Heating Type",
          "amenities.enterHeatingType": "e.g., Central heating, Gas",
          "amenities.energyTitle": "Energy Information",
          "amenities.energyCertificate": "Energy Certificate Status",
          "amenities.energyCertificateUntil": "Certificate Valid Until",
          "amenities.enterEnergyCertificateUntil": "e.g., 2030-12-31",
          "amenities.energyDemand": "Energy Demand",
          "amenities.enterEnergyDemand": "e.g., 85 kWh/(m²a)",
          "amenities.energyEfficiency": "Energy Efficiency Class",
          "amenities.enterEnergyEfficiency": "Select class",
          "amenities.mainEnergySource": "Main Energy Source",
          "amenities.enterMainEnergySource": "e.g., Natural Gas, Solar",
          "amenities.selectYes": "Yes",
          "amenities.selectNo": "No",
          "amenities.selectPlease": "Please select",
          "amenities.energyCertificate.availableAttached":
            "Available & Attached",
          "amenities.energyCertificate.inProgress": "In progress",
          "amenities.energyEfficiency.f": "F",
          "amenities.energyEfficiency.g": "G",

          // Dynamic Amenity Labels (Based on Object Type)
          "amenities.customLabel.house.p1": "Property Size (sqm)",
          "amenities.customLabel.house.p2": "Number of Floors",
          "amenities.customLabel.apartment.p1": "Floor",
          "amenities.customLabel.apartment.p2": "Number of Units",

          // ContactInfoStep translations
          "contactInfo.title": "Contact Information",
          "contactInfo.enterInfo": "Enter contact information for the property",
          "contactInfo.phoneNumber": "Phone Number",
          "contactInfo.enterPhoneNumber": "Enter phone number",
          "contactInfo.emailAddress": "Email Address",
          "contactInfo.enterEmailAddress": "Enter email address",
          "contactInfo.websiteName": "Website Name",
          "contactInfo.enterWebsiteName": "Enter website name",
          "contactInfo.brokerInfo": "Broker Information",
          "contactInfo.brokerName": "Broker Name",
          "contactInfo.enterBrokerName": "Enter broker name",
          "contactInfo.brokerFirmName": "Broker Firm Name",
          "contactInfo.enterBrokerFirmName": "Enter broker firm name",
          "contactInfo.brokerFirmAddress": "Broker Firm Address",
          "contactInfo.enterBrokerFirmAddress": "Enter broker firm address",

          // ReviewStep translations
          "review.title": "Review your information",
          "review.description":
            "Please review all information before submitting.",
          "review.basicInfo": "Basic Information",
          "review.descriptions": "Descriptions",
          "review.contactInfo": "Contact Information",
          "review.images": "Images",
          "review.notProvided": "Not provided",
          "review.title": "Title",
          "review.address": "Address",
          "review.price": "Price",
          "review.dateAvailable": "Date Available",
          "review.shortDescription": "Short Description",
          "review.sitePlanDescription": "Site Plan Description",
          "review.detailedDescription": "Detailed Description",
          "review.phoneNumber": "Phone Number",
          "review.emailAddress": "Email Address",
          "review.websiteName": "Website Name",
          "review.brokerFirmName": "Broker Firm Name",
          "review.brokerFirmAddress": "Broker Firm Address",

          // Project page translations
          "project.dataNotAvailable": "Project data not available",
          "project.untitledProject": "Untitled Project",
          "project.noAddress": "No address",
          "project.propertyInfo": "Property Info",
          "project.descriptions": "Descriptions",
          "project.images": "Images",
          "project.propertyTitle": "Property Title",
          "project.propertyAddress": "Property Address",
          "project.price": "Price",
          "project.dateAvailable": "Date Available",
          "project.phoneNumber": "Phone Number",
          "project.emailAddress": "Email Address",
          "project.website": "Website",
          "project.brokerFirmName": "Broker Firm Name",
          "project.brokerFirmAddress": "Broker Firm Address",
          "project.shortDescription": "Short Description",
          "project.briefDescriptionPlaceholder":
            "Brief description of the property",
          "project.layoutDescription": "Layout Description",
          "project.detailedLayoutPlaceholder":
            "Detailed layout description of the property",
          "project.detailedDescription": "Detailed Description",
          "project.comprehensiveDescriptionPlaceholder":
            "Comprehensive property description",
          "project.uploadImagesInfo":
            "Upload and manage images for your project. These images will be used in your brochure.",
          "project.propertyImages": "Property Images",
          "project.previous": "Previous",
          "project.saving": "Saving...",
          "project.saveChanges": "Save Changes",
          "project.next": "Next",
          "project.error": "Error",

          "imageUploader.saving": "Saving...",
          "imageUploader.saveChanges": "Save Changes",
          "imageUploader.saveButton": "Save",
          "imageUploader.reset": "Reset",

          // DocumentViewer translations
          "documentViewer.addImagesBeforeProcessing":
            "Please add at least one image before processing",
          "documentViewer.failedToProcessPresentation":
            "Failed to process presentation",
          "documentViewer.noProcessedDocument":
            "No processed document to download",
          "documentViewer.failedToDownloadPDF":
            "Failed to download presentation as PDF",
          "documentViewer.failedToUploadImage": "Failed to upload image",
          "documentViewer.imageReplacedSuccessfully":
            "Image replaced successfully",
          "documentViewer.failedToReplaceImage": "Failed to replace image",
          "documentViewer.edit": "Edit",
          "documentViewer.preview": "Preview",
          "documentViewer.generating": "Generating...",
          "documentViewer.generateBrochure": "Generate Brochure",
          "documentViewer.downloadPDF": "Download PDF",
          "documentViewer.editInFullscreen": "Edit in Fullscreen",
          "documentViewer.processingPresentation": "Processing presentation...",
          "documentViewer.presentationEditor": "Presentation Editor",
          "documentViewer.presentationPreview": "Presentation Preview",
          "documentViewer.noBrochurePreview": "No Brochure preview available.",
          "documentViewer.clickGenerateBrochure":
            'Click "Generate Brochure" to create a presentation with your data.',
          "documentViewer.exitFullScreen": "Exit Full Screen",
          "documentViewer.openInNewTab": "Open in New Tab",
          "documentViewer.openGoogleSlides": "Open Google Slides",

          // CommissionStep translations
          "commission.title": "Commission Details",
          "commission.enterInfo": "Specify buyer and seller commission.",
          "commission.buyer": "Buyer Commission",
          "commission.enterBuyer": "e.g., 3.57% incl. VAT",
          "commission.seller": "Seller Commission",
          "commission.enterSeller": "e.g., 3.57% incl. VAT",

          // New Descriptions Step translations
          "descriptions.title": "Property Descriptions",
          "descriptions.subtitle":
            "Enter detailed descriptions for your property",
          "descriptions.shortDescription": "Short Description",
          "descriptions.shortDescriptionPlaceholder":
            "Enter a brief overview of the property (1-2 sentences)",
          "descriptions.shortDescriptionHelp":
            "A concise summary that highlights the key features of the property",
          "descriptions.layoutDescription": "Layout Description",
          "descriptions.layoutDescriptionPlaceholder":
            "Describe the layout and floor plan of the property",
          "descriptions.layoutDescriptionHelp":
            "Focus on the arrangement of rooms, spatial flow, and building design",
          "descriptions.detailedDescription": "Detailed Description",
          "descriptions.detailedDescriptionPlaceholder":
            "Provide a comprehensive description of the property and its features",
          "descriptions.detailedDescriptionHelp":
            "Include details about amenities, special features, neighborhood, and what makes this property unique",

          // Error Messages
          "error.shortDescriptionRequired": "Short description is required",
          "basicInfo.selectCity": "Select City",
          "amenities.describeTV": "z.B. Kabel, Satellit vorhanden",
          "amenities.describeBalcony": "z.B. Südbalkon, Dachterrasse",
          "amenities.describeElevator": "z.B. Personenaufzug vorhanden",
          "amenities.describeGarage":
            "z.B. Tiefgaragenstellplatz, Außenstellplatz",
          "amenities.energyTitle": "Energieinformationen",
        },
      },
      de: {
        translation: {
          // Navigation
          features: "Funktionen",
          demo: "Demo",
          benefits: "Vorteile",
          faq: "FAQ",
          login: "Anmelden",
          pricing: "Preis",
          getStarted: "Jetzt registrieren",

          // Hero Section
          "hero.title": "Immobilien Exposés",
          "hero.subtitle": "vereinfacht",
          "hero.description":
            "Mit ExposeFlow erstellen Sie Immobilienexposés mit Hilfe von KI in Minuten",
          "hero.feature1":
            "Generieren Sie Exposés, die auf Ihren bisherigen Designs basieren",
          "hero.feature2":
            "Bearbeiten Sie nach der Erstellung die Exposés nach Ihren Vorstellungen",
          "hero.feature3":
            "Sparen Sie Zeit bei der Erstellung professioneller Marketing-Materialien",
          "hero.startCreating": "Jetzt registrieren",
          "hero.seeExamples": "Demo ansehen",

          // TrustedBy Section
          "trustedBy.title":
            "Renommierte Immobilienmakler vertrauen ExposeFlow",

          // Features Section
          "features.title": "Wie ExposeFlow funktioniert",
          "features.step1.title": "Immobiliendetails eingeben",
          "features.step1.description":
            "Laden Sie Ihre Immobilienfotos hoch und geben Sie Objektdaten als Datei oder über unser einfaches Formular ein",
          "features.step2.title": "KI generiert Inhalte",
          "features.step2.description":
            "Unsere KI erstellt einen Entwurf entsprechend Ihrer sonst verwendeten Vorlagen mit Fotos und Text",
          "features.step3.title": "Laden Sie Ihr Exposé herunter",
          "features.step3.description":
            "Vorschau anzeigen, bei Bedarf bearbeiten und Ihr einsatzbereites professionelles Exposé herunterladen",
          "features.getStarted": "Jetzt registrieren",

          // Tab Features
          "features.tabs.photoEnhancement": "Bildverbesserung",
          "features.tabs.aiText": "KI-gestützte Texterstellung",
          "features.tabs.templates": "Professionelle Vorlagen",
          "features.learnMore": "Mehr erfahren",
          "features.photoEnhancement.description":
            "Verbessern Sie Ihre Immobilienfotos automatisch mit KI-gestützten professionellen Filtern und Anpassungen. Unsere Technologie erkennt und verbessert Beleuchtung, Farben und Klarheit, um Ihre Angebote hervorzuheben.",
          "features.aiText.description":
            "Generieren Sie überzeugende Immobilienbeschreibungen automatisch mit fortschrittlicher KI-Technologie. Unser System erstellt ansprechende, präzise Inhalte, die die besten Merkmale Ihrer Immobilien hervorheben, ohne manuelle Texterstellung.",
          "features.aiText.imageAlt": "KI Texterstellung",
          "features.templates.description":
            "Wählen Sie aus einer Vielzahl professionell gestalteter Vorlagen für Ihre Exposés oder verwenden Sie Ihre bisherigen Designs. Unsere Sammlung von Layouts stellt sicher, dass Sie den perfekten Stil für jede Art von Immobilie finden.",
          "features.templates.imageAlt": "Professionelle Exposévorlagen",

          // Features Grid Section
          "features.grid.mainTitle": "Was uns unterscheidet",
          "features.grid.customBranding.title": "Individuelles Branding",
          "features.grid.customBranding.description":
            "Unser Team integriert Ihre bestehenden Designs direkt ins Tool.",
          "features.grid.photoEditing.title": "Integrierte Fotobearbeitung",
          "features.grid.photoEditing.description":
            "Bearbeiten Sie Bilder direkt im Tool für professionelle Exposés.",
          "features.grid.fullyCustomizable.title": "Vollständig anpassbar",
          "features.grid.fullyCustomizable.description":
            "Passen Sie Exposés nachträglich an – Text, Bilder und Layout.",
          "features.grid.pageSelection.title": "Seitenauswahl",
          "features.grid.pageSelection.description":
            "Wählen Sie gezielt aus, welche Sektionen im Exposé enthalten sein sollen.",
          "features.grid.options.title": "Vielfältige Vorlagen",
          "features.grid.options.description":
            "Wählen Sie aus einer Vielzahl professioneller Vorlagen.",
          "features.grid.automation.title": "Automatisierungen",
          "features.grid.automation.description":
            "Nutzen Sie Automatisierungen wie Kartenerstellung, um Zeit zu sparen.",

          // Demo Section
          "demo.title": "Sehen Sie ExposeFlow in Aktion",
          "demo.placeholder": "Video Demo Platzhalter",

          // Benefits Section
          "benefits.title": "Warum Sie ExposeFlow wählen sollten",
          "benefits.saveMoney.title": "Geld sparen",
          "benefits.saveMoney.description":
            "Keine teure Software und Fotobearbeitung erforderlich",
          "benefits.saveTime.title": "Zeit sparen",
          "benefits.saveTime.description":
            "Erstellen Sie Exposés in Minuten, nicht Stunden",
          "benefits.professional.title": "Professionelle Ergebnisse",
          "benefits.professional.description":
            "Beeindrucken Sie Kunden mit hochwertigen Materialien",

          // Testimonial Section
          "testimonial.quote":
            "Mit ExposeFlow kann ich deutlich einfacher ansprechende Exposés erstellen – ein echter Zeitsparer für mein Maklergeschäft! Die einfache Handhabung und die professionellen Designs sind besonders hilfreich. Ich habe die Möglichkeit, meine eigenen vorherigen Designs als Vorlagen zu nutzen.",
          "testimonial.name": "Franz Sorger",
          "testimonial.position": "Makler für Gastronomie-Immobilien",

          "faq.title": "Häufig gestellte Fragen",
          "faq.items.pricing.question": "Wie viel kostet ExposeFlow?",
          "faq.items.pricing.answer":
            "ExposeFlow befindet sich aktuell in einer kostenlosen Testphase, um mit dem Feedback von Testkunden eine gut funktionierende hilfreiche Softwarelösung für Immobilienmakler zu entwickeln. Zu einem späteren Zeitpunkt wird die Erstellung einen fairen Preis abgesprochen mit Nutzern bekommen - abgerechnet pro Nutzung.",
          "faq.items.branding.question":
            "Kann ich das Branding meiner Maklerfirma für die Erstellung nutzen?",
          "faq.items.branding.answer":
            "Ja, absolut. ExposeFlow ermöglicht es Ihnen nicht nur, Ihr Logo, individuelle Farben und andere Branding-Elemente hinzuzufügen, sondern unterstützt auch die Erstellung basierend auf Ihren sonst benutzten Designs. Buchen Sie dafür gerne einen Demo-Termin mit uns.",
          "faq.items.customize.question":
            "Kann ich die generierten Exposés anpassen?",
          "faq.items.customize.answer":
            "Ja, absolut. Nachdem unsere KI einen Vorschlag für Ihr Expose generiert, können Sie jeden Text bearbeiten, Bilder ändern, und das Layout anpassen. Sie haben vollständige Kontrolle über das Endergebnis.",
          "faq.items.formats.question":
            "In welchen Formaten kann ich meine Exposés herunterladen?",
          "faq.items.formats.answer":
            "Sie können Ihre Exposés als hochauflösende PDFs herunterladen. Wir arbeiten aktuell an der Möglichkeit, auch Webexposes zu unterstützen.",

          // Footer
          "footer.customerSupport": "Kundensupport",
          "footer.supportHours": "Mo-Fr / 9:00 - 17:00 Uhr",
          "footer.helpCenter": "Hilfecenter",
          "footer.copyright": "© {{year}} ExposeFlow",
          "footer.stayUpdated": "Bleiben Sie auf dem Laufenden mit ExposeFlow",
          "footer.newsletterDesc":
            "Erhalten Sie die neuesten Nachrichten, Updates und Tipps zur Erstellung von erstklassigen Immobilienexposés.",
          "footer.emailPlaceholder": "Ihre E-Mail-Adresse",
          "footer.subscribe": "Abonnieren",
          "footer.thankYou": "Vielen Dank für Ihr Abonnement!",
          "footer.subscriptionSuccess":
            "Sie wurden erfolgreich zu unserer Newsletter-Liste hinzugefügt!",
          "footer.companyDesc":
            "KI-gestützte Exposéerstellung für Immobilienmakler.",
          "footer.navigation": "Navigation",
          "footer.features": "Funktionen",
          "footer.demos": "Demos",
          "footer.benefits": "Vorteile",
          "footer.faq": "FAQ",
          "footer.legal": "Rechtliches",
          "footer.terms": "Nutzungsbedingungen",
          "footer.privacy": "Datenschutz",
          "footer.imprint": "Impressum",
          "footer.getStarted": "Loslegen",
          "footer.login": "Anmelden",
          "footer.pricing": "Preise",
          "footer.register": "Registrieren",
          "footer.contact": "Kontakt",
          "footer.product": "Produkt",
          "footer.company": "Unternehmen",
          "footer.howItWorks": "Wie es funktioniert",
          "footer.about": "Über uns",
          "footer.privacyPolicy": "Datenschutzerklärung",
          "footer.termsOfService": "Nutzungsbedingungen",
          "footer.updates": "Updates",

          // CTA Section
          "cta.title": "Bereit, Ihr Immobilienmarketing zu transformieren?",
          "cta.description":
            "Schließen Sie sich Immobilienmaklern an, die bereits mit unserer KI-gestützten Exposé-Erstellung Zeit sparen und ansprechende, hochwertige Marketingmaterialien erstellen.",
          "cta.trustedBy": "Vertraut von:",
          "cta.startToday": "Starten Sie noch heute",
          "cta.signUp":
            "Melden Sie sich in 60 Sekunden an und erstellen Sie Ihr erstes Exposé kostenlos.",
          "cta.getStartedFree": "Jetzt starten — Es ist kostenlos",
          "cta.noCredit": "Keine Kreditkarte erforderlich",
          "cta.bookDemo": "Demo vereinbaren",
          "cta.bookDemoDescription":
            "Buchen Sie einen 30-minütigen Termin mit unserem Team.",
          "cta.scheduleButton": "Termin aussuchen",

          // Authentication pages
          "auth.signup.title": "Konto erstellen",
          "auth.signup.email": "E-Mail-Adresse",
          "auth.signup.password": "Passwort erstellen",
          "auth.signup.button": "Registrieren",
          "auth.signup.loading": "Registrierung...",
          "auth.signup.emailPlaceholder": "Ihre E-Mail-Adresse",
          "auth.signup.passwordPlaceholder":
            "Erstellen Sie ein sicheres Passwort",
          "auth.signup.haveAccount": "Haben Sie bereits ein Konto?",
          "auth.signup.signIn": "Anmelden",
          "auth.signup.backToHome": "Zurück zur Startseite",

          "auth.signin.title": "Anmelden",
          "auth.signin.email": "E-Mail-Adresse",
          "auth.signin.password": "Passwort",
          "auth.signin.button": "Anmelden",
          "auth.signin.loading": "Anmeldung...",
          "auth.signin.emailPlaceholder": "Ihre E-Mail-Adresse",
          "auth.signin.passwordPlaceholder": "Ihr Passwort",
          "auth.signin.forgotPassword": "Passwort vergessen?",
          "auth.signin.noAccount": "Sie haben noch kein Konto?",
          "auth.signin.signup": "Registrieren",
          "auth.signin.backToHome": "Zurück zur Startseite",

          // Dashboard Section
          "dashboard.title": "Dashboard",
          "dashboard.subtitle":
            "Erstellen und verwalten Sie Ihre Immobilienexposés",
          "dashboard.credits": "Guthaben",
          "dashboard.buyCredits": "Guthaben kaufen",
          "dashboard.createBrochure": "Neues Exposé erstellen",
          "dashboard.loading": "Dashboard wird geladen...",
          "dashboard.settingUp": "Konto wird eingerichtet...",
          "dashboard.menu": "Menü",
          "dashboard.myBrochures": "Meine Exposés",
          "dashboard.accountSettings": "Kontoeinstellungen",
          "dashboard.billing": "Abrechnung",
          "dashboard.signOut": "Abmelden",

          "templateSelector.noPreview": "Keine Vorschau verfügbar",
          "templateSelector.classicColorless.name":
            "Klassische Farblose Vorlage",
          "templateSelector.classicColorless.description":
            "Schlichter, farbloser Entwurf, ideal für den Druck",
          "templateSelector.classic.name": "Klassische Vorlage",
          "templateSelector.classic.description":
            "Traditionelles Design mit dezenten grauen Akzenten",
          "templateSelector.colorful.name": "Farbige Vorlage",
          "templateSelector.colorful.description":
            "Lebendige Vorlage mit warmen Brauntönen",

          "templateSelector.viewAllTemplates": "Alle Vorlagen anzeigen",
          "templateSelector.allTemplates": "Alle Vorlagen",

          "brochures.title": "Meine Exposés",
          "brochures.subtitle":
            "Ansicht und Verwaltung Ihrer Immobilienexposés",
          "brochures.createNew": "Neues Exposé erstellen",
          "brochures.yourBrochures": "Ihre Exposés",
          "brochures.noBrochuresYet": "Sie haben noch keine Exposés erstellt",
          "brochures.createFirstDescription":
            "Erstellen Sie Ihr erstes professionelles Immobilienexposé mit unseren einfachen KI-Vorlagen",
          "brochures.createFirstButton": "Erstellen Sie Ihr erstes Exposé",

          // Billing Page
          "billing.mustBeLoggedIn":
            "Sie müssen angemeldet sein, um Kredite zu kaufen",
          "billing.invalidPackage": "Ungültiges Paket ausgewählt",
          "billing.purchaseSuccess": "{{credits}} Kredite erfolgreich gekauft!",
          "billing.purchaseFailed":
            "Fehler beim Verarbeiten Ihrer Bestellung. Bitte versuchen Sie es erneut.",
          "billing.loading": "Wird geladen...",
          "billing.title": "Abrechnung & Guthaben",
          "billing.subtitle":
            "Kredite kaufen, um Exposés zu erstellen und Premium-Funktionen zu verwenden",
          "billing.currentBalance": "Aktuelles Guthaben",
          "billing.credits": "Kredite",
          "billing.costPerBrochure":
            "Jedes Exposé kostet 1 Kredit zum Generieren",
          "billing.buyMoreCredits": "Mehr Kredite kaufen",
          "billing.creditPackages": "Kreditpakete",
          "billing.choosePackage":
            "Wählen Sie ein Paket, das zu Ihren Bedürfnissen passt",
          "billing.mostPopular": "Am Beliebtesten",
          "billing.bestValue": "Bestes Wert",
          "billing.whatsIncluded": "Was ist enthalten",
          "billing.justPerCredit": "Nur ${{price}} pro Kredit",
          "billing.processing": "Wird verarbeitet...",
          "billing.purchaseNow": "Jetzt kaufen",
          "billing.howCreditsWork": "Wie Kredite funktionieren",
          "billing.purchaseCredits": "Kredite kaufen",
          "billing.purchaseCreditsDesc":
            "Kreditpakete kaufen, die am besten zu Ihren Bedürfnissen passen.",
          "billing.createBrochures": "Exposés erstellen",
          "billing.createBrochuresDesc":
            "1 Kredit für jedes Exposé, das Sie generieren.",
          "billing.noExpiration": "Keine Ablaufzeit",
          "billing.noExpirationDesc":
            "Ihre Kredite verfallen nie und können jederzeit verwendet werden.",

          // Account Page
          "account.fillAllFields":
            "Bitte füllen Sie alle erforderlichen Felder korrekt aus",
          "account.savingInfo": "Informationen werden gespeichert...",
          "account.saveFailed":
            "Informationen konnten nicht gespeichert werden",
          "account.profileUpdated": "Profil erfolgreich aktualisiert",
          "account.profileCompleted":
            "Profil erfolgreich abgeschlossen! Umleitung zur Dashboard...",
          "account.unexpectedError": "Ein unerwarteter Fehler ist aufgetreten",
          "account.settings": "Kontoeinstellungen",
          "account.completeProfile": "Profil vollständig ausfüllen",
          "account.manageProfile": "Profilinformationen verwalten",
          "account.beforeCreate":
            "Bevor Sie Exposés erstellen können, benötigen wir einige grundlegende Informationen über Sie",
          "account.backToDashboard": "Zurück zum Dashboard",
          "account.brokerProfileInfo": "Maklerprofilinformationen",
          "account.infoForBrochures":
            "Diese Informationen werden in Ihren Immobilienexposés und Vorlagen verwendet.",
          "account.companyLogo": "Firmenlogo",
          "account.brokerPhoto": "Maklerfoto",
          "account.remove": "Entfernen",
          "account.logoRequired": "Geschäftslogo ist erforderlich",
          "account.photoRequired": "Maklerfoto ist erforderlich",
          "account.contactInfo": "Kontaktinformationen",
          "account.brokerName": "Maklername",
          "account.companyName": "Firmenname",
          "account.emailAddress": "E-Mail-Adresse",
          "account.phoneNumber": "Telefonnummer",
          "account.faxNumber": "Faxnummer",
          "account.website": "Webseite",
          "account.address": "Adresse",
          "account.optional": "optional",
          "account.brokerNamePlaceholder": "John Smith",
          "account.companyNamePlaceholder": "Real Estate Company LLC",
          "account.emailPlaceholder": "john@realestate.com",
          "account.phonePlaceholder": "+1 (123) 456-7890",
          "account.faxPlaceholder": "+1 (123) 456-7891",
          "account.websitePlaceholder": "www.yourcompany.com",
          "account.addressPlaceholder":
            "123 Main Street, Apt 4B, New York, NY 10001",
          "account.websiteNote": "Geben Sie Ihre Webseite ein",
          "account.addressNote":
            "Geben Sie die vollständige Adresse ein: Straßenname, Hausnummer, PLZ-Code und Stadt",
          "account.validEmailRequired":
            "Gültige E-Mail-Adresse ist erforderlich",
          "account.phoneRequired": "Telefonnummer ist erforderlich",
          "account.websiteRequired": "Webseite ist erforderlich",
          "account.saveProfileInfo": "Profilinformationen speichern",

          // Form Steps
          "formSteps.template.title": "Vorlage",
          "formSteps.template.description": "Vorlage auswählen",
          "formSteps.pages.title": "Seiten",
          "formSteps.pages.description": "Seiten auswählen",
          "formSteps.basicInfo.title": "Basisinfos",
          "formSteps.basicInfo.description": "Basisinfos eingeben",
          "formSteps.descriptions.title": "Beschreibungen",
          "formSteps.descriptions.description":
            "Immobilienbeschreibungen eingeben",
          "formSteps.images.title": "Bilder",
          "formSteps.images.description": "Bilder hochladen",
          "formSteps.amenities.title": "Ausstattung",
          "formSteps.amenities.description": "Ausstattung hinzufügen",
          "formSteps.commission.title": "Provision",
          "formSteps.commission.description": "Provisionsdetails eingeben",
          "formSteps.contactInfo.title": "Kontakt",
          "formSteps.contactInfo.description": "Kontaktinfos hinzufügen",
          "formSteps.review.title": "Überprüfung",
          "formSteps.review.description": "Projekt überprüfen",

          "imageUploader.saving": "Wird gespeichert...",
          "imageUploader.saveChanges": "Änderungen speichern",
          "imageUploader.saveButton": "Speichern", // <-- Neuer Eintrag
          "imageUploader.reset": "Zurücksetzen",

          // Form Navigation
          "form.previous": "Zurück",
          "form.next": "Weiter",
          "form.createBrochure": "Exposé erstellen",
          "form.creating": "Wird erstellt...",

          // Form Validation Errors
          "error.selectTemplate":
            "Bitte wählen Sie eine Vorlage aus, um fortzufahren",
          "error.selectPages": "Bitte wählen Sie Seiten aus, um fortzufahren",
          "error.titleRequired": "Projekttitel ist erforderlich",
          "error.loginRequired":
            "Sie müssen angemeldet sein, um ein Projekt zu erstellen",
          "error.objectTypeRequired": "Bitte wählen Sie eine Objektart aus",
          "error.offerTypeRequired": "Bitte wählen Sie eine Angebotsart aus",

          // API Error Messages
          "api.connectionFailed": "API-Verbindung fehlgeschlagen.",
          "api.keyMissing":
            "OpenRouter API-Schlüssel fehlt. Bitte fügen Sie ihn zu Ihrer .env-Datei hinzu.",
          "api.keyInvalidFormat":
            "OpenRouter API-Schlüssel hat ein ungültiges Format. Er sollte mit 'sk-or-v1-' beginnen.",
          "api.keyInvalid":
            "Ungültiger OpenRouter API-Schlüssel. Bitte überprüfen Sie Ihre Anmeldedaten.",
          "api.rateLimit":
            "OpenRouter API-Ratenlimit überschritten. Bitte versuchen Sie es später erneut.",
          "api.networkError":
            "Netzwerkfehler bei der Verbindung zur OpenRouter API. Überprüfen Sie Ihre Internetverbindung.",
          "api.verifyFailed": "API-Verbindung konnte nicht verifiziert werden",

          // Document Processing
          "document.extracting": "Immobilieninformationen werden extrahiert...",
          "document.extractFailed":
            "Informationen konnten nicht aus dem Dokument extrahiert werden",
          "document.extractSuccess": "{{count}} Feld erfolgreich extrahiert",
          "document.extractSuccess_plural":
            "{{count}} Felder erfolgreich extrahiert",
          "document.missingFields":
            "Einige wichtige Felder konnten nicht extrahiert werden: {{fields}}. Bitte füllen Sie diese manuell aus.",
          "document.noFieldsExtracted":
            "Es konnten keine Felder aus dem Dokument extrahiert werden. Bitte füllen Sie die Felder manuell aus.",

          // Add the BasicInfo translations
          "basicInfo.documentTitle": "Immobiliendaten hochladen",
          "basicInfo.uploadInstructions":
            "Laden Sie ein Dokument hoch oder fügen Sie Text ein, um Immobilieninformationen zu extrahieren",
          "basicInfo.clickToUpload": "Klicken zum Hochladen",
          "basicInfo.dragDrop": "oder per Drag & Drop",
          "basicInfo.supportedFormats": "DOCX, TXT, RTF",
          "basicInfo.orPaste": "Oder Text unten einfügen",
          "basicInfo.pasteHere": "Immobiliendaten hier einfügen...",
          "basicInfo.processing": "Wird verarbeitet...",
          "basicInfo.extractInfo": "Informationen extrahieren",
          "basicInfo.requiredInfo": "Erforderliche Informationen",
          "basicInfo.fillEdit":
            "Füllen Sie die folgenden Informationen aus oder bearbeiten Sie sie",
          "basicInfo.propertyTitle": "Immobilientitel",
          "basicInfo.aiFilled": "KI-ausgefüllt",
          "basicInfo.enterTitle": "Immobilientitel eingeben",
          "basicInfo.address": "Adresse",
          "basicInfo.enterAddress": "Immobilienadresse eingeben",
          "basicInfo.shortDescription": "Kurzbeschreibung",
          "basicInfo.enterShortDescription":
            "Geben Sie eine kurze Beschreibung ein",
          "basicInfo.price": "Preis",
          "basicInfo.enterPrice": "Immobilienpreis eingeben",
          "basicInfo.dateAvailable": "Verfügbarkeitsdatum",
          "basicInfo.enterDateAvailable": "Verfügbarkeitsdatum eingeben",
          "basicInfo.sitePlanDescription": "Lageplan-Beschreibung",
          "basicInfo.enterSitePlanDescription":
            "Lageplan-Beschreibung eingeben",
          "basicInfo.detailedDescription": "Detaillierte Beschreibung",
          "basicInfo.enterDetailedDescription":
            "Detaillierte Immobilienbeschreibung eingeben",
          "basicInfo.regenerateCriticalFields":
            "Kritische Felder neu generieren",

          "basicInfo.addressStreet": "Straße",
          "basicInfo.addressHouseNr": "Hausnr.",
          "basicInfo.addressPlz": "PLZ",
          "basicInfo.addressCity": "Ort",
          "basicInfo.enterAddressStreet": "Straßennamen eingeben",
          "basicInfo.enterAddressHouseNr": "Hausnr eingeben",
          "basicInfo.enterAddressPlz": "PLZ eingeben",
          "basicInfo.enterAddressCity": "Ort eingeben",
          "basicInfo.objectType": "Objektart",
          "basicInfo.selectObjectType": "Objektart auswählen",
          "objectType.apartment": "Wohnung",
          "objectType.family_house": "Einfamilienhaus",
          "basicInfo.offerType": "Angebotsart",
          "basicInfo.selectOfferType": "Angebotsart auswählen",
          "offerType.for_sale": "Zum Verkauf",
          "offerType.for_rent": "Zur Miete",
          "basicInfo.constructionYear": "Baujahr",
          "basicInfo.enterConstructionYear": "Baujahr eingeben",
          "basicInfo.maintenanceFees": "Nebenkosten",
          "basicInfo.enterMaintenanceFees":
            "Nebenkosten eingeben (z.B. 200 €/Monat)",

          "imagesStep.buildingLayoutMapDesc":
            "Karte des Standortes der Immobilie",
          "imagesStep.orUploadManually":
            "Oder laden Sie manuell ein Bild hoch:",
          "maps.loading": "Karte wird geladen...",
          "maps.retry": "Erneut versuchen",
          "maps.updateImage": "Bild aktualisieren",
          "maps.locationMap": "Immobilien-Lagenplan",
          "maps.missingData": "Adresse oder API-Schlüssel fehlt",
          "maps.loadError": "Google Maps konnte nicht geladen werden",
          "maps.geocodeError":
            "Standort konnte auf der Karte nicht gefunden werden",
          "maps.captureError": "Kartenbild konnte nicht erstellt werden",

          // Pages selection translations for German
          "pagesSelection.title": "Einzuschließende Seiten",
          "pagesSelection.description":
            "Wählen Sie aus, welche Seiten in Ihr Exposé aufgenommen werden sollen",
          "pagesSelection.images": "Bilder",
          "pagesSelection.image": "Bild",
          "pages.projectOverview": "Titelseite",
          "pages.cityDescription": "Seite über Stadt",
          "pages.buildingLayout": "Lagebeschreibung",
          "pages.amenities": "Ausstattungsdetails",
          "pages.description": "Beschreibung",
          "pages.exteriorPhotos": "Außenaufnahmen",
          "pages.interiorPhotos": "Innenaufnahmen",
          "pages.floorPlan": "Grundriss",
          "pages.energyCertificate": "Auszug aus dem Energieausweis",
          "pages.termsConditions": "Widerrufserklärung",

          // ImagesStep translations in German
          "imagesStep.companyLogo": "Firmenlogo",
          "imagesStep.companyLogoDesc":
            "Laden Sie Ihr Firmenlogo hoch, das auf allen Seiten erscheinen wird",
          "imagesStep.agentPhoto": "Foto des Maklers",
          "imagesStep.agentPhotoDesc":
            "Laden Sie ein professionelles Foto des Maklers hoch",
          "imagesStep.projectOverview": "Projektübersichtsbild",
          "imagesStep.projectOverviewDesc":
            "Laden Sie das Hauptprojektbild hoch",
          "imagesStep.buildingLayout": "Lageplan",
          "imagesStep.buildingLayoutDesc": "Laden Sie den Gebäudeplan hoch",
          "imagesStep.exteriorPhotos": "Außenaufnahmen",
          "imagesStep.exteriorPhotosDesc":
            "Laden Sie Außenaufnahmen der Immobilie hoch (max. 2)",
          "imagesStep.exteriorPhoto1": "Außenaufnahme 1",
          "imagesStep.exteriorPhoto2": "Außenaufnahme 2",
          "imagesStep.interiorPhotos": "Innenaufnahmen",
          "imagesStep.interiorPhotosDesc":
            "Laden Sie Innenaufnahmen der Immobilie hoch (max. 2)",
          "imagesStep.interiorPhoto1": "Innenaufnahme 1",
          "imagesStep.interiorPhoto2": "Innenaufnahme 2",
          "imagesStep.floorPlan": "Grundriss",
          "imagesStep.floorPlanDesc": "Laden Sie das Grundrissbild hoch",
          "imagesStep.energyCertificate": "Energieausweis",
          "imagesStep.energyCertificateDesc":
            "Laden Sie die Bilder des Energieausweises hoch (max. 2)",
          "imagesStep.energyPage1": "Energieausweis Seite 1",
          "imagesStep.energyPage2": "Energieausweis Seite 2",
          "imagesStep.uploadInfo":
            "Laden Sie Bilder für Ihre ausgewählten Seiten hoch. Das System wird sie automatisch in Ihrem Exposé anordnen.",

          // ImageUploader translations in German
          "imageUploader.addImage": "Bild hinzufügen",
          "imageUploader.uploading": "Wird hochgeladen...",
          "imageUploader.dropHere":
            "Datei hier ablegen oder klicken zum Durchsuchen",
          "imageUploader.uploadImages": "Immobilienbilder hochladen",
          "imageUploader.dragAndDrop":
            "Klicken Sie hier, um ein Bild hochzuladen",
          "imageUploader.supportedFormats":
            "Unterstützte Formate: JPG, PNG, WEBP • Maximale Größe: 5MB",
          "imageUploader.edit": "Bearbeiten",
          "imageUploader.remove": "Entfernen",
          "imageUploader.enhanceImage": "Bild verbessern",
          "imageUploader.enhanceTip":
            "Beleuchtung im Bild erhöhen. Klicken Sie bei Bedarf auf Zurücksetzen",
          "imageUploader.enhancing": "Bild wird verbessert...",
          "imageUploader.saving": "Bild wird gespeichert...",
          "imageUploader.saveChanges": "Änderungen speichern",
          "imageUploader.reset": "Zurücksetzen",
          "imageUploader.adjustments": "Anpassungen",
          "imageUploader.brightness": "Helligkeit",
          "imageUploader.contrast": "Kontrast",
          "imageUploader.blurAreas": "Unschärfebereiche",
          "imageUploader.drawingMode": "Zeichenmodus",
          "imageUploader.selectMode": "Auswahlmodus",
          "imageUploader.blurStrength": "Unschärfestärke",
          "imageUploader.blurInstructions1":
            "Klicken und ziehen Sie, um Unschärfebereiche zu zeichnen",
          "imageUploader.blurInstructions2":
            "Doppelklicken Sie auf einen Bereich, um ihn zu entfernen",
          "imageUploader.clearBlur": "Alle Unschärfebereiche löschen",
          "imageUploader.editBeforeUpload": "Vor dem Hochladen bearbeiten",

          // AmenitiesStep translations in German
          "amenities.title": "Ausstattungsdaten",
          "amenities.enterInfo":
            "Geben Sie Details zur Immobilie und deren Ausstattung ein.",
          "amenities.shortDescription": "Kurzbeschreibung",
          "amenities.enterShortDescription":
            "Geben Sie eine kurze Beschreibung der wichtigsten Ausstattungsmerkmale ein",
          "amenities.additionalFeatures": "Zusätzliche Ausstattungsdetails",
          "amenities.enterAdditionalFeatures":
            "Geben Sie zusätzliche Informationen zu Ausstattungsmerkmalen der Immobilie ein",
          "amenities.detailsTitle": "Objektdetails",
          "amenities.floor": "Etage",
          "amenities.enterFloor": "z.B. 3. OG, Erdgeschoss",
          "amenities.numberUnits": "Anzahl Einheiten",
          "amenities.enterNumberUnits": "z.B. 10",
          "amenities.propertyArea": "Grundstücksfläche",
          "amenities.enterPropertyArea": "z.B. 1500 m²",
          "amenities.numberFloors": "Anzahl Etagen",
          "amenities.enterNumberFloors": "z.B. 5",
          "amenities.livingArea": "Wohnfläche",
          "amenities.enterLivingArea": "z.B. 120 m²",
          "amenities.renovations": "Letzte Renovierung",
          "amenities.enterRenovations": "z.B. 2022, Kernsanierung",
          "amenities.numberRooms": "Anzahl Zimmer",
          "amenities.enterNumberRooms": "z.B. 4",
          "amenities.numberBedrooms": "Anzahl Schlafzimmer",
          "amenities.enterNumberBedrooms": "z.B. 2",
          "amenities.numberBathrooms": "Anzahl Badezimmer",
          "amenities.enterNumberBathrooms": "z.B. 1,5",
          "amenities.numberKitchens": "Anzahl Küchen",
          "amenities.enterNumberKitchens": "z.B. 1",
          "amenities.featuresTitle": "Ausstattung",
          "amenities.tv": "TV-Anschluss",
          "amenities.balconyTerrace": "Balkon/Terrasse",
          "amenities.elevator": "Aufzug",
          "amenities.garage": "Garage/Stellplatz",
          "amenities.flooring": "Bodenbelag",
          "amenities.enterFlooring": "z.B. Parkett, Fliesen",
          "amenities.heatingType": "Heizungsart",
          "amenities.enterHeatingType": "z.B. Zentralheizung, Gas",
          "amenities.energyTitle": "Energieinformationen",
          "amenities.energyCertificate": "Energieausweis-Status",
          "amenities.energyCertificateUntil": "Ausweis gültig bis",
          "amenities.enterEnergyCertificateUntil": "z.B. 31.12.2030",
          "amenities.energyDemand": "Energiebedarf",
          "amenities.enterEnergyDemand": "z.B. 85 kWh/(m²a)",
          "amenities.energyEfficiency": "Energieeffizienzklasse",
          "amenities.enterEnergyEfficiency": "Klasse auswählen",
          "amenities.mainEnergySource": "Wesentlicher Energieträger",
          "amenities.enterMainEnergySource": "z.B. Erdgas, Solar",
          "amenities.selectYes": "Ja",
          "amenities.selectNo": "Nein",
          "amenities.selectPlease": "Bitte auswählen",
          "amenities.energyCertificate.availableAttached":
            "Vorhanden & beigefügt",
          "amenities.energyCertificate.inProgress": "In Bearbeitung",
          "amenities.energyEfficiency.f": "F",
          "amenities.energyEfficiency.g": "G",

          // Dynamic Amenity Labels (Based on Object Type)
          "amenities.customLabel.house.p1": "Grundstücksgröße",
          "amenities.customLabel.house.p2": "Anzahl Etagen",
          "amenities.customLabel.apartment.p1": "Etage",
          "amenities.customLabel.apartment.p2": "Anzahl Wohneinheiten",

          // ContactInfoStep translations in German
          "contactInfo.title": "Kontaktinformationen",
          "contactInfo.enterInfo":
            "Geben Sie Kontaktinformationen für die Immobilie ein",
          "contactInfo.phoneNumber": "Telefonnummer",
          "contactInfo.enterPhoneNumber": "Telefonnummer eingeben",
          "contactInfo.emailAddress": "E-Mail-Adresse",
          "contactInfo.enterEmailAddress": "E-Mail-Adresse eingeben",
          "contactInfo.websiteName": "Webseite",
          "contactInfo.enterWebsiteName": "Webseite eingeben",
          "contactInfo.brokerInfo": "Maklerinformationen",
          "contactInfo.brokerName": "Maklername",
          "contactInfo.enterBrokerName": "Maklernamen eingeben",
          "contactInfo.brokerFirmName": "Name der Maklerfirma",
          "contactInfo.enterBrokerFirmName": "Namen der Maklerfirma eingeben",
          "contactInfo.brokerFirmAddress": "Adresse der Maklerfirma",
          "contactInfo.enterBrokerFirmAddress":
            "Adresse der Maklerfirma eingeben",

          // ReviewStep translations in German
          "review.title": "Informationen überprüfen",
          "review.description":
            "Bitte überprüfen Sie alle Informationen vor dem Absenden.",
          "review.basicInfo": "Grundlegende Informationen",
          "review.descriptions": "Beschreibungen",
          "review.contactInfo": "Kontaktinformationen",
          "review.images": "Bilder",
          "review.notProvided": "Nicht angegeben",
          "review.title": "Titel",
          "review.address": "Adresse",
          "review.price": "Preis",
          "review.dateAvailable": "Verfügbarkeitsdatum",
          "review.shortDescription": "Kurzbeschreibung",
          "review.sitePlanDescription": "Lageplan-Beschreibung",
          "review.detailedDescription": "Detaillierte Beschreibung",
          "review.phoneNumber": "Telefonnummer",
          "review.emailAddress": "E-Mail-Adresse",
          "review.websiteName": "Webseite",
          "review.brokerFirmName": "Name der Maklerfirma",
          "review.brokerFirmAddress": "Adresse der Maklerfirma",

          // Project page translations
          "project.dataNotAvailable": "Projektdaten nicht verfügbar",
          "project.untitledProject": "Unbenanntes Projekt",
          "project.noAddress": "Keine Adresse",
          "project.propertyInfo": "Immobilieninformationen",
          "project.descriptions": "Beschreibungen",
          "project.images": "Bilder",
          "project.propertyTitle": "Immobilientitel",
          "project.propertyAddress": "Immobilienadresse",
          "project.price": "Preis",
          "project.dateAvailable": "Verfügbarkeitsdatum",
          "project.phoneNumber": "Telefonnummer",
          "project.emailAddress": "E-Mail-Adresse",
          "project.website": "Webseite",
          "project.brokerFirmName": "Name der Maklerfirma",
          "project.brokerFirmAddress": "Adresse der Maklerfirma",
          "project.shortDescription": "Kurzbeschreibung",
          "project.briefDescriptionPlaceholder":
            "Kurze Beschreibung der Immobilie",
          "project.layoutDescription": "Lagebeschreibung",
          "project.detailedLayoutPlaceholder":
            "Detaillierte Lagebeschreibung der Immobilie",
          "project.detailedDescription": "Detaillierte Beschreibung",
          "project.comprehensiveDescriptionPlaceholder":
            "Umfassende Immobilienbeschreibung",
          "project.uploadImagesInfo":
            "Laden Sie Bilder für Ihr Projekt hoch und verwalten Sie sie. Diese Bilder werden in Ihrem Exposé verwendet.",
          "project.propertyImages": "Immobilienbilder",
          "project.previous": "Zurück",
          "project.saving": "Wird gespeichert...",
          "project.saveChanges": "Änderungen speichern",
          "project.next": "Weiter",
          "project.error": "Fehler",

          // DocumentViewer translations
          "documentViewer.addImagesBeforeProcessing":
            "Bitte fügen Sie mindestens ein Bild hinzu, bevor Sie fortfahren",
          "documentViewer.failedToProcessPresentation":
            "Fehler bei der Verarbeitung der Präsentation",
          "documentViewer.noProcessedDocument":
            "Kein verarbeitetes Dokument zum Herunterladen",
          "documentViewer.failedToDownloadPDF":
            "Fehler beim Herunterladen der Präsentation als PDF",
          "documentViewer.failedToUploadImage":
            "Fehler beim Hochladen des Bildes",
          "documentViewer.imageReplacedSuccessfully":
            "Bild erfolgreich ersetzt",
          "documentViewer.failedToReplaceImage":
            "Fehler beim Ersetzen des Bildes",
          "documentViewer.edit": "Bearbeiten",
          "documentViewer.preview": "Vorschau",
          "documentViewer.generating": "Wird generiert...",
          "documentViewer.generateBrochure": "Exposé erstellen",
          "documentViewer.downloadPDF": "PDF herunterladen",
          "documentViewer.editInFullscreen": "Im Vollbildmodus bearbeiten",
          "documentViewer.processingPresentation":
            "Präsentation wird verarbeitet...",
          "documentViewer.presentationEditor": "Präsentationseditor",
          "documentViewer.presentationPreview": "Präsentationsvorschau",
          "documentViewer.noBrochurePreview": "Keine Exposévorschau verfügbar.",
          "documentViewer.clickGenerateBrochure":
            'Klicken Sie auf "Exposé erstellen", um eine Präsentation mit Ihren Daten zu erstellen.',
          "documentViewer.exitFullScreen": "Vollbildmodus beenden",
          "documentViewer.openInNewTab": "In neuem Tab öffnen",
          "documentViewer.openGoogleSlides": "Google Präsentationen öffnen",

          // CommissionStep translations in German
          "commission.title": "Provisionsdetails",
          "commission.enterInfo":
            "Geben Sie die Käufer- und Verkäuferprovision an.",
          "commission.buyer": "Käuferprovision",
          "commission.enterBuyer": "z.B. 3,57% inkl. MwSt.",
          "commission.seller": "Verkäuferprovision",
          "commission.enterSeller": "z.B. 3,57% inkl. MwSt.",

          "descriptions.generating": "Werden generiert...",
          "descriptions.generateButton": "Beschreibungen generieren",
          "descriptions.generationSuccess":
            "Beschreibungen erfolgreich generiert",
          "descriptions.generationFailed":
            "Fehler beim Generieren der Beschreibungen",

          // New Descriptions Step translations
          "descriptions.title": "Immobilienbeschreibungen",
          "descriptions.subtitle":
            "Geben Sie detaillierte Beschreibungen für Ihre Immobilie ein",
          "descriptions.shortDescription": "Kurzbeschreibung",
          "descriptions.shortDescriptionPlaceholder":
            "Geben Sie eine kurze Übersicht der Immobilie ein (1-2 Sätze)",
          "descriptions.shortDescriptionHelp":
            "Eine prägnante Zusammenfassung, die die wichtigsten Merkmale der Immobilie hervorhebt",
          "descriptions.layoutDescription": "Lagebeschreibung",
          "descriptions.layoutDescriptionPlaceholder":
            "Beschreiben Sie die Lage der Immobilie",
          "descriptions.layoutDescriptionHelp":
            "Konzentrieren Sie sich auf die Anordnung der Räume, den Raumfluss und das Gebäudedesign",
          "descriptions.detailedDescription": "Ausführliche Beschreibung",
          "descriptions.detailedDescriptionPlaceholder":
            "Bieten Sie eine umfassende Beschreibung der Immobilie und ihrer Eigenschaften",
          "descriptions.detailedDescriptionHelp":
            "Fügen Sie Details zu Ausstattung, besonderen Merkmalen, Umgebung und was diese Immobilie einzigartig macht hinzu",

          // Error Messages
          "error.shortDescriptionRequired": "Kurzbeschreibung ist erforderlich",
          "basicInfo.selectCity": "Ort auswählen",
          "amenities.describeTV": "z.B. Kabel, Satellit vorhanden",
          "amenities.describeBalcony": "z.B. Südbalkon, Dachterrasse",
          "amenities.describeElevator": "z.B. Personenaufzug vorhanden",
          "amenities.describeGarage":
            "z.B. Tiefgaragenstellplatz, Außenstellplatz",
          "amenities.energyTitle": "Energieinformationen",
        },
      },
    },
  });

  return i18n;
};

// Helper function to force reload all translations
export const forceReloadTranslations = async (lang) => {
  if (i18n.isInitialized) {
    try {
      await i18n.reloadResources();
      return true;
    } catch (error) {
      return true;
    }
  } else {
    return true;
  }
};

// Initialize immediately to make i18n available
initI18n();

// Export initialized instance for components to use
export default i18n;

// Export the initialization function for providers to await if needed
export { initI18n };
