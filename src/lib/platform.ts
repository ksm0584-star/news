import { Capacitor } from "@capacitor/core";

/** True only inside the Capacitor native shell (iOS/Android app) — always false on the web. */
export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}

/** The custom URL scheme the native app registers for OAuth deep-link returns. Must match capacitor.config.ts's appId. */
export const NATIVE_AUTH_CALLBACK_URL = "com.newsnote.app://auth/callback";
