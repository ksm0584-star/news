import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR } from "next/font/google";
import AmplitudeInit from "@/components/AmplitudeInit";
import AnalyticsPageView from "@/components/AnalyticsPageView";
import BottomNav from "@/components/BottomNav";
import OnboardingGuide from "@/components/OnboardingGuide";
import Toaster from "@/components/Toaster";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
});

const SITE_URL = "https://news-sable-tau.vercel.app";
const OG_TITLE = "모아요 | 경제 뉴스 스크랩 & 기록";
const OG_DESCRIPTION = "관심 있는 경제 뉴스를 모으고, 나만의 생각을 기록해 보세요.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "모아요",
  description:
    "경제뉴스를 스크랩하고 내 생각을 기록하며, 과거와 현재의 생각을 비교해 관점의 변화를 돌아보는 앱",
  openGraph: {
    title: OG_TITLE,
    description: OG_DESCRIPTION,
    url: SITE_URL,
    siteName: "모아요",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        // v2 (2026-10-26): removed the giant background "MOAYO" wordmark,
        // enlarged the brand name/tagline. A new filename (not just a
        // redeploy of the same og-image.png path) so platforms that cache
        // a link's preview by image URL — KakaoTalk in particular — see
        // this as a different image and don't keep serving the stale one.
        url: "/og/og-image-v2.png",
        width: 1200,
        height: 630,
        alt: "모아요 — 경제 뉴스를 모으고, 내 생각을 기록하다.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: OG_TITLE,
    description: OG_DESCRIPTION,
    images: ["/og/og-image-v2.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${notoSansKr.variable} h-full antialiased`}>
      <body className="min-h-full">
        <AuthProvider>
          <AmplitudeInit />
          <AnalyticsPageView />
          <div className="mx-auto min-h-screen w-full max-w-[430px] bg-surface shadow-sm sm:border-x sm:border-border-subtle">
            {children}
          </div>
          <BottomNav />
          <OnboardingGuide />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
