
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Star, MessageSquare } from "lucide-react";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  orderId: string;
  productId: string;
  productName: string;
  sellerId: string;
  onReviewSubmitted?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ 
  orderId, 
  productId, 
  productName, 
  sellerId,
  onReviewSubmitted 
}) => {
  const { user } = useAuth();
  const [selectedRating, setSelectedRating] = useState(0);
  const queryClient = useQueryClient();

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: '',
    }
  });

  const submitReviewMutation = useMutation({
    mutationFn: async (data: ReviewFormValues) => {
      if (!user) throw new Error('You must be logged in to submit a review');
      
      const { error } = await supabase
        .from('reviews')
        .insert({
          order_id: orderId,
          product_id: productId,
          buyer_id: user.id,
          seller_id: sellerId,
          rating: data.rating,
          comment: data.comment || null,
        });
        
      if (error) {
        console.error('Error submitting review:', error);
        throw new Error('Failed to submit review');
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productReviews'] });
      queryClient.invalidateQueries({ queryKey: ['orderItemReview'] });
      queryClient.invalidateQueries({ queryKey: ['userOrderItems'] });
      
      form.reset();
      setSelectedRating(0);
      
      toast.success('Review submitted successfully', {
        description: "Thank you for your feedback!"
      });
      
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    },
    onError: (error) => {
      toast.error('Failed to submit review', {
        description: error.message
      });
    }
  });

  const handleSubmit = (data: ReviewFormValues) => {
    if (selectedRating === 0) {
      toast.error('Please select a rating');
      return;
    }
    
    submitReviewMutation.mutate({
      ...data,
      rating: selectedRating,
    });
  };

  const handleStarClick = (rating: number) => {
    setSelectedRating(rating);
    form.setValue('rating', rating);
  };

  return (
    <Card className="mt-4 border-t-0 rounded-t-none">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Write a Review
        </CardTitle>
        <CardDescription>
          Share your experience with {productName}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="space-y-2">
              <FormLabel>Rating</FormLabel>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => {
                  const starValue = i + 1;
                  return (
                    <Star
                      key={i}
                      className={`h-8 w-8 cursor-pointer transition-colors ${
                        starValue <= selectedRating 
                          ? "fill-primary text-primary" 
                          : "text-muted-foreground hover:text-primary"
                      }`}
                      onClick={() => handleStarClick(starValue)}
                    />
                  );
                })}
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comment (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell others about your experience with this product..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onReviewSubmitted?.()}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={submitReviewMutation.isPending || selectedRating === 0}
              >
                {submitReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ReviewForm;
