"use client";

import { useEffect } from "react";
import { ensureAmplitudeInit } from "@/lib/amplitude";

/** Mounted once at the root layout — initializes Amplitude autocapture client-side only. */
export default function AmplitudeInit() {
  useEffect(() => {
    ensureAmplitudeInit();
  }, []);

  return null;
}
