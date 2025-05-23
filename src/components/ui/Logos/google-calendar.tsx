import type { SVGProps } from "react"

export default function GoogleCalendarSVG(props: SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Google Calendar" 
      role="img"
      viewBox="0 0 512 512"
      {...props}
    >
      <rect
        width="512" 
        height="512"
        rx="15%"
        fill="#ffffff"
      />
      <path d="M100 340h74V174H340v-74H137Q100 100 100 135" fill="#4285f4"/>
      <path d="M338 100v76h74v-41q0-35-35-35" fill="#1967d2"/>
      <path d="M338 174h74V338h-74" fill="#fbbc04"/>
      <path d="M100 338v39q0 35 35 35h41v-74" fill="#188038"/>
      <path d="M174 338H338v74H174" fill="#34a853"/>
      <path d="M338 412v-74h74" fill="#ea4335"/>
      <path d="M204 229a25 22 1 1 1 25 27h-9h9a25 22 1 1 1-25 27M270 231l27-19h4v-7V308" 
        stroke="#4285f4" 
        stroke-width="15" 
        stroke-linejoin="bevel" 
        fill="none"
      />
    </svg>
  )
}