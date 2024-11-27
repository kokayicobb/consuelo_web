"use client"

import React from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StarIcon, Quote } from 'lucide-react'
import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
interface Testimonial {
  name: string
  role: string
  content: string
  avatar: string
  rating: number
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
    avatar: '/images/testimonials/Shopify Logo Green Bag.png',
    rating: 5,
  },
  {
    name: "Sarah Johnson",
    role: "Fashion Blogger",
    content: "Virtual try-on technology has revolutionized the way I shop online. It's like having a personal fitting room at home!",
    avatar: '/images/testimonials/fashion-blogger.png',
    rating: 5,
  },
  {
    name: "David Chen",
    role: "E-commerce Consultant",
    content: "Brands implementing virtual try-on solutions have seen a significant decrease in return rates and an increase in customer satisfaction.",
    avatar: '/images/testimonials/consultant.png',
    rating: 5,
  },
]

interface TestimonialCardProps {
  testimonial: Testimonial
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5 }}
    >
     <Card className="flex h-full min-h-[300px] bg-muted flex-col justify-between">
        <CardContent className="pt-6">
          <div className="flex items-center gap-x-4 mb-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
              <AvatarFallback>{testimonial.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{testimonial.name}</h3>
              <p className="text-sm text-muted-foreground">{testimonial.role}</p>
            </div>
          </div>
          <p className="text-base italic text-muted-foreground">{testimonial.content}</p>
          <div className="mt-6 flex items-center gap-x-1">
            {[1, 2, 3, 4, 5].map((_, i) => (
              <StarIcon key={i} className={`h-5 w-5 ${i < testimonial.rating ? "fill-accent text-accent" : "fill-muted text-muted"}`} />
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

const Testimonials: React.FC = () => {
  return (
    <section className="bg-background py-0 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        > 
         
    <div className="mx-auto max-w-2xl px-6 lg:px-8">
      <div className="mx-auto text-center mb-8">
      <div className="mb-4 inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-sm font-medium">
          <Quote className="mr-1 h-4 w-4 text-accent" />
          <span className="text-accent">
            Testimonials
          </span>
       
        </div>
        </div>
        </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            What Experts Have Said
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Recognized by industry experts in E-Commerce and Retail for its innovative approach, our solution meets the demands of today's shopping experience.
          </p>
        </motion.div>
        <div className="mx-auto mt-16 hidden lg:block">
          <Carousel className="w-full max-w-5xl mx-auto">
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
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:hidden">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.name} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials