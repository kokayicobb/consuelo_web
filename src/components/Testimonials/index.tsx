import { Testimonial } from "@/types/testimonial";
import SectionTitle from "../Common/SectionTitle";
import SingleTestimonial from "./SingleTestimonial";

const testimonialData: Testimonial[] = [
  {
    id: 1,
    name: "Kui Kamau",
    designation: "Journalist @ Forbes",
    content: "Customers are more likely to make a purchase when they can see how a product looks on them in real-time, leading to higher conversion rates and increased revenues.",
    image: "/images/testimonials/forbes.png",
    star: 5,
  },
  {
    id: 2,
    name: "Maghan McDowell",
    designation: "Journalist @ Vouge",
    content: "An estimated 85 percent of US apparel brands and retailers either use or plan to use virtual try-on tools.",
    image: "/images/testimonials/vogue.png",
    star: 5,
  },
  {
    id: 3,
    name: "Elise Dopson",
    designation: "Journalist @ Shopify",
    content: "If you're allowing shoppers to try items on virtually in the comfort of their own home or in the middle of a safe retail store, you're solving a huge problem for them.",
    image: '/images/testimonials/Shopify Logo Green Bag.png',
    star: 5,
  },
];

const Testimonials = () => {
  return (
    <section
    id="testimonials"
    className="bg-gray-1 py-20 dark:bg-dark-2 md:py-[120px]">
      <div className="container px-4">
        <SectionTitle
          subtitle="Testimonials"
          title="What Experts Have Said"
          paragraph="Recognized by industry experts in E-Commerce and Retail for its innovative approach, our solution meets the demands of today's shopping experience."
          width="640px"
          center
        />
        <div className="mt-[60px] flex flex-wrap lg:mt-20 gap-y-8">
          {testimonialData.map((testimonial, i) => (
            <SingleTestimonial key={i} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;