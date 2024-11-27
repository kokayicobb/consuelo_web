import React from "react";
import { Users, UserPlus } from "lucide-react";
import { AnimatedTooltip } from "../ui/animated-tooltip";

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
];

const TeamSection = () => {
  return (
    <>
      <section className="relative overflow-hidden bg-background pt-[40px] md:pt-[50px] lg:pt-[60px]">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 inline-flex items-center rounded-full bg-muted px-3 py-1 text-sm font-medium">
              <Users className="mr-1 h-4 w-4 text-foreground" />
              <span className="text-foreground">Our Team</span>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full max-w-4xl mx-auto py-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4 text-foreground">Meet Our Team</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We're a dynamic startup based in Charlotte seeking a passionate co-founder. 
            While traditional experience isn't required, we value individuals with a proven 
            track record of leadership and success.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center w-full">
          <div className="flex flex-row items-center justify-center mb-10 w-full">
            <AnimatedTooltip items={teamData} />
          </div>
          
          <div className="text-center">
            <p className="text-muted-foreground">
              Interested in joining? Email{" "}
              <a 
                href="mailto:Kokayi@consuelohq.com" 
                className="text-foreground hover:underline"
              >
                Kokayi@consuelohq.com
              </a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default TeamSection;