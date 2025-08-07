import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";
import Head from 'next/head'
export default function App({ Component, pageProps }: AppProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Prevent hydration mismatch by not rendering until client-side
  if (!isClient) {
    return null;
  }

  return (
    <>
    <Head>
      <title> XyloMail</title>
    </Head>
      <Component {...pageProps} />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "hsl(var(--glass) / 0.9)",
            backdropFilter: "blur(20px)",
            border: "1px solid hsl(var(--glass-border))",
            color: "hsl(var(--glass-highlight))",
            borderRadius: "12px",
            padding: "16px",
            fontSize: "14px",
            boxShadow:
              "0 25px 50px -12px hsl(var(--orb-1)), 0 0 0 1px hsl(var(--glass-border))",
          },
          className: "glass-toast",
        }}
        richColors
        expand={true}
        visibleToasts={4}
      />
      <Analytics />
    </>
  );
}
