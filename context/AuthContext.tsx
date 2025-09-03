"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { account } from "@/lib/appwrite";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setCurrUid } from "@/store/appSlice";

type AuthContextType = {
  userId: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { currUid, authLoading, error } = useSelector(
    (state: RootState) => state.app,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const accountData = await account.get();
        dispatch(setCurrUid(accountData.$id));
      } catch (error) {
        dispatch(setCurrUid(null));
        if (router.pathname !== "/login") {
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [router.pathname]);

  return (
    <AuthContext.Provider value={{ userId: currUid }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
