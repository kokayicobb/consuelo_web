"use client";
import React from "react";
import { CircularRunnerButton } from "./circular-runner-button";

export function CircularRunnerButtonDemo() {
  return (
    <div className="flex justify-center p-8">
      <CircularRunnerButton onClick={() => console.log("Talk to Consuelo clicked!")}>
        Talk to Consuelo
      </CircularRunnerButton>
    </div>
  );
}