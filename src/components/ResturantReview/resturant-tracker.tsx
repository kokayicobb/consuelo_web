"use client"
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '../ui/textarea';


// Initialize Supabase client - you'll need to add these to your environment variables
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const RestaurantTracker = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    restaurant: '',
    rating: '',
    comments: '',
  });

  // Fetch initial data and set up real-time subscription
  useEffect(() => {
    fetchReviews();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('restaurants')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'restaurant_reviews'
        },
        (payload) => {
          setSubmissions(current => [payload.new, ...current]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurant_reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data);
    } catch (error) {
      toast({
        title: "Error fetching reviews",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      
    }
  };

  const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
	
		try {
			const { error } = await supabase
				.from('restaurant_reviews')
				.insert([
					{
						name: formData.name,
						restaurant: formData.restaurant,
						rating: parseInt(formData.rating),
						comments: formData.comments,
					}
				]);
	
			if (error) throw error;
	
			toast({
				title: "Success!",
				description: "Your review has been submitted. Refresh the page to see all reviews including yours!",
			});
	
			setFormData({
				name: '',
				restaurant: '',
				rating: '',
				comments: '',
			});
		} catch (error) {
			toast({
				title: "Error submitting review",
				description: error.message,
				variant: "destructive"
			});
		} finally {
			setLoading(false);
		}
	};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Weekly Restaurant Review</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-base font-medium mb-1">Your Name</label>
              <Input
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-base font-medium mb-1">Restaurant Name</label>
              <Input
                required
                name="restaurant"
                value={formData.restaurant}
                onChange={handleChange}
                placeholder="Enter restaurant name"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-base font-medium mb-1">Rating (1-5)</label>
              <Input
                required
                type="number"
                min="1"
                max="5"
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                placeholder="Rate from 1-5"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-base font-medium mb-1">Comments</label>
              <Textarea
                name="comments"
                value={formData.comments}
                onChange={handleChange}
                placeholder="Share your thoughts about the restaurant"
                className="min-h-24"
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Review'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Previous Reviews</h2>
        {loading && <p>Loading reviews...</p>}
        {submissions.map(submission => (
          <Card key={submission.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold">{submission.restaurant}</h3>
                  <p className="text-sm text-gray-500">Reviewed by {submission.name}</p>
                </div>
                <div className="flex items-center">
                  <span className="text-xl font-bold">{submission.rating}/5</span>
                </div>
              </div>
              {submission.comments && (
                <p className="mt-2 text-gray-700">{submission.comments}</p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                {new Date(submission.created_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RestaurantTracker;