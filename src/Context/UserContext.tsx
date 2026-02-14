import { createContext, useContext, useState, ReactNode } from "react";
import {CurrentUser} from "../types";

interface UserContextProps {
    user: CurrentUser | null;
    setUser: (user: CurrentUser | null) => void;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<CurrentUser | null>(null);

    return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error("useUser must be used within UserProvider");
    return context;
};
