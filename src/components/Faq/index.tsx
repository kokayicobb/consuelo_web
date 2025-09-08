import React from "react";
import { HeartHandshake } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { client } from "@/sanity/lib/client";
import { FAQS_QUERY } from "@/sanity/lib/queries";

interface FAQ {
  _id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

const FaqSection = async () => {
  const faqs: FAQ[] = await client.fetch(FAQS_QUERY);
  return (
    <>
      <section className="bg-transparent pt-16 pb-24 sm:pt-24 sm:pb-32">
  <div className="mx-auto w-full max-w-4xl px-6 lg:px-8">
    <Card className="bg-transparent">
      <CardHeader className="text-center">
        {/* Moved pill inside card */}
        <div className="flex justify-center">
          <div className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-sm font-medium">
            <HeartHandshake className="mr-2 h-4 w-4 text-accent" />
            <span className="text-accent">FAQ</span>
          </div>
        </div>

        <CardTitle className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl ">
          Any Questions?{" "}
          <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
            Answered
          </span>
        </CardTitle>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Get the insights you need about Mercury AI coaching and Zara voice roleplay training.
            </p>
          </CardHeader>
          <CardContent className="text-card-foreground">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={faq._id} value={`item-${index + 1}`}>
                  <AccordionTrigger>
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
        </div>
      </section>
    </>
  );
};

export default FaqSection;
