export default function AlertIcon({ width = 20, height = 20, stroke = '#E54634', className, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 20 20"
      fill="none"
      stroke={stroke}
      className={className}
      {...props}
    >
      <path
        d="M10.0003 15.6999C9.82537 15.6999 9.68359 15.8417 9.68359 16.0166C9.68359 16.1915 9.82537 16.3333 10.0003 16.3333C10.1752 16.3333 10.3169 16.1915 10.3169 16.0166C10.3169 15.8417 10.1752 15.6999 10.0003 15.6999V15.6999"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10 13.1666V6.83315" strokeLinecap="round" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.369 1.3527C11.1126 0.830727 10.5817 0.5 10.0001 0.5C9.41857 0.5 8.88764 0.830727 8.63125 1.3527L0.631744 17.649C0.435978 18.0472 0.459646 18.5183 0.694342 18.8949C0.929038 19.2715 1.34151 19.5003 1.78527 19.5H18.215C18.6587 19.5003 19.0712 19.2715 19.3059 18.8949C19.5406 18.5183 19.5642 18.0472 19.3685 17.649L11.369 1.3527Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
