"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { toast } from "react-hot-toast";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ImageUploader from "@/components/ImageUploader";
import { useTranslation } from "react-i18next";
import i18n, { forceReloadTranslations } from "@/app/i18n";
import type { Session, SupabaseClient } from "@supabase/supabase-js";

interface AccountFormData {
  logo_url: string;
  broker_photo_url: string;
  phone_number: string;
  email_address: string;
  website_name: string;
  broker_name: string;
  company_name: string;
  address: string;
  fax_number: string;
}

interface FormErrors {
  logo_url: boolean;
  broker_photo_url: boolean;
  phone_number: boolean;
  email_address: boolean;
  website_name: boolean;
}

export default function AccountPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [supabase] = useState(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    ),
  );
  const [credits, setCredits] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [formData, setFormData] = useState<AccountFormData>({
    logo_url: "",
    broker_photo_url: "",
    phone_number: "",
    email_address: "",
    website_name: "",
    broker_name: "",
    company_name: "",
    address: "",
    fax_number: "",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({
    logo_url: false,
    broker_photo_url: false,
    phone_number: false,
    email_address: false,
    website_name: false,
  });
  const { t } = useTranslation();
  const [i18nInitialized, setI18nInitialized] = useState(false);

  // Force reload translations when component mounts
  useEffect(() => {
    const loadTranslations = async () => {
      if (i18n.language) {
        await forceReloadTranslations(i18n.language);
        setI18nInitialized(true);
      }
    };

    loadTranslations();
  }, []);

  // Session handling and redirection
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Account Page Auth Change: ", event, currentSession);
        setSession(currentSession);
        setIsLoading(false); // Set loading false once session status known
      },
    );

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      console.log("Account Page Initial Session: ", initialSession);
      if (!session) {
        // Set initial session only if not already set by listener
        setSession(initialSession);
      }
      // Ensure loading is false eventually
      if (isLoading) {
        setIsLoading(false);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase, router]); // Keep router dependency

  // Fetch user profile data - depends on session
  useEffect(() => {
    const fetchUserProfile = async (currentSession: Session | null) => {
      if (currentSession?.user?.id) {
        console.log("Fetching profile for user:", currentSession.user.id);
        const { data, error } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", currentSession.user.id)
          .single();

        console.log("Profile data:", data);
        console.log("Profile error:", error);

        if (data && data.is_onboarded) {
          setIsExistingUser(true);
          setFormData({
            logo_url: data.logo_url || "",
            broker_photo_url: data.broker_photo_url || "",
            phone_number: data.phone_number || "",
            email_address: data.email_address || "",
            website_name: data.website_name || "",
            broker_name: data.broker_name || "",
            company_name: data.company_name || "",
            address: data.address || "",
            fax_number: data.fax_number || "",
          });
        } else if (currentSession?.user?.email) {
          // Pre-fill email for new users
          setFormData((prev) => ({
            ...prev,
            email_address: currentSession.user.email || "",
          }));
        }
      }
    };

    // Fetch profile only when session is confirmed
    if (session) {
      fetchUserProfile(session);
    } else if (session === null) {
      // Handle logged out state if necessary, maybe clear form data?
      setIsLoading(false); // If logged out, loading is finished
    }
  }, [session, supabase]);

  // Handle image upload functions
  const handleLogoUpload = (urls: string[]) => {
    if (urls.length > 0) {
      setFormData((prev) => ({ ...prev, logo_url: urls[0] }));
      setFormErrors((prev) => ({ ...prev, logo_url: false }));
    }
  };

  const handleBrokerPhotoUpload = (urls: string[]) => {
    if (urls.length > 0) {
      setFormData((prev) => ({ ...prev, broker_photo_url: urls[0] }));
      setFormErrors((prev) => ({ ...prev, broker_photo_url: false }));
    }
  };

  const handleImageUploaderClick = (e: React.MouseEvent) => {
    // Stop propagation to prevent the form from submitting when clicking on the uploader
    e.stopPropagation();
  };

  // Custom upload function - depends on session
  const uploadAccountImage = async (file: File): Promise<string> => {
    if (!session?.user?.id) {
      throw new Error("User must be logged in to upload images.");
    }
    try {
      // Create a unique filename
      const fileExt = file.name.split(".").pop();
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileName = `${timestamp}_${randomString}.${fileExt}`;
      const filePath = `${session.user.id}/${fileName}`;

      // Upload to the userinfo bucket
      const { error: uploadError } = await supabase.storage
        .from("userinfo")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from("userinfo")
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error("Error in uploadAccountImage:", error);
      throw error;
    }
  };

  // Handle text input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: false }));
  };

  // Handle form submission - depends on session
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const errors = {
      logo_url: !formData.logo_url,
      broker_photo_url: !formData.broker_photo_url,
      phone_number: !formData.phone_number,
      email_address:
        !formData.email_address ||
        !/^\S+@\S+\.\S+$/.test(formData.email_address),
      website_name: !formData.website_name,
      broker_name: !formData.broker_name, // Add validation for required text fields
      company_name: !formData.company_name,
      address: !formData.address,
    };

    setFormErrors(errors);

    // Check if any errors exist (excluding optional fax_number)
    const hasErrors = Object.entries(errors).some(([key, value]) => value);

    if (hasErrors) {
      toast.error(t("account.fillAllRequiredFields")); // More specific message
      return;
    }

    if (!session?.user?.id) {
      toast.error("Session expired. Please log in again.");
      setIsSubmitting(false);
      router.replace("/sign-in");
      return;
    }

    // Format website URL if needed (add https:// if not present)
    let websiteUrl = formData.website_name;
    if (websiteUrl && !websiteUrl.match(/^https?:\/\//)) {
      websiteUrl = "https://" + websiteUrl;
    }

    // Show loading state
    setIsSubmitting(true);
    toast.loading(t("account.savingInfo"), { id: "account-update" });

    try {
      const profileData = {
        logo_url: formData.logo_url,
        broker_photo_url: formData.broker_photo_url,
        phone_number: formData.phone_number,
        email_address: formData.email_address,
        website_name: websiteUrl,
        broker_name: formData.broker_name,
        company_name: formData.company_name,
        address: formData.address,
        fax_number: formData.fax_number,
        is_onboarded: true,
      };

      let dbResponse: { data: any; error: any } | null = null; // To store response

      if (isExistingUser) {
        // --- UPDATE existing profile ---
        console.log("Attempting to UPDATE profile for user:", session.user.id);
        dbResponse = await supabase
          .from("user_profiles")
          .update(profileData)
          .eq("user_id", session.user.id) // Ensure we only update the correct user
          .select() // Optionally select the updated data to confirm
          .single(); // Assuming user_id is unique
      } else {
        // --- INSERT new profile ---
        console.log("Attempting to INSERT profile for user:", session.user.id);
        dbResponse = await supabase
          .from("user_profiles")
          .insert({
            ...profileData,
            user_id: session.user.id, // Include user_id for insert
          })
          .select() // Optionally select the inserted data
          .single();
      }

      const { data: resultData, error } = dbResponse || {
        data: null,
        error: { message: "Database operation did not return a response." },
      };

      if (error) {
        toast.error(t("account.saveFailed"), { id: "account-update" });
        console.error(
          `Profile ${isExistingUser ? "update" : "insert"} error object:`,
          error,
        );
        console.error(
          `Profile ${isExistingUser ? "update" : "insert"} error stringified:`,
          JSON.stringify(error, null, 2),
        );
        // Log specific potentially available fields
        if (error.message) console.error("Error message:", error.message);
        if (error.details) console.error("Error details:", error.details);
        if (error.hint) console.error("Error hint:", error.hint);
        if (error.code) console.error("Error code:", error.code); // Postgres error code might be useful
        return;
      }

      console.log(
        `Profile ${isExistingUser ? "updated" : "inserted"} successfully. Result:`,
        resultData,
      );

      toast.success(
        isExistingUser
          ? t("account.profileUpdated")
          : t("account.profileCompleted"),
        { id: "account-update" },
      );

      // If this was an insert, update the state and potentially redirect
      if (!isExistingUser) {
        setIsExistingUser(true); // Now they are an existing user
        // Short delay to show the success message before redirecting
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      }
    } catch (catchError: any) {
      console.error(
        "Caught unexpected error during profile submission:",
        catchError,
      );
      console.error(
        "Caught error stringified:",
        JSON.stringify(catchError, null, 2),
      );
      if (catchError.message)
        console.error("Caught error message:", catchError.message);
      toast.error(t("account.unexpectedError"), { id: "account-update" });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    console.log("Account page mounted");
    console.log("Session:", session);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-800">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px]"></div>
      </div>

      {isExistingUser && (
        <DashboardHeader
          isMenuOpen={false}
          setIsMenuOpen={() => {}}
          userEmail={session?.user?.email}
        />
      )}

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isExistingUser
                ? t("account.settings")
                : t("account.completeProfile")}
            </h1>
            <p className="text-gray-600 mt-1">
              {isExistingUser
                ? t("account.manageProfile")
                : t("account.beforeCreate")}
            </p>
          </div>

          {isExistingUser && (
            <button
              onClick={() => router.push("/dashboard")}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center"
            >
              <svg
                className="w-5 h-5 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              {t("account.backToDashboard")}
            </button>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-md p-8 mb-12">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section Header */}
            <div className="border-b border-gray-200 pb-5">
              <h2 className="text-2xl font-semibold text-gray-900">
                {t("account.brokerProfileInfo")}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {t("account.infoForBrochures")}
              </p>
            </div>
            {/* Upload Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Logo Upload */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t("account.companyLogo")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div
                  className={`border-2 ${formErrors.logo_url ? "border-red-300 bg-red-50" : "border-gray-300 bg-gray-50"} rounded-lg`}
                >
                  {formData.logo_url ? (
                    <div className="flex flex-col items-center p-4">
                      <img
                        src={formData.logo_url}
                        alt="Logo"
                        className="h-24 w-auto object-contain mb-4"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, logo_url: "" }))
                        }
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        {t("account.remove")}
                      </button>
                    </div>
                  ) : (
                    <div className="w-full">
                      <ImageUploader
                        existingImages={[]}
                        onImagesUploaded={(urls) => {
                          if (urls.length > 0) {
                            setFormData((prev) => ({
                              ...prev,
                              logo_url: urls[0],
                            }));
                            setFormErrors((prev) => ({
                              ...prev,
                              logo_url: false,
                            }));
                          }
                        }}
                        limit={1}
                        customUploadText="Firmenlogo hochladen"
                        onClick={handleImageUploaderClick}
                      />
                    </div>
                  )}
                  {formErrors.logo_url && (
                    <p className="mt-2 text-sm text-red-600 px-4 pb-3">
                      {t("account.logoRequired")}
                    </p>
                  )}
                </div>
              </div>

              {/* Broker Photo Upload */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t("account.brokerPhoto")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div
                  className={`border-2 ${formErrors.broker_photo_url ? "border-red-300 bg-red-50" : "border-gray-300 bg-gray-50"} rounded-lg`}
                >
                  {formData.broker_photo_url ? (
                    <div className="flex flex-col items-center p-4">
                      <img
                        src={formData.broker_photo_url}
                        alt="Broker"
                        className="h-32 w-auto object-cover object-center mb-4 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            broker_photo_url: "",
                          }))
                        }
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        {t("account.remove")}
                      </button>
                    </div>
                  ) : (
                    <div className="w-full">
                      <ImageUploader
                        existingImages={[]}
                        onImagesUploaded={(urls) => {
                          if (urls.length > 0) {
                            setFormData((prev) => ({
                              ...prev,
                              broker_photo_url: urls[0],
                            }));
                            setFormErrors((prev) => ({
                              ...prev,
                              broker_photo_url: false,
                            }));
                          }
                        }}
                        limit={1}
                        customUploadText="Maklerfoto hochladen"
                        onClick={handleImageUploaderClick}
                      />
                    </div>
                  )}
                  {formErrors.broker_photo_url && (
                    <p className="mt-2 text-sm text-red-600 px-4 pb-3">
                      {t("account.photoRequired")}
                    </p>
                  )}
                </div>
              </div>
            </div>
            {/* Contact Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">
                {t("account.contactInfo")}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Broker Name */}
                <div>
                  <label
                    htmlFor="broker_name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {t("account.brokerName")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="broker_name"
                    name="broker_name"
                    value={formData.broker_name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder={t("account.brokerNamePlaceholder")}
                    required
                  />
                </div>

                {/* Company Name */}
                <div>
                  <label
                    htmlFor="company_name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {t("account.companyName")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="company_name"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder={t("account.companyNamePlaceholder")}
                    required
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label
                    htmlFor="email_address"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {t("account.emailAddress")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email_address"
                    name="email_address"
                    value={formData.email_address}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${formErrors.email_address ? "border-red-300" : ""}`}
                    placeholder={t("account.emailPlaceholder")}
                    required
                  />
                  {formErrors.email_address && (
                    <p className="mt-1 text-sm text-red-600">
                      {t("account.validEmailRequired")}
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label
                    htmlFor="phone_number"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {t("account.phoneNumber")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone_number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${formErrors.phone_number ? "border-red-300" : ""}`}
                    placeholder={t("account.phonePlaceholder")}
                    required
                  />
                  {formErrors.phone_number && (
                    <p className="mt-1 text-sm text-red-600">
                      {t("account.phoneRequired")}
                    </p>
                  )}
                </div>

                {/* Fax Number (Optional) */}
                <div>
                  <label
                    htmlFor="fax_number"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {t("account.faxNumber")}{" "}
                    <span className="text-xs text-gray-500 font-normal">
                      ({t("account.optional")})
                    </span>
                  </label>
                  <input
                    type="text"
                    id="fax_number"
                    name="fax_number"
                    value={formData.fax_number}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder={t("account.faxPlaceholder")}
                  />
                </div>

                {/* Website */}
                <div>
                  <label
                    htmlFor="website_name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {t("account.website")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="website_name"
                    name="website_name"
                    value={formData.website_name}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${formErrors.website_name ? "border-red-300" : ""}`}
                    placeholder={t("account.websitePlaceholder")}
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {t("account.websiteNote")}
                  </p>
                  {formErrors.website_name && (
                    <p className="mt-1 text-sm text-red-600">
                      {t("account.websiteRequired")}
                    </p>
                  )}
                </div>
              </div>

              {/* Address */}
              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t("account.address")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder={t("account.addressPlaceholder")}
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  {t("account.addressNote")}
                </p>
              </div>
            </div>
            {/* Submit Button */}
            <div className="pt-5">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {t("account.saving")}...
                  </span>
                ) : (
                  t("account.saveProfileInfo")
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
