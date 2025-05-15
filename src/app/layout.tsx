import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import UserProvider from "@/providers/UserProvider";
import { Providers } from "./providers";
import ClientScripts from "@/components/ClientScripts";

const font = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "ExposeFlow",
	description:
		"Create stunning real estate brochures in minutes with our AI-powered platform",
};

export const dynamic = "force-dynamic";

const RootLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<html lang="en" suppressHydrationWarning className="overflow-x-hidden max-w-[100vw] w-full m-0 p-0 border-0">
			<head>
				{/* Direct favicon links for better compatibility */}
				<link rel="icon" href="/favicon.png" />
				<link rel="shortcut icon" href="/favicon.png" />
				<link rel="apple-touch-icon" href="/favicon.png" />
			</head>
			<body
				suppressHydrationWarning={true}
				className={`${font.className} overflow-x-hidden max-w-[100vw] w-full m-0 p-0 border-0`}
			>
				<ThemeProvider
					attribute="class"
					defaultTheme="light"
					enableSystem={false}
					disableTransitionOnChange
				>
					<UserProvider>
						<Providers>
							<ClientScripts />
							<div className="w-full overflow-x-hidden">{children}</div>
						</Providers>
					</UserProvider>
				</ThemeProvider>
			</body>
		</html>
	);
};

export default RootLayout;
