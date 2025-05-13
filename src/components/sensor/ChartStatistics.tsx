
interface ChartStatisticsProps {
  stats: { min: number; max: number; avg: number };
  unit: string;
}

const ChartStatistics = ({ stats, unit }: ChartStatisticsProps) => {
  return (
    <div className="flex space-x-4 text-xs text-muted-foreground">
      <div>
        <span className="font-semibold">Min:</span> {stats.min.toFixed(1)} {unit}
      </div>
      <div>
        <span className="font-semibold">Avg:</span> {stats.avg.toFixed(1)} {unit}
      </div>
      <div>
        <span className="font-semibold">Max:</span> {stats.max.toFixed(1)} {unit}
      </div>
    </div>
  );
};

export default ChartStatistics;
