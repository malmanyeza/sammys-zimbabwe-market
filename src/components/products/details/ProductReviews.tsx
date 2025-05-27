
import React from 'react';
import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelative } from 'date-fns';

interface ProductReviewsProps {
  productId: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  buyer_id: string;
  profiles: {
    name: string | null;
  } | null;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['productReviews', productId],
    queryFn: async () => {
      // First fetch reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          buyer_id
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (reviewsError) {
        console.error('Error fetching reviews:', reviewsError);
        throw new Error('Failed to fetch reviews');
      }

      if (!reviewsData || reviewsData.length === 0) {
        return [];
      }

      // Get unique buyer IDs
      const buyerIds = [...new Set(reviewsData.map(review => review.buyer_id))];

      // Fetch profiles for all buyers
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', buyerIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        // Continue without profile data rather than throwing
      }

      // Create a map of buyer_id to profile for quick lookup
      const profilesMap = new Map(
        (profilesData || []).map(profile => [profile.id, profile])
      );

      // Combine reviews with profile data
      const reviewsWithProfiles = reviewsData.map(review => ({
        ...review,
        profiles: profilesMap.get(review.buyer_id) || null
      }));

      return reviewsWithProfiles as Review[];
    },
  });

  if (isLoading) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-20 w-full" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
      {reviews.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-lg font-semibold mb-2">No reviews yet</p>
          <p className="text-muted-foreground">Be the first to review this product!</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-semibold">
                    {review.profiles?.name || 'Anonymous Customer'}
                  </p>
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
                <span className="text-sm text-muted-foreground">
                  {formatRelative(new Date(review.created_at), new Date())}
                </span>
              </div>
              {review.comment && (
                <p className="text-muted-foreground">{review.comment}</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductReviews;
