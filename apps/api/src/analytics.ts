export interface AnalyticsPayload {
  event: string;
  timestamp: string;
  userId?: string;
  activeRole?: string;
  [key: string]: any;
}

export function track(eventName: string, userId?: string, activeRole?: string, props?: Record<string, any>): void {
  const payload: AnalyticsPayload = {
    event: eventName,
    timestamp: new Date().toISOString(),
    ...(userId && { userId }),
    ...(activeRole && { activeRole }),
    ...props,
  };

  console.log("[Analytics]", JSON.stringify(payload));
}
