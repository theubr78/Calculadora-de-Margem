import React from "react";

export type StatusIconType = "success" | "error" | "warning" | "info";

interface StatusIconProps {
  type: StatusIconType;
  size?: number;
  className?: string;
  "aria-label"?: string;
}

const StatusIcon: React.FC<StatusIconProps> = ({
  type,
  size = 20,
  className = "",
  "aria-label": ariaLabel,
}) => {
  const iconProps = {
    width: size,
    height: size,
    className: `inline-block align-middle ${className}`,
    "aria-hidden": ariaLabel ? undefined : true,
    "aria-label": ariaLabel,
    focusable: false,
  };

  switch (type) {
    case "success":
      return (
        <svg {...iconProps} fill="currentColor" viewBox="0 0 20 20">
          <circle cx="10" cy="10" r="10" fill="var(--color-success)" opacity="0.1" />
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
            fill="var(--color-success)"
          />
        </svg>
      );
    case "error":
      return (
        <svg {...iconProps} fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="12" fill="var(--color-error)" opacity="0.08" />
          <path
            d="M12 7v5m0 4h.01"
            stroke="var(--color-error)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="10" stroke="var(--color-error)" strokeWidth="2" fill="none" />
        </svg>
      );
    case "warning":
      return (
        <svg {...iconProps} fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
            fill="var(--color-warning)"
          />
        </svg>
      );
    case "info":
      return (
        <svg {...iconProps} fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
            fill="var(--color-primary)"
          />
        </svg>
      );
    default:
      return null;
  }
};

export default StatusIcon;