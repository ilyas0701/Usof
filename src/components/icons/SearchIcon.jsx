export default function SearchIcon({ width = 18, height = 18, fill = '#808DA4', className, ...props }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <circle
        cx="9"
        cy="9"
        r="6"
        stroke={fill}
        strokeWidth="2"
      />
      <path
        d="M13.5 13.5L17.5 17.5"
        stroke={fill}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
