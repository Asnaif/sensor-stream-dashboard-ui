
import { Badge } from "@/components/ui/badge";

interface ThresholdBadgeProps {
  currentValue: number;
  threshold?: { min: number; max: number };
}

const ThresholdBadge = ({ currentValue, threshold }: ThresholdBadgeProps) => {
  if (!threshold) return null;
  
  const status = 
    currentValue > threshold.max ? "Above threshold" :
    currentValue < threshold.min ? "Below threshold" : 
    "Normal";
    
  const variant = 
    currentValue > threshold.max || currentValue < threshold.min
      ? "destructive" 
      : "secondary";
      
  return (
    <Badge variant={variant}>
      {status}
    </Badge>
  );
};

export default ThresholdBadge;
