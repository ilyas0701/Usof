export default function ArrowGoToBoldIcon({ width = 21, height = 20, fill = '#132430', className, ...props }) {
  return (
    <svg width={width} height={height} viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20.5 10C20.5 10.5523 20.0523 11 19.5 11L1.5 11C0.947716 11 0.5 10.5523 0.5 10C0.5 9.44772 0.947716 9 1.5 9L19.5 9C20.0523 9 20.5 9.44772 20.5 10Z"
        fill={fill}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.7929 16.7071C12.4024 16.3166 12.4024 15.6834 12.7929 15.2929L18.0858 10L12.7929 4.70711C12.4024 4.31658 12.4024 3.68342 12.7929 3.29289C13.1834 2.90237 13.8166 2.90237 14.2071 3.29289L20.2071 9.29289C20.5976 9.68342 20.5976 10.3166 20.2071 10.7071L14.2071 16.7071C13.8166 17.0976 13.1834 17.0976 12.7929 16.7071Z"
        fill={fill}
      />
    </svg>
  )
}
