"use client";

import React from "react";
import Header from "@/components/layout/Header";
import NotFound from "@/components/shared/NotFound";

export default function HomeNoData() {
  return (
    <div className="min-h-screen bg-tv-dark flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center pt-[60px] md:pt-[70px]">
        <NotFound
          title="មិនមានទិន្នន័យ"
          description="ប្រព័ន្ធកំពុងស្ថិតក្នុងការថែទាំ ឬមិនមានទិន្នន័យសម្រាប់បង្ហាញ។ សូមត្រឡប់មកវិញនៅពេលក្រោយ។"
          showHomeButton={false}
        />
      </div>
    </div>
  );
}
