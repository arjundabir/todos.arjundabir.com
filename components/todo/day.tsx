"use client";
import React from "react";

const Day = () => {
  return (
    <div className="mt-4 text-muted-foreground border-b px-2">
      {new Date().toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })}
    </div>
  );
};

export default Day;
