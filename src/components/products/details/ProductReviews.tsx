
import React from 'react';
import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";

const reviews = [
  {
    id: 1,
    name: "Sarah M.",
    rating: 5,
    date: "March 15, 2025",
    comment: "Beautiful craftsmanship! This piece truly captures the essence of Zimbabwean art. The attention to detail is remarkable.",
  },
  {
    id: 2,
    name: "David R.",
    rating: 4,
    date: "March 10, 2025",
    comment: "Excellent quality and fast shipping. The colors are even more vibrant in person.",
  },
];

const ProductReviews = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-semibold">{review.name}</p>
                <div className="flex items-center gap-1 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating ? "fill-primary" : "fill-primary/30"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <span className="text-sm text-muted-foreground">{review.date}</span>
            </div>
            <p className="text-muted-foreground">{review.comment}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProductReviews;
