"use client"

import { ClipLoader } from "react-spinners"

export const Loader = ({ size = 40 }: { size?: number }) => {
  return <ClipLoader color="#E8A93E" size={size} />
}
