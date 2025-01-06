"use client";

import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarIcon, Quote } from "lucide-react";
import { motion } from "framer-motion";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface Testimonial {
  name: string;
  role: string;
  content: string;
  avatar: string;
  rating: number;
}

const testimonials = [
  {
    name: "Kui Kamau",
    role: "Journalist @ Forbes",
    content: "Customers are more likely to make a purchase when they can see how a product looks on them in real-time, leading to higher conversion rates and increased revenues.",
    avatar: "/images/testimonials/forbes.png",
    rating: 5,
  },
  {
    name: "Maghan McDowell",
    role: "Journalist @ Vogue",
    content: "An estimated 85 percent of US apparel brands and retailers either use or plan to use virtual try-on tools.",
    avatar: "/images/testimonials/vogue.png",
    rating: 5,
  },
  {
    name: "Elise Dopson",
    role: "Journalist @ Shopify",
    content: "If you're allowing shoppers to try items on virtually in the comfort of their own home or in the middle of a safe retail store, you're solving a huge problem for them.",
    avatar: "/images/testimonials/Shopify Logo Green Bag.png",
    rating: 5,
  },

];

const TestimonialCard: React.FC<{ testimonial: Testimonial }> = ({ testimonial }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Card className="flex min-h-[300px] flex-col justify-between bg-muted shadow-lg transition-transform hover:scale-105">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
              <AvatarFallback>{testimonial.name.split(' ').map((n) => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{testimonial.name}</h3>
              <p className="text-sm text-muted-foreground">{testimonial.role}</p>
            </div>
          </div>
          <p className="italic text-muted-foreground">{testimonial.content}</p>
        </CardContent>
        <CardFooter className="p-6 pt-0">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                className={`h-5 w-5 ${
                  i < testimonial.rating ? "fill-accent text-accent" : "fill-muted text-muted"
                }`}
              />
            ))}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

const Testimonials: React.FC = () => {
  return (
    <section className="bg-background py-16 sm:py-16">
  <div className="mx-auto max-w-7xl px-6 lg:px-8">
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <div className="mb-6 inline-flex items-center rounded-full bg-accent/10 px-4 py-1 text-sm font-medium">
  <Quote className="mr-2 h-4 w-4 text-accent" />
  <span className="text-accent">Testimonials</span>
</div>
<h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
  What <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">Experts Have Said</span>
</h2>
<p className="mt-4 text-lg text-muted-foreground">
  Recognized by industry experts in E-Commerce and Retail for its innovative approach, our solution meets the demands of today's shopping experience.
</p>
        </motion.div>
        <div className="hidden lg:mt-16 lg:flex lg:gap-6 lg:justify-center">
          <Carousel className="w-full max-w-5xl">
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <TestimonialCard testimonial={testimonial} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:hidden">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.name} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
