export const analyticsEnvironmentVariables = {
  gaMeasurementId: "NEXT_PUBLIC_GA_MEASUREMENT_ID",
  googleTagId: "NEXT_PUBLIC_GOOGLE_TAG_ID",
  metaPixelId: "NEXT_PUBLIC_META_PIXEL_ID",
  tiktokPixelId: "NEXT_PUBLIC_TIKTOK_PIXEL_ID",
  clarityId: "NEXT_PUBLIC_CLARITY_ID",
} as const;

function configuredValue(value: string | undefined): string | undefined {
  const trimmedValue = value?.trim();
  return trimmedValue || undefined;
}

export const analyticsConfig = {
  gaMeasurementId: configuredValue(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID),
  googleTagId: configuredValue(process.env.NEXT_PUBLIC_GOOGLE_TAG_ID),
  metaPixelId: configuredValue(process.env.NEXT_PUBLIC_META_PIXEL_ID),
  tiktokPixelId: configuredValue(process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID),
  clarityId: configuredValue(process.env.NEXT_PUBLIC_CLARITY_ID),
} as const;

export const googleTagIds = Array.from(
  new Set(
    [analyticsConfig.googleTagId, analyticsConfig.gaMeasurementId].filter(
      (id): id is string => Boolean(id),
    ),
  ),
);

export function hasAnyAnalyticsConfiguration(): boolean {
  return Object.values(analyticsConfig).some(Boolean);
}

export type AnalyticsEventPayload = Record<
  string,
  string | number | boolean | null | undefined
>;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    ttq?: {
      track?: (eventName: string, payload?: AnalyticsEventPayload) => void;
    };
  }
}

function safelyTrack(callback: () => void): void {
  try {
    callback();
  } catch {
    // A third-party tracking failure should never interrupt site interactions.
  }
}

export function trackEvent(
  eventName: string,
  payload: AnalyticsEventPayload = {},
): void {
  if (typeof window === "undefined" || !eventName) {
    return;
  }

  safelyTrack(() => window.gtag?.("event", eventName, payload));
  safelyTrack(() => window.fbq?.("trackCustom", eventName, payload));
  safelyTrack(() => window.ttq?.track?.(eventName, payload));

  // Clarity or internal event forwarding can be added here when event requirements are set.
}
