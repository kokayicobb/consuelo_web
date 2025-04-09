// src/components/Features/index.tsx
import React from "react";
import { BentoGrid, BentoGridItem } from "../ui/bento-grid";
import { Lightbulb } from 'lucide-react'
import {
  IconShirt,
  IconRuler,
  IconCube,
  IconChartBar,
  IconMail,
  IconLock,
  IconPolygon,
} from "@tabler/icons-react";
import Link from "next/link";

interface BackgroundPatternProps {
  children: React.ReactNode;
  className?: string;
  gradientFrom: string;
  gradientTo: string;
}

const BackgroundPattern: React.FC<BackgroundPatternProps> = ({ children, className, gradientFrom, gradientTo }) => (
  <div className={`relative overflow-hidden rounded-xl ${className}`}>
    <div className={`absolute inset-0 opacity-70 bg-gradient-to-br ${gradientFrom} ${gradientTo}`}></div>
    <div className="absolute inset-0 opacity-30">{children}</div>
  </div>
);

export function Features() {
  return (
    <section className="bg-transparent pt-8 sm:pt-12 pb-8 sm:pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        

       
        <BentoGrid>
  {items.map((item, i) => (
    <div key={i} className={item.className}>
      <Link 
        href={
          item.title === "Playground" ? "/playground" :
          item.title === "Virtual Try-On" ? "/playground" :
          item.title === "Fit Calculator" ? "/playground" :
          item.title === "3D Product Viewer" ? "/playground" :
          item.title === "Competition Dashboard" ? "/dashboard" :
          item.title === "Contact" ? "/contact" :
          item.title === "Secure Data Handling" ? "/contact" :
          "#"
        }
        className="block h-full" // This ensures the link takes full height
      >
        <BentoGridItem
          title={item.title}
          description={item.description}
          header={item.header}
          icon={item.icon}
          backgroundImage={item.image}
          className="h-full hover:scale-[1.02] transition-all duration-200"
        />
      </Link>
    </div>
  ))}
</BentoGrid>
         
      </div>
    </section>
  );
}


const items = [
  {
    title: "Virtual Try-On",
   
    
    description: "Allow customers to virtually try on clothes, seeing how they look and fit before making a purchase.",
    header: (
      <BackgroundPattern gradientFrom="from-purple-500" gradientTo="to-blue-500">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-full h-full">
          <path d="M20,50 Q35,20 50,50 T80,50" fill="none" stroke="white" strokeWidth="2" />
          <path d="M20,70 Q35,40 50,70 T80,70" fill="none" stroke="white" strokeWidth="2" />
          <circle cx="30" cy="30" r="8" fill="white" fillOpacity="0.2" />
          <circle cx="70" cy="40" r="10" fill="white" fillOpacity="0.2" />
        </svg>
      </BackgroundPattern>
    ),
    icon: <IconShirt className="h-8 w-8 text-accent" />,
  },
  {
    title: "Fit Calculator",
    description: "Our advanced AI algorithms provide accurate sizing recommendations based on customer data and product specifications.",
    header: (
      <BackgroundPattern gradientFrom="from-blue-500" gradientTo="to-cyan-500">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-full h-full">
          <line x1="10" y1="20" x2="90" y2="20" stroke="white" strokeWidth="2" />
          <line x1="10" y1="40" x2="90" y2="40" stroke="white" strokeWidth="2" />
          <line x1="10" y1="60" x2="90" y2="60" stroke="white" strokeWidth="2" />
          <line x1="10" y1="80" x2="90" y2="80" stroke="white" strokeWidth="2" />
          <line x1="20" y1="10" x2="20" y2="90" stroke="white" strokeWidth="2" />
          <line x1="40" y1="10" x2="40" y2="90" stroke="white" strokeWidth="2" />
          <line x1="60" y1="10" x2="60" y2="90" stroke="white" strokeWidth="2" />
          <line x1="80" y1="10" x2="80" y2="90" stroke="white" strokeWidth="2" />
        </svg>
      </BackgroundPattern>
    ),
    icon: <IconRuler className="h-8 w-8 text-accent" />,
  },
  {
    title: "3D Product Viewer",
    description: "Give customers a 360-degree view of products, enhancing their online shopping experience.",
    header: (
      <BackgroundPattern gradientFrom="from-cyan-500" gradientTo="to-teal-500">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-full h-full">
          <path d="M10,90 L50,10 L90,90 Z" fill="none" stroke="white" strokeWidth="2" />
          <path d="M30,70 L50,30 L70,70" fill="none" stroke="white" strokeWidth="2" />
          <path d="M10,90 L90,90" fill="none" stroke="white" strokeWidth="2" />
        </svg>
      </BackgroundPattern>
    ),
    icon: <IconCube className="h-8 w-8 text-accent" />,
  },
  {
    title: "Competition Dashboard",
    description: "Analyze your performance against competitors with our comprehensive dashboard.",
    header: (
      <BackgroundPattern gradientFrom="from-teal-500" gradientTo="to-purple-500">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-full h-full">
          <rect x="10" y="20" width="20" height="60" fill="white" fillOpacity="0.2" />
          <rect x="40" y="40" width="20" height="40" fill="white" fillOpacity="0.2" />
          <rect x="70" y="30" width="20" height="50" fill="white" fillOpacity="0.2" />
          <circle cx="20" cy="15" r="5" fill="white" fillOpacity="0.2" />
          <circle cx="50" cy="35" r="5" fill="white" fillOpacity="0.2" />
          <circle cx="80" cy="25" r="5" fill="white" fillOpacity="0.2" />
        </svg>
      </BackgroundPattern>
    ),
    icon: <IconChartBar className="h-8 w-8 text-accent" />,
    className: "md:col-span-2",
  },
  {
    title: "Contact",
     image: '/Square2.jpeg',
    description: "Get in touch with our team for personalized support and solutions.",
    header: (
      <BackgroundPattern gradientFrom="from-purple-500" gradientTo="to-pink-500">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-full h-full">
          <path d="M10,20 L50,50 L90,20 L90,80 L10,80 Z" fill="none" stroke="white" strokeWidth="2" />
          <path d="M10,20 L50,50 L90,20" fill="none" stroke="white" strokeWidth="2" />
        </svg>
      </BackgroundPattern>
    ),
    icon: <IconMail className="h-8 w-8 text-accent" />,
  },
  {
    title: "Secure Data Handling",
    image: '/squareBento.jpeg',
    description: "We prioritize customer privacy and data security, ensuring all information is handled with the utmost care.",
    header: (
      <BackgroundPattern gradientFrom="from-blue-500" gradientTo="to-purple-500">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="2" />
          <path d="M50,10 L50,90 M10,50 L90,50" stroke="white" strokeWidth="2" />
          <path d="M30,30 L70,70 M30,70 L70,30" stroke="white" strokeWidth="2" />
        </svg>
      </BackgroundPattern>
    ),
    icon: <IconLock className="h-8 w-8 text-accent" />,
  },
  {
    title: "Playground",
    image: "/long.jpeg",
    description: "Explore our demo store to experience our tools in action and see how they can benefit your business.",
   
    className: "md:col-span-2",
    href: "/playground"
  },
];

export default Features;

