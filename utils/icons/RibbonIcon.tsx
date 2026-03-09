import { Iconprop } from "./UnlockIcon";
const RibbonIcon = ({color="#ad46ff", ...props}:Iconprop) => (
  <svg
    width={32}
    height={32}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="m20.636 17.187 2.02 11.368a.666.666 0 0 1-1.08.626L16.803 25.6a1.33 1.33 0 0 0-1.596 0l-4.782 3.581a.666.666 0 0 1-1.08-.625l2.019-11.368"
      stroke={color}
      strokeWidth={2.667}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 18.667a8 8 0 1 0 0-16 8 8 0 0 0 0 16"
      stroke={color}
      strokeWidth={2.667}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
export default RibbonIcon;
