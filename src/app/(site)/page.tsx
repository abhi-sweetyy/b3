"use client";

import { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "../i18n"; // Import from app directory
import { LanguageProvider } from "../contexts/LanguageContext"; // Import from app directory
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import Features from "@/components/sections/Features"; // Keep Features (How it works section)
import FeaturesGrid from "@/components/sections/FeaturesGrid"; // Import the new FeaturesGrid
import Demo from "@/components/sections/Demo";
import Benefits from "@/components/sections/Benefits";
import FAQ from "@/components/sections/FAQ";
import Footer from "@/components/layout/Footer";
import TrustedBy from "@/components/sections/TrustedBy";
import Testimonial from "@/components/sections/Testimonial";
import CTASection from "@/components/sections/CTASection";

export default function Home() {
	const [isLoading, setIsLoading] = useState(true);
	const [scrollingDown, setScrollingDown] = useState(false);
	const [lastScrollY, setLastScrollY] = useState(0);

	useEffect(() => {
		// Simulate content loading with a smoother experience
		const timer = setTimeout(() => {
			setIsLoading(false);
		}, 400);

		// Check if we need to load a saved language preference
		if (typeof window !== "undefined") {
			const savedLanguage = localStorage.getItem("preferred-language");
			if (savedLanguage && i18n.language !== savedLanguage) {
				i18n.changeLanguage(savedLanguage);
			}
		}

		// Handle scroll events for animations
		const handleScroll = () => {
			const currentScrollY = window.scrollY;
			if (currentScrollY > lastScrollY) {
				setScrollingDown(true);
			} else {
				setScrollingDown(false);
			}
			setLastScrollY(currentScrollY);
		};

		window.addEventListener("scroll", handleScroll, { passive: true });

		return () => {
			clearTimeout(timer);
			window.removeEventListener("scroll", handleScroll);
		};
	}, [lastScrollY]);

	return (
		<I18nextProvider i18n={i18n}>
			<LanguageProvider>
				<div className="min-h-screen overflow-hidden w-full bg-white">
					{isLoading ? (
						<div className="flex items-center justify-center min-h-screen">
							<div className="flex flex-col items-center">
								{/* Fixed Loading Circle - using border animation method which is more reliable */}
								{/* Brand-colored Loading Circle */}
								<div className="w-12 h-12 mb-4 border-4 border-gray-200 border-t-[#5169FE] rounded-full animate-spin"></div>
								<div className="text-gray-700 font-medium">Loading...</div>
							</div>
						</div>
					) : (
						<div className="relative">
							{/* Background decorations */}
							<div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
								<div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px]"></div>
								<div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px]"></div>

								{/* Mobile-optimized gradient blobs */}
								<div className="absolute top-[20%] left-[-20%] w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[80px] md:hidden"></div>
								<div className="absolute bottom-[30%] right-[-10%] w-[250px] h-[250px] bg-indigo-500/5 rounded-full blur-[80px] md:hidden"></div>
							</div>

							<Navbar />

							{/* Main content container with better padding for mobile */}
							<div className="pt-14 md:pt-20">
								<Hero />
								<TrustedBy />
								{/* Adding section dividers for better visual separation on mobile */}
								<div className="w-full max-w-6xl mx-auto px-4">
									<div className="h-px bg-gray-100 my-4 md:my-8"></div>
								</div>
								<Features /> {/* Keep the "How it works" section */}
								{/* Add the new FeaturesGrid section between Features and Demo */}
								<FeaturesGrid />
								<div className="w-full max-w-6xl mx-auto px-4">
									<div className="h-px bg-gray-100 my-4 md:my-8"></div>
								</div>
								<Demo />
								<div className="w-full max-w-6xl mx-auto px-4">
									<div className="h-px bg-gray-100 my-4 md:my-8"></div>
								</div>
								<Benefits />
								{/* Add the Testimonial section here, between Benefits and FAQ */}
								<Testimonial />
								<div className="w-full max-w-6xl mx-auto px-4 lg:hidden">
									<div className="h-px bg-gray-100 my-4 md:my-8"></div>
								</div>
								<FAQ />
								<div className="mt-4 md:mt-12">
									<CTASection />
								</div>
								<Footer />
							</div>
						</div>
					)}
				</div>
			</LanguageProvider>
		</I18nextProvider>
	);
}
