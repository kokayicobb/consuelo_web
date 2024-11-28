import React from "react"
import { Users, UserPlus } from 'lucide-react'
import { AnimatedTooltip } from "../ui/animated-tooltip"

const teamData = [
  {
    id: 1,
    name: "Kokayi Cobb",
    designation: "CEO & CTO",
    image: "/images/team/kokayi.jpeg",
    link: "https://www.linkedin.com/in/kokayicobb/",
  },
  {
    id: 2,
    name: "Ryan Caves",
    designation: "Chief Growth Officer",
    image: "/images/team/kokayi.jpeg",
    link: "mailto:Ryan@consuelohq.com",
  },
  {
    id: 3,
    name: "Join Our Team",
    designation: "Founder Position",
    image: "/images/team/noun-woman-90693.svg",
    link: "mailto:Kokayi@consuelohq.com",
  },
]

const TeamSection = () => {
  return (
    <section className="bg-background px-4 py-12 sm:py-16 md:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-[min(100%,theme(width.4xl))] sm:px-6 lg:px-8">
        <div className="text-center space-y-3 sm:space-y-4 mb-6 sm:mb-8 md:mb-12">
          <div className="flex justify-center">
            <div className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-sm font-medium">
              <Users className="mr-2 h-4 w-4 text-accent" />
              <span className="text-accent">Our Team</span>
            </div>
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Meet Our{" "}
            <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
              Team
            </span>
          </h2>
          
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2 sm:px-6">
            We're a dynamic startup based in Charlotte seeking a passionate co-founder.
            While traditional experience isn't required, we value individuals with a
            proven track record of leadership and success.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center w-full space-y-8">
          <div className="flex flex-row items-center justify-center w-full">
            <AnimatedTooltip items={teamData} />
          </div>

          <div className="text-center px-4">
            <p className="text-sm sm:text-base text-muted-foreground">
              Interested in joining? Email{" "}
              <a
                href="mailto:Kokayi@consuelohq.com"
                className="text-foreground hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent rounded-sm"
              >
                Kokayi@consuelohq.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TeamSection

