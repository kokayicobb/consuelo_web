import React from "react";
import { HeartHandshake } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const FaqSection = () => {
  return (
    <>
      <section className="bg-background pt-16 pb-24 sm:pt-24 sm:pb-32">
  <div className="mx-auto w-full max-w-4xl px-6 lg:px-8">
    <Card>
      <CardHeader className="text-center">
        {/* Moved pill inside card */}
        <div className="flex justify-center">
          <div className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-sm font-medium">
            <HeartHandshake className="mr-2 h-4 w-4 text-accent" />
            <span className="text-accent">FAQ</span>
          </div>
        </div>

        <CardTitle className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Any Questions?{" "}
          <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
            Answered
          </span>
        </CardTitle>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Get the insights you need about our platform, designed to help
              improve fit accuracy and reduce returns in online shopping.
            </p>
          </CardHeader>
          <CardContent className="text-card-foreground">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  How does your sizing algorithm work?
                </AccordionTrigger>
                <AccordionContent>
                  Our algorithm uses body measurements and brand-specific size
                  charts to provide personalized fit recommendations. By
                  analyzing user inputs like height, weight, and head
                  measurements, we match users with the closest accurate fit.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>
                  Is this solution suitable for plus-sized or unconventional
                  body types?
                </AccordionTrigger>
                <AccordionContent>
                  Absolutely. Our algorithm is designed to be inclusive and
                  accommodates diverse body types, providing size
                  recommendations that help everyone feel confident in their
                  clothing choices.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>
                  How do I ensure my privacy when using the size
                  recommendations?
                </AccordionTrigger>
                <AccordionContent>
                  We prioritize privacy and only collect sizing data for the
                  purpose of generating recommendations. There is no need to
                  create an account, and we do not store personal identifiers
                  like names or emails.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger>
                  How does this technology help reduce returns?
                </AccordionTrigger>
                <AccordionContent>
                  By improving fit accuracy, users have a better understanding
                  of how a garment will fit them, which in turn reduces the
                  likelihood of returns due to incorrect sizing. Our goal is to
                  provide size recommendations that give users confidence in
                  their purchases.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger>
                  Can businesses customize this technology for their products?
                </AccordionTrigger>
                <AccordionContent>
                  Yes, our technology can be adapted to fit the specific needs
                  of each brand, including custom size charts, preferred
                  terminology, and unique product features to enhance fit
                  accuracy.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger>
                  Is there a way to use this feature on multiple clothing
                  brands?
                </AccordionTrigger>
                <AccordionContent>
                  Yes, our solution integrates across multiple brands, so once a
                  user creates an avatar and preferences, they can apply their
                  profile to any participating brand that uses our technology.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
        </div>
      </section>
    </>
  );
};

export default FaqSection;
