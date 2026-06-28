import React from "react";

// Helper wrapper to standardize sizes
const IconWrapper = ({ children, size = 20, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`icon-svg ${className}`}
  >
    {children}
  </svg>
);

export const QnaIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <path d="M10 8h.01" />
    <path d="M14 8h.01" />
    <path d="M10 12h4" />
  </IconWrapper>
);

export const SummaryIcon = (props) => (
  <IconWrapper {...props}>
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </IconWrapper>
);

export const KeyPointsIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M21 2M15 8l-6 6M9 14l-3-3M4 16v4h4l9-9-4-4-9 9" />
    <circle cx="18.5" cy="5.5" r="2.5" />
  </IconWrapper>
);

export const FlashcardIcon = (props) => (
  <IconWrapper {...props}>
    <rect x="3" y="4" width="18" height="16" rx="2" ry="2" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </IconWrapper>
);

export const SendIcon = (props) => (
  <IconWrapper {...props}>
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </IconWrapper>
);

export const UploadIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </IconWrapper>
);

export const TrashIcon = (props) => (
  <IconWrapper {...props}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </IconWrapper>
);

export const VolumeIcon = (props) => (
  <IconWrapper {...props}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
  </IconWrapper>
);

export const VolumeMuteIcon = (props) => (
  <IconWrapper {...props}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <line x1="23" y1="9" x2="17" y2="15" />
    <line x1="17" y1="9" x2="23" y2="15" />
  </IconWrapper>
);

export const CopyIcon = (props) => (
  <IconWrapper {...props}>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </IconWrapper>
);

export const CheckIcon = (props) => (
  <IconWrapper {...props}>
    <polyline points="20 6 9 17 4 12" />
  </IconWrapper>
);

export const FileIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </IconWrapper>
);

export const ArrowLeftIcon = (props) => (
  <IconWrapper {...props}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </IconWrapper>
);

export const HomeIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </IconWrapper>
);

export const SparklesIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M12 3v1M12 20v1M4.22 4.22l.7.7M19.07 19.07l.7.7M1 12h1M22 12h1M4.22 19.07l.7-.7M19.07 4.22l.7-.7M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z" strokeDasharray="3 3" />
    <path d="M12 9v6" />
    <path d="M9 12h6" />
  </IconWrapper>
);

export const HistoryIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <polyline points="3 3 3 8 8 8" />
    <line x1="12" y1="7" x2="12" y2="12" />
    <line x1="12" y1="12" x2="16" y2="14" />
  </IconWrapper>
);

export const CloseIcon = (props) => (
  <IconWrapper {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </IconWrapper>
);

export const MenuIcon = (props) => (
  <IconWrapper {...props}>
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </IconWrapper>
);

export const ExportIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 13 7 8" />
    <line x1="12" y1="13" x2="12" y2="3" />
  </IconWrapper>
);
