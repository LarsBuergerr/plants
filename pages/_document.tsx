import { Html, Head, Main, NextScript } from "next/document";
import clsx from "clsx";

import { fontMono, fontSans, fontSerif } from "@/config/fonts";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="manifest" href="public/manifest.json" />
        <link rel="apple-touch-icon" sizes="180x180" href="/ios/180.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/ios/152.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/ios/120.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/ios/76.png" />
      </Head>
      <body
        className={clsx(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
          fontMono.variable,
          fontSerif.variable
        )}
      >
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
