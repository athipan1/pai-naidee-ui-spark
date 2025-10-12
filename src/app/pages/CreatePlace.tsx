import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/services/supabase.service';
import { useAuth } from '@/shared/contexts/AuthContext';
import { ImageUploader } from '@/components/places/ImageUploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

const placeSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  province: z.string().min(2, 'Province is required'),
  category: z.string().min(3, 'Category is required'),
  description: z.string().optional(),
});

type PlaceFormValues = z.infer<typeof placeSchema>;

const CreatePlacePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PlaceFormValues>({
    resolver: zodResolver(placeSchema),
    defaultValues: {
      name: '',
      province: '',
      category: '',
      description: '',
    },
  });

  const handleUploadSuccess = (url: string) => {
    setImageUrl(url);
  };

  const onSubmit = async (values: PlaceFormValues) => {
    if (!user) {
      toast({ title: 'You must be logged in', variant: 'destructive' });
      return;
    }
    if (!imageUrl) {
      toast({ title: 'Please upload an image first', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.from('places').insert([
      {
        ...values,
        image_url: imageUrl,
        // The user_id is not in the schema, but could be added for ownership tracking
        // user_id: user.id,
      },
    ]);

    setIsSubmitting(false);

    if (error) {
      toast({ title: 'Failed to create place', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Place created successfully!' });
      navigate('/discover'); // Redirect to discover page after creation
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Create a New Place</h1>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">1. Upload an Image</h2>
          <ImageUploader onUploadSuccess={handleUploadSuccess} />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">2. Fill in the Details</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Place Name</FormLabel>
                    <FormControl><Input placeholder="e.g., Wat Arun" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="province"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Province</FormLabel>
                    <FormControl><Input placeholder="e.g., Bangkok" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl><Input placeholder="e.g., Temple, Cafe, Beach" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl><Textarea placeholder="A short description of the place..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={!imageUrl || isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Place'}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default CreatePlacePage;