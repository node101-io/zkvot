export default ({ color }: { color?: string }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='12'
    height='13'
    fill='none'
    viewBox='0 0 12 13'
  >
    <path
      fill={color ? color : '#F6F6F6'}
      d='M1.646 2.146A.5.5 0 012 2h4.5a.5.5 0 01.5.5V3a.5.5 0 001 0v-.5A1.5 1.5 0 006.5 1H2A1.5 1.5 0 00.5 2.5V7A1.5 1.5 0 002 8.5h.5a.5.5 0 000-1H2a.5.5 0 01-.5-.5V2.5a.5.5 0 01.146-.354z'
    ></path>
    <path
      fill={color ? color : '#F6F6F6'}
      fillRule='evenodd'
      d='M5.5 4.5A1.5 1.5 0 004 6v4.5A1.5 1.5 0 005.5 12H10a1.5 1.5 0 001.5-1.5V6A1.5 1.5 0 0010 4.5H5.5zM5 6a.5.5 0 01.5-.5H10a.5.5 0 01.5.5v4.5a.5.5 0 01-.5.5H5.5a.5.5 0 01-.5-.5V6z'
      clipRule='evenodd'
    ></path>
  </svg>
);
