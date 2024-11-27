import React from "react";
import { BentoGrid, BentoGridItem } from "../ui/bento-grid";
import { StarIcon, Lightbulb, Ruler } from 'lucide-react'
import {
  IconShirt,
  IconRuler,
  IconCube,
  IconChartBar,
  IconMail,
  IconLock,
  IconPolygon,
} from "@tabler/icons-react";

export function Features() {
  return (
    <section className="bg-background pt-24 pb-12 sm:pt-0 sm:pb-0">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
      <div className="mx-auto max-w-2xl px-6 lg:px-8">
      <div className="mx-auto text-center mb-8">
      <div className="mb-4 inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-sm font-medium">
          <Lightbulb className="mr-1 h-4 w-4 text-accent" />
          <span className="text-accent">
            Solutions
          </span>
       
        </div>
        </div>
        </div>
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Consuelo's Core Products</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Each tool is designed with precision, helping you optimize your customer's experience, from personalized fittings to accurate sizing recommendations.
          </p>
        </div>
        <BentoGrid>
          {items.map((item, i) => (
            <BentoGridItem
              key={i}
              title={item.title}
              description={item.description}
              header={item.header}
              icon={item.icon}
              className={item.className}
            />
          ))}
        </BentoGrid>
      </div>
    </section>
  );
}

const Skeleton = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-muted dark:from-muted/20 to-muted/80 dark:to-muted/10"></div>
);

const items = [
  {
    title: "Virtual Try-On",
    description: "Allow customers to virtually try on clothes, seeing how they look and fit before making a purchase.",
    header: <Skeleton />,
    icon: <IconShirt className="h-6 w-6 text-primary" />,
  },
  {
    title: "Fit Calculator",
    description: "Our advanced AI algorithms provide accurate sizing recommendations based on customer data and product specifications.",
    header: <Skeleton />,
    icon: <Ruler className="h-6 w-6 text-primary" />,
  },
  {
    title: "3D Product Viewer",
    description: "Give customers a 360-degree view of products, enhancing their online shopping experience.",
    header: <Skeleton />,
    icon: <IconCube className="h-6 w-6 text-primary" />,
  },
  {
    title: "Competition Dashboard",
    description: "Analyze your performance against competitors with our comprehensive dashboard.",
    header: <Skeleton />,
    icon: <IconChartBar className="h-6 w-6 text-primary" />,
    className: "md:col-span-2",
  },
  {
    title: "Contact",
    description: "Get in touch with our team for personalized support and solutions.",
    header: <Skeleton />,
    icon: <IconMail className="h-6 w-6 text-primary" />,
  },
  {
    title: "Secure Data Handling",
    description: "We prioritize customer privacy and data security, ensuring all information is handled with the utmost care.",
    header: <Skeleton />,
    icon: <IconLock className="h-6 w-6 text-primary" />,
  },
  {
    title: "Playground",
    description: "Explore our demo store to experience our tools in action and see how they can benefit your business.",
    header: <Skeleton />,
    icon: <IconPolygon className="h-6 w-6 text-primary" />,
    className: "md:col-span-2",
  },
];

export default Features;

