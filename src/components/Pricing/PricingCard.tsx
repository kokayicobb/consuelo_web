"use client";

import React from "react";
import { CardBody, CardContainer, CardItem } from "../ui/3d-card";
import { Price } from "@/types/price";
import OfferList from "./OfferList";
import { Zap } from "lucide-react";
import Link from "next/link";

const PricingCard = ({ product }: { product: Price }) => {
  const handleSubscription = async (e: React.MouseEvent) => {
    e.preventDefault();
    // Implement your subscription logic here
  };

  return (
    <CardContainer className="inter-var">
      <CardBody className="group/card relative flex h-[600px] w-full flex-col justify-between rounded-xl border border-border bg-card p-6 transition-colors hover:shadow-lg hover:shadow-accent/20 sm:w-[24rem]">
        {product.nickname === "Premium" && (
          <div className="absolute -right-4 -top-4 rounded-full bg-violet-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
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
            className="mt-2 text-3xl font-bold text-card-foreground"
          >
            {product.id === "price_1NQk4eLtGdPVhGLeZsZDsCNz" ? (
              "Custom"
            ) : (
              <>
                $
                {(product.unit_amount / 100).toLocaleString("en-US", {
                  currency: "USD",
                })}
                <span className="text-base font-normal text-muted-foreground">
                  {" "}
                  / month
                </span>
              </>
            )}
          </CardItem>

          <CardItem translateZ="100" className="mt-8 w-full space-y-4">
            {product.offers.map((offer, i) => (
              <OfferList key={i} text={offer} />
            ))}
          </CardItem>
        </div>

        <CardItem translateZ="50" className="mt-8 w-full">
          <button
            onClick={handleSubscription}
            className="group/btn relative flex w-full items-center justify-center overflow-hidden rounded-lg bg-primary 
                     px-4 py-3 font-medium text-primary-foreground transition-all hover:opacity-90"
          >
            <div className="relative flex items-center justify-center gap-2">
              <img
                src="/apple-touch-icon.png"
                alt="Consuelo Logo"
                className="h-6 w-6 text-muted-foreground [&>path]:fill-current"
              />
              <Link
                href="/contact"
                className="transition-opacity hover:opacity-90"
              >
                <span>Start Free Trial</span>
              </Link>
            </div>

            <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
            <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
          </button>
        </CardItem>

        <div className="absolute inset-0 opacity-0 transition duration-500 group-hover/card:opacity-100">
          <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
          <div className="absolute inset-y-0 -right-px w-px bg-gradient-to-b from-transparent via-primary/50 to-transparent" />
        </div>
      </CardBody>
    </CardContainer>
  );
};

export default PricingCard;
