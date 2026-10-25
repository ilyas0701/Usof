export default function ArrowBackIcon({ width = 20, height = 20, fill = '#132430', className, ...props }) {
  return (
    <svg width={width} height={height} viewBox="0 0 20 20" fill={fill} xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 10C0 9.44772 0.447715 9 1 9H19C19.5523 9 20 9.44772 20 10C20 10.5523 19.5523 11 19 11H1C0.447715 11 0 10.5523 0 10Z"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.70711 3.29289C8.09763 3.68342 8.09763 4.31658 7.70711 4.70711L2.41421 10L7.70711 15.2929C8.09763 15.6834 8.09763 16.3166 7.70711 16.7071C7.31658 17.0976 6.68342 17.0976 6.29289 16.7071L0.292893 10.7071C-0.0976311 10.3166 -0.0976311 9.68342 0.292893 9.29289L6.29289 3.29289C6.68342 2.90237 7.31658 2.90237 7.70711 3.29289Z"
      />
    </svg>
  )
}
