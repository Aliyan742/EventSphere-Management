const BrandMark = ({ className = "w-8 h-8" }) => (
  <svg
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <rect width="36" height="36" rx="9" fill="#0F172A" />
    <rect x="7" y="7" width="9" height="9" rx="2.5" fill="#2563EB" />
    <rect x="20" y="7" width="9" height="9" rx="2.5" fill="#F59E0B" />
    <rect x="7" y="20" width="9" height="9" rx="2.5" fill="#94A3B8" fillOpacity="0.6" />
    <rect x="20" y="20" width="9" height="9" rx="2.5" fill="#3B82F6" />
  </svg>
);

export default BrandMark;
