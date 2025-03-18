"use client";

import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

// This is a template for bottom link content components
// Duplicate this file for each bottom link (Pro, Enterprise, API, etc.)
// and customize the content accordingly

interface ContentProps {
  onBack: () => void;
}

export default function CareersContent({ onBack }: ContentProps) {
  return (
    <div className="animate-fade-in">
      {/* Back button */}
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to main content
      </button>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-xl bg-card border border-border p-6"
      >
        <h2 className="text-xl font-bold text-white mb-4">Pro Plan</h2>
        
        <div className="space-y-6">
          {/* Pricing section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Basic Plan */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="rounded-lg border border-border bg-background p-4 hover:border-accent/50 transition-all duration-300"
            >
              <h3 className="text-lg font-medium text-white mb-2">Basic</h3>
              <p className="text-3xl font-bold text-white mb-2">$19<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
              <p className="text-sm text-muted-foreground mb-4">Great for individuals and small projects</p>
              
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-sm">
                  <span className="mr-2 text-accent">✓</span>
                  <span>100 model generations per month</span>
                </li>
                <li className="flex items-center text-sm">
                  <span className="mr-2 text-accent">✓</span>
                  <span>Try-on studio access</span>
                </li>
                <li className="flex items-center text-sm">
                  <span className="mr-2 text-accent">✓</span>
                  <span>Basic support</span>
                </li>
              </ul>
              
              <button className="w-full py-2 rounded-lg bg-accent text-white font-medium hover:bg-accent/80 transition-colors">
                Subscribe Now
              </button>
            </motion.div>
            
            {/* Pro Plan */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="rounded-lg border-2 border-accent bg-background p-4 relative hover:shadow-[0_0_20px_rgba(var(--accent),0.2)] transition-all duration-300"
            >
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-accent text-white text-xs font-bold px-3 py-1 rounded-full">
                MOST POPULAR
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Pro</h3>
              <p className="text-3xl font-bold text-white mb-2">$49<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
              <p className="text-sm text-muted-foreground mb-4">Perfect for professional creators</p>
              
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-sm">
                  <span className="mr-2 text-accent">✓</span>
                  <span>500 model generations per month</span>
                </li>
                <li className="flex items-center text-sm">
                  <span className="mr-2 text-accent">✓</span>
                  <span>Advanced try-on studio features</span>
                </li>
                <li className="flex items-center text-sm">
                  <span className="mr-2 text-accent">✓</span>
                  <span>Priority support</span>
                </li>
                <li className="flex items-center text-sm">
                  <span className="mr-2 text-accent">✓</span>
                  <span>Commercial usage rights</span>
                </li>
              </ul>
              
              <button className="w-full py-2 rounded-lg bg-accent text-white font-medium hover:bg-accent/80 transition-colors">
                Subscribe Now
              </button>
            </motion.div>
            
            {/* Enterprise Plan */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="rounded-lg border border-border bg-background p-4 hover:border-accent/50 transition-all duration-300"
            >
              <h3 className="text-lg font-medium text-white mb-2">Enterprise</h3>
              <p className="text-3xl font-bold text-white mb-2">$199<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
              <p className="text-sm text-muted-foreground mb-4">For businesses with advanced needs</p>
              
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-sm">
                  <span className="mr-2 text-accent">✓</span>
                  <span>Unlimited model generations</span>
                </li>
                <li className="flex items-center text-sm">
                  <span className="mr-2 text-accent">✓</span>
                  <span>All premium features</span>
                </li>
                <li className="flex items-center text-sm">
                  <span className="mr-2 text-accent">✓</span>
                  <span>Dedicated account manager</span>
                </li>
                <li className="flex items-center text-sm">
                  <span className="mr-2 text-accent">✓</span>
                  <span>API access</span>
                </li>
                <li className="flex items-center text-sm">
                  <span className="mr-2 text-accent">✓</span>
                  <span>Custom integrations</span>
                </li>
              </ul>
              
              <button className="w-full py-2 rounded-lg border border-accent bg-transparent text-accent font-medium hover:bg-accent/10 transition-colors">
                Contact Sales
              </button>
            </motion.div>
          </div>
          
          {/* Features section */}
          <div className="mt-10">
            <h3 className="text-lg font-bold text-white mb-4">Pro Features</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className="rounded-lg border border-border bg-card p-4"
              >
                <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h4 className="text-md font-medium text-white mb-2">Higher Quality Generation</h4>
                <p className="text-sm text-muted-foreground">Access to premium model generation with higher resolution and better quality outputs.</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                className="rounded-lg border border-border bg-card p-4"
              >
                <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
                  </svg>
                </div>
                <h4 className="text-md font-medium text-white mb-2">Cloud Storage</h4>
                <p className="text-sm text-muted-foreground">Store all your generated models and garments in our secure cloud for easy access.</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.6 }}
                className="rounded-lg border border-border bg-card p-4"
              >
                <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <h4 className="text-md font-medium text-white mb-2">Priority Support</h4>
                <p className="text-sm text-muted-foreground">Get faster response times and personalized support from our expert team.</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.7 }}
                className="rounded-lg border border-border bg-card p-4"
              >
                <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
                  </svg>
                </div>
                <h4 className="text-md font-medium text-white mb-2">Advanced Customization</h4>
                <p className="text-sm text-muted-foreground">Fine-tune your model parameters and get more control over the generation process.</p>
              </motion.div>
            </div>
          </div>
          
          {/* FAQ Section */}
          <div className="mt-10">
            <h3 className="text-lg font-bold text-white mb-4">Frequently Asked Questions</h3>
            
            <div className="space-y-4">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.8 }}
                className="rounded-lg border border-border bg-card p-4"
              >
                <h4 className="text-md font-medium text-white mb-2">How does billing work?</h4>
                <p className="text-sm text-muted-foreground">You'll be billed monthly based on your chosen plan. You can upgrade, downgrade, or cancel anytime from your account settings.</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.9 }}
                className="rounded-lg border border-border bg-card p-4"
              >
                <h4 className="text-md font-medium text-white mb-2">Can I use the generated images commercially?</h4>
                <p className="text-sm text-muted-foreground">Yes, Pro and Enterprise plans include commercial usage rights for all generated images. Basic plan users need to purchase additional licenses.</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 1.0 }}
                className="rounded-lg border border-border bg-card p-4"
              >
                <h4 className="text-md font-medium text-white mb-2">What happens if I exceed my monthly quota?</h4>
                <p className="text-sm text-muted-foreground">You'll receive a notification when you reach 80% of your quota. If you exceed the limit, you can purchase additional credits or upgrade to a higher plan.</p>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}