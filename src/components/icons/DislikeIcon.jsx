export default function DislikeIcon({ width = 19, height = 19, ...props }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M17 14V3H6.5a2 2 0 0 0-2 1.7l-1.2 8A2 2 0 0 0 5.3 15H10l-1 4a2.4 2.4 0 0 0 2.4 3L17 14Z" />
      <path d="M17 3h4v11h-4" />
    </svg>
  )
}
