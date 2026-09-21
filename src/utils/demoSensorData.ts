import { SensorData } from "@/types";

const round = (value: number, precision = 1) =>
  Number(value.toFixed(precision));

export const createDemoReading = (timestamp = new Date(), index = 0): SensorData => ({
  _id: `demo-${timestamp.getTime()}`,
  timestamp: timestamp.toISOString(),
  temperature: round(34.2 + Math.sin(index / 4) * 1.8),
  humidity: round(66 + Math.cos(index / 5) * 5),
  air_quality: Math.round(180 + Math.sin(index / 3) * 60),
});

export const createDemoSensorHistory = (days = 30): SensorData[] => {
  const now = new Date();
  const pointsPerDay = 24;
  const pointCount = days * pointsPerDay;

  return Array.from({ length: pointCount }, (_, index) => {
    const timestamp = new Date(
      now.getTime() - (pointCount - index - 1) * 60 * 60 * 1000,
    );
    return createDemoReading(timestamp, index);
  });
};