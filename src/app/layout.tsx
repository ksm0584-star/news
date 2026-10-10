import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR } from "next/font/google";
import AnalyticsPageView from "@/components/AnalyticsPageView";
import BottomNav from "@/components/BottomNav";
import OnboardingGuide from "@/components/OnboardingGuide";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "모아요",
  description:
    "경제뉴스를 스크랩하고 내 생각을 기록하며, 과거와 현재의 생각을 비교해 관점의 변화를 돌아보는 앱",
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
          <AnalyticsPageView />
          <div className="mx-auto min-h-screen w-full max-w-[430px] bg-surface shadow-sm sm:border-x sm:border-border-subtle">
            {children}
          </div>
          <BottomNav />
          <OnboardingGuide />
        </AuthProvider>
      </body>
    </html>
  );
}
