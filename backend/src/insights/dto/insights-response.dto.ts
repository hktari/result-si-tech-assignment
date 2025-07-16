export interface InsightsTimePerTitle {
  metric: "timePerTitle";
  date_range: {
    from: string;
    to: string;
  };
  data: Array<{
    name: string;
    durationMinutes: number;
  }>;
}

export interface InsightsTimePerTitleStacked {
  metric: "timePerTitleStacked";
  date_range: {
    from: string;
    to: string;
  };
  interval: "daily" | "weekly" | "monthly";
  data: Array<Record<string, any>>;
}
