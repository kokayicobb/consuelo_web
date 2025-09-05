"use client";

import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";

// Import your components
// Note: You may need to adjust the import paths to match your project structure
import { WavyBackgroundDemo } from "@/components/Hero";
import HomeBlogSection from "@/components/Blog/HomeBlogSection";
import Clients from "@/components/Clients";
import Contact from "@/components/Contact";
import FaqSection from "@/components/Faq";
import Features from "@/components/Features";
import Pricing from "@/components/Pricing";
import TeamSection from "@/components/Team";
import Testimonials from "@/components/Testimonials";

// Import the CSS module
import styles from '@/styles/EnterpriseContent.module.css';

interface EnterpriseContentProps {
  onBack: () => void;
}

export default function EnterpriseContent({ onBack }: EnterpriseContentProps) {
  // Mock posts data since we can't use server components or direct file system access
  const [posts, setPosts] = useState([]);
  
  // Mock features data
  const [features, setFeatures] = useState([]);

  // Simulate fetching posts
  useEffect(() => {
    // This is mock data - in a real app, you might fetch this from an API
    setPosts([
      {
        title: "Revolutionizing E-commerce with AI Virtual Try-On",
        date: "2025-03-10T05:35:07.322Z",
        excerpt: "How AI is transforming the online shopping experience and reducing returns.",
        coverImage: "/blog/post1.jpg",
        slug: "revolutionizing-ecommerce"
      },
      {
        title: "Enterprise Case Study: Fashion Retailer Reduces Returns by 47%",
        date: "2025-03-01T05:35:07.322Z",
        excerpt: "A major fashion brand implements Consuelo and sees dramatic improvements.",
        coverImage: "/blog/post2.jpg",
        slug: "enterprise-case-study"
      },
      {
        title: "The Future of Fashion Tech: 2025 and Beyond",
        date: "2025-02-20T05:35:07.322Z",
        excerpt: "Exploring upcoming trends in fashion technology and virtual experiences.",
        coverImage: "/blog/post3.jpg",
        slug: "future-of-fashion-tech"
      }
    ]);

    // Mock features data
    setFeatures([
      {
        _id: "1",
        title: "Insurance Demo",
        description: "On-call coaching platform that helps managers shorten ramp time for new sales reps through real-time guidance on outbound calls",
        image: null,
        imagePath: "/videos/insurance-demo.mp4",
        slug: { current: "insurance-demo" },
        isHero: true,
        gradientFrom: "from-blue-500",
        gradientTo: "to-purple-600",
        order: 1
      },
      {
        _id: "2", 
        title: "Exploring Life Insurance Options",
        description: "A training session with Zara",
        image: null,
        imagePath: "/videos/life-insurance.mp4", 
        slug: { current: "life-insurance" },
        isHero: false,
        gradientFrom: "from-green-500",
        gradientTo: "to-blue-500",
        order: 2
      },
      {
        _id: "3",
        title: "Objection Overcoming", 
        description: "Watch Mercury help an agent overcome the objection of being called too much",
        image: null,
        imagePath: "/videos/objection-handling.mp4",
        slug: { current: "objection-handling" },
        isHero: false, 
        gradientFrom: "from-purple-500",
        gradientTo: "to-pink-500",
        order: 3
      },
      {
        _id: "4",
        title: "Practicing objections",
        description: "On-Call Coaching", 
        image: null,
        imagePath: "/videos/objection-practice.mp4",
        slug: { current: "objection-practice" },
        isHero: false,
        gradientFrom: "from-red-500", 
        gradientTo: "to-orange-500",
        order: 4
      }
    ]);
  }, []);

  // Create a ref for the container
  const containerRef = useRef(null);
  
  // Set up intersection observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible);
          }
        });
      },
      { threshold: 0.1 }
    );

    // Get all elements with the animate-section class
    const animatedSections = document.querySelectorAll(`.${styles['animate-section']}`);
    animatedSections.forEach((section) => {
      observer.observe(section);
    });

    return () => {
      animatedSections.forEach((section) => {
        observer.unobserve(section);
      });
    };
  }, []);

  return (
    <div className={`${styles['enterprise-landing']} animate-fade-in overflow-y-auto`} ref={containerRef}>
     {/* Back button */}
		 <div className="fixed top-20 left-20 z-50">
        <button
          onClick={onBack}
          className={`${styles['back-button']} flex items-center gap-2 px-3 py-2 text-sm bg-background/80 backdrop-blur-sm rounded-full text-white hover:text-accent transition-colors border border-border/40 shadow-md`}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </button>
      </div>

      {/* Main content */}
      <div className={styles['enterprise-content']}>
        {/* Hero Section with Wavy Background */}
        <div className="relative z-10">
          <WavyBackgroundDemo />
        </div>
        
        {/* Custom heading for Enterprise */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="py-16 bg-gradient-to-b from-background to-background/80 text-center px-4"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Enterprise Solutions</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Powerful AI virtual try-on technology designed for scale. Reduce returns, 
            increase conversions, and create memorable shopping experiences.
          </p>
          <div className="mt-8 flex justify-center gap-4 flex-wrap">
            <button className="px-6 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent/80 transition-colors">
              Schedule a Demo
            </button>
            <button className="px-6 py-3 border border-border text-white rounded-lg font-medium hover:bg-background/60 transition-colors">
              Enterprise Pricing
            </button>
          </div>
        </motion.div>

        {/* Display components in a modified layout for dashboard context */}
        <div className={`${styles['enterprise-sections']} space-y-8 pb-10`}>
          {/* Feature section */}
          <div className={`${styles['animate-section']} feature-section`}>
            <Features features={features} />
          </div>

          {/* Testimonials section */}
          <div className={`${styles['animate-section']} testimonials-section`}>
            <Testimonials />
          </div>

          {/* Client logos
          <div className={`${styles['animate-section']} clients-section px-4`}>
            <div className="max-w-5xl mx-auto">
              <h3 className="text-center text-2xl font-bold text-white mb-10">Trusted by Industry Leaders</h3>
              <Clients />
            </div>
          </div> */}

          {/* Pricing section */}
          <div className={`${styles['animate-section']} pricing-section`}>
            <Pricing />
          </div>

          {/* Team section */}
          <div className={`${styles['animate-section']} team-section`}>
            <TeamSection />
          </div>

          {/* FAQ section */}
          <div className={`${styles['animate-section']} faq-section`}>
            <FaqSection />
          </div>

          {/* Blog section */}
          <div className={`${styles['animate-section']} blog-section px-4 py-8`}>
            <HomeBlogSection
              posts={posts}
              subtitle="Latest Updates"
              title="Enterprise News & Insights"
              paragraph="Stay up to date with the latest developments in AI fashion technology, industry trends, and how Consuelo is revolutionizing the online shopping experience for enterprise clients."
            />
          </div>

          {/* Contact section */}
          <div className={`${styles['animate-section']} contact-section`}>
            <Contact />
          </div>
        </div>

        {/* Footer - simplified for the dashboard context */}
        <div className="py-8 border-t border-border/40 text-center text-sm text-muted-foreground">
          <p>© 2025 Consuelo Enterprise. All rights reserved.</p>
          <div className="mt-2 flex justify-center gap-4">
            <button className="hover:text-accent transition-colors">Privacy Policy</button>
            <button className="hover:text-accent transition-colors">Terms of Service</button>
            <button className="hover:text-accent transition-colors">Contact</button>
          </div>
        </div>
      </div>
    </div>
  );
}