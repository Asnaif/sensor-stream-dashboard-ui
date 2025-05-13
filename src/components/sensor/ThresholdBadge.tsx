// ThresholdBadge.jsx
import React from "react";

/**
 * Component to display threshold status badge
 * @param {Object} props
 * @param {number} props.currentValue - Current value to check against thresholds
 * @param {Object} props.threshold - Min and max threshold values
 * @param {number} props.threshold.min - Minimum acceptable value
 * @param {number} props.threshold.max - Maximum acceptable value
 */
const ThresholdBadge = ({ currentValue, threshold }) => {
  // If no threshold is defined, don't show a badge
  if (!threshold) return null;

  // Determine the status based on threshold values
  let status = "normal";
  let label = "Normal";

  if (currentValue < threshold.min) {
    status = "below";
    label = "Below threshold";
  } else if (currentValue > threshold.max) {
    status = "above";
    label = "Above threshold";
  }

  // Define badge colors based on status
  const badgeStyles = {
    normal: "bg-green-500 text-white",
    below: "bg-blue-500 text-white",
    above: "bg-red-500 text-white"
  };

  return (
    <div className={`px-3 py-1 rounded-full text-sm font-medium ${badgeStyles[status]}`}>
      {label}
    </div>
  );
};

export default ThresholdBadge;
