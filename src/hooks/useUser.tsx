import { useEffect, useState, createContext, useContext } from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { Session, User, SupabaseClient } from "@supabase/supabase-js";
import { UserDetails } from "../../types";

type UserContextType = {
	session: Session | null;
	user: User | null;
	userDetails: UserDetails | null;
	isLoading: boolean;
};

export const UserContext = createContext<UserContextType | undefined>(
	undefined
);

export interface Props {
	[propName: string]: any;
}

export const MyUserContextProvider = (props: Props) => {
	const [supabase] = useState(() => createBrowserClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
	));
	const [session, setSession] = useState<Session | null>(null);
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

	useEffect(() => {
		const { data: authListener } = supabase.auth.onAuthStateChange((event, currentSession) => {
			console.log("User Context Auth Change:", event, currentSession);
			setSession(currentSession);
			setUser(currentSession?.user ?? null);
			if (event === "SIGNED_OUT") {
				setUserDetails(null);
			}
			setIsLoading(false);
		});

		supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
			console.log("User Context Initial Session:", initialSession);
			if (!session) {
				setSession(initialSession);
				setUser(initialSession?.user ?? null);
			}
			setIsLoading(false);
		});

		return () => {
			authListener?.subscription.unsubscribe();
		};
	}, [supabase]);

	useEffect(() => {
		const getUserDetails = async () => {
			if (!user) {
				setUserDetails(null);
				setIsLoading(false);
				return;
			}

			setIsLoading(true);
			try {
				console.log(`Fetching details for user: ${user.id}`);
				const { data, error, status } = await supabase
					.from("profiles")
					.select("*")
					.eq('id', user.id)
					.single();

				if (error && status !== 406) {
					console.error("Supabase error object:", error);
					throw error;
				}

				if (data) {
					console.log("User details fetched:", data);
					setUserDetails(data as UserDetails);
				} else {
					console.log("No profile found for user, setting details to null.");
					setUserDetails(null);
				}
			} catch (error: any) {
				console.error(
					"Error fetching user details:", 
					error?.message || JSON.stringify(error)
				);
				setUserDetails(null);
			} finally {
				setIsLoading(false);
			}
		};

		if (user && !userDetails && !isLoading) {
			getUserDetails();
		} else if (!user && !isLoading) {
			setUserDetails(null);
		}
	}, [user, userDetails, isLoading, supabase]);

	const value = {
		session,
		user,
		userDetails,
		isLoading,
	};

	return <UserContext.Provider value={value} {...props} />;
};

export const useUser = () => {
	const context = useContext(UserContext);
	if (context === undefined) {
		throw new Error(`useUser must be used within a MyUserContextProvider.`);
	}
	return context;
};
