export interface AnalyticsPayload {
  event: string;
  timestamp: string;
  userId?: string;
  activeRole?: string;
  [key: string]: any;
}

export function track(eventName: string, props?: Record<string, any>): void {
  const payload: AnalyticsPayload = {
    event: eventName,
    timestamp: new Date().toISOString(),
    ...props,
  };

  console.log("[Analytics]", JSON.stringify(payload));

  if (typeof window !== "undefined" && (window as any).mixpanel) {
    (window as any).mixpanel.track(eventName, props);
  }
}
