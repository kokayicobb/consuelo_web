import { TeamType } from "@/types/team";
import SectionTitle from "../Common/SectionTitle";
import SingleTeam from "./SingleTeam";

const teamData: TeamType[] = [
  {
    id: 1,
    name: "Kokayi Cobb",
    designation: "CEO & CTO",
    image: "/images/team/Headshot with Background Removed.png",
    facebookLink: "https://www.linkedin.com/in/kokayicobb/", // linkedIN link
    twitterLink: "/#",
    instagramLink: "https://www.instagram.com/kokayicobb/",
  },
  
  {
    id: 2,
    name: "Co-Founder",
    designation: "Email Kokayi@consuelo.shop if you're interested.",
    image: "/images/team/team-04.png",
    facebookLink: "https://www.linkedin.com/in/kokayicobb/", // linkedIN link
    twitterLink: "/#",
    instagramLink: "https://www.instagram.com/kokayicobb/",
  },
];

const Team = () => {
  return (
    <section
      id="team"
      className="overflow-hidden bg-gray-1 pb-12 pt-20 dark:bg-dark-2 lg:pb-[90px] lg:pt-[120px]"
    >
      <div className="container">
        <div className="mb-[60px]">
          <SectionTitle
            subtitle="Our Team"
            title="Meet Our Team"
            paragraph="There are many variations of passages of Lorem Ipsum available but the majority have suffered alteration in some form."
            width="640px"
            center
          />
        </div>

        <div className="-mx-4 flex flex-wrap justify-center">
          {teamData.map((team, i) => (
            <SingleTeam key={i} team={team} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Team;
