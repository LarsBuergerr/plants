import type { AppProps } from "next/app";

import { HeroUIProvider } from "@heroui/system";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useRouter } from "next/router";
import { fontSans, fontMono, fontSerif } from "@/config/fonts";
import "@/styles/globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Provider } from "react-redux";
import { store } from "@/store";

// Wrap the entire app with AuthProvider

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <Provider store={store}>
      <AuthProvider>
        <HeroUIProvider navigate={router.push}>
          <NextThemesProvider attribute="class" defaultTheme="light">
            <Component {...pageProps} />
          </NextThemesProvider>
        </HeroUIProvider>
      </AuthProvider>
    </Provider>
  );
}

export const fonts = {
  sans: fontSans.style.fontFamily,
  mono: fontMono.style.fontFamily,
  serif: fontSerif.style.fontFamily,
};
