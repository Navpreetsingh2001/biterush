
"use client";

import type { FC } from 'react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Star, MessageSquare, Send } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Dummy Review Data
const dummyReviews = [
  {
    id: 1,
    name: "Alex Chen",
    avatarUrl: "https://picsum.photos/seed/alex/50/50",
    rating: 5,
    comment: "Love the app! So convenient to order from Block C.",
    date: "2 days ago",
  },
  {
    id: 2,
    name: "Priya Singh",
    avatarUrl: "https://picsum.photos/seed/priya/50/50",
    rating: 4,
    comment: "Great selection at The Hungry Ram. Delivery was quick.",
    date: "1 day ago",
  },
  {
    id: 3,
    name: "Ben Carter",
    avatarUrl: "https://picsum.photos/seed/ben/50/50",
    rating: 4,
    comment: "App is good, but sometimes the menu takes a moment to load.",
    date: "5 hours ago",
  },
];

const FeedbackSection: FC = () => {
  const [feedback, setFeedback] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { toast } = useToast();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!feedback.trim()) {
      toast({
        title: "Feedback Empty",
        description: "Please write something before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    console.log("Submitting feedback:", feedback);
    setTimeout(() => {
      setIsSubmitting(false);
      setFeedback(''); // Clear textarea
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback!",
        variant: "default", // Use default or success variant
        className: "bg-green-50 border-green-300 text-green-800",
      });
    }, 1000); // Simulate network delay
  };

  return (
    <div className="my-12 p-4 bg-card rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-6 text-center md:text-left text-primary flex items-center gap-2 justify-center md:justify-start">
        <MessageSquare className="h-6 w-6" /> User Reviews & Feedback
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Feedback Form */}
        <Card>
          <CardHeader>
            <CardTitle>Share Your Thoughts</CardTitle>
            <CardDescription>Help us improve Biterush!</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="feedback-textarea" className="sr-only">Your Feedback</Label>
                <Textarea
                  id="feedback-textarea"
                  placeholder="Tell us what you think..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                  maxLength={500}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">{feedback.length} / 500</p>
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Send className="mr-2 h-4 w-4 animate-pulse" /> Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" /> Submit Feedback
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Recent Reviews */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Reviews</CardTitle>
            <CardDescription>See what others are saying.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-h-80 overflow-y-auto pr-2">
            {dummyReviews.length > 0 ? (
              dummyReviews.map((review) => (
                <div key={review.id} className="flex items-start gap-3 p-3 border rounded-md bg-background/50">
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage src={review.avatarUrl} alt={review.name} />
                    <AvatarFallback>{review.name.substring(0, 1)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-semibold text-sm">{review.name}</p>
                      <div className="flex items-center gap-1 text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'fill-muted stroke-muted-foreground'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{review.comment}</p>
                    <p className="text-xs text-muted-foreground">{review.date}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">No reviews yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FeedbackSection;
