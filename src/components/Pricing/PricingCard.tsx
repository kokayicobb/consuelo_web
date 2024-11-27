"use client";

import React from "react";
import { CardBody, CardContainer, CardItem } from "../ui/3d-card";
import { Price } from "@/types/price";
import OfferList from "./OfferList";
import { Zap } from 'lucide-react';

const PricingCard = ({ product }: { product: Price }) => {
  const handleSubscription = async (e: React.MouseEvent) => {
    e.preventDefault();
    // Implement your subscription logic here
  };

  return (
    <CardContainer className="inter-var">
      <CardBody className="relative group/card bg-card hover:shadow-lg hover:shadow-accent/20 border-border w-full sm:w-[24rem] h-[600px] rounded-xl p-6 border transition-colors flex flex-col justify-between">
        {product.nickname === "Premium" && (
          <div className="absolute -top-4 -right-4 bg-violet-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            Recommended
          </div>
        )}

        <div>
          <CardItem
            translateZ="50"
            className="text-2xl font-bold text-card-foreground"
          >
            {product.nickname}
          </CardItem>

          <CardItem
            as="p"
            translateZ="60"
            className="text-3xl font-bold mt-2 text-card-foreground"
          >
            {product.id === "price_1NQk4eLtGdPVhGLeZsZDsCNz" ? (
              "Custom"
            ) : (
              <>
                ${(product.unit_amount / 100).toLocaleString("en-US", {
                  currency: "USD",
                })}
                <span className="text-base font-normal text-muted-foreground">
                  {" "}
                  / month
                </span>
              </>
            )}
          </CardItem>

          <CardItem
            translateZ="100"
            className="w-full mt-8 space-y-4"
          >
            {product.offers.map((offer, i) => (
              <OfferList key={i} text={offer} />
            ))}
          </CardItem>
        </div>

        <CardItem translateZ="50" className="w-full mt-8">
          <button
            onClick={handleSubscription}
            className="relative group/btn w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium 
                     transition-all hover:opacity-90 flex items-center justify-center overflow-hidden"
          >
            <div className="relative flex items-center justify-center gap-2">
            <img
                          src="/apple-touch-icon.png"
                          alt="Consuelo Logo"
                          className="h-6 w-6 text-muted-foreground [&>path]:fill-current"
                        />
              <span>Start Free Trial</span>
            </div>
            
            <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-primary to-transparent" />
            <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-accent to-transparent" />
          </button>
        </CardItem>

        <div className="absolute inset-0 group-hover/card:opacity-100 opacity-0 transition duration-500">
          <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
          <div className="absolute inset-y-0 -right-px w-px bg-gradient-to-b from-transparent via-primary/50 to-transparent" />
        </div>
      </CardBody>
    </CardContainer>
  );
};

export default PricingCard;

