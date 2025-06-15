
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Shield, UserPlus, Crown } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const addAdminSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

type AddAdminFormValues = z.infer<typeof addAdminSchema>;

const AdminManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<AddAdminFormValues>({
    resolver: zodResolver(addAdminSchema),
    defaultValues: {
      email: '',
    }
  });

  const addAdminMutation = useMutation({
    mutationFn: async (data: AddAdminFormValues) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Only admins can add other admins');
      }

      // Call the RPC function to promote user to admin
      const { data: result, error } = await supabase.rpc('promote_user_to_admin', {
        target_email: data.email
      });

      if (error) {
        console.error('Error promoting user to admin:', error);
        throw new Error(error.message || 'Failed to promote user to admin');
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      form.reset();
      toast.success('User promoted to admin successfully', {
        description: 'The user can now access admin features after logging out and back in.'
      });
    },
    onError: (error) => {
      toast.error('Failed to promote user to admin', {
        description: error.message
      });
    }
  });

  const handleAddAdmin = (data: AddAdminFormValues) => {
    addAdminMutation.mutate(data);
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">Only admins can access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="h-8 w-8 text-yellow-500" />
            <h1 className="text-3xl font-bold">Secret Admin Management</h1>
          </div>
          <p className="text-muted-foreground">
            Promote existing users to admin status
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Add New Admin
            </CardTitle>
            <CardDescription>
              Enter the email of an existing user to promote them to admin status.
              The user must already have an account in the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddAdmin)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="user@example.com" 
                          type="email"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit"
                  disabled={addAdminMutation.isPending}
                  className="w-full"
                >
                  {addAdminMutation.isPending ? 'Promoting to Admin...' : 'Promote to Admin'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">Important Notes:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• The user must already have an account in the system</li>
            <li>• Users need to log out and back in to see admin features</li>
            <li>• Only existing admins can promote other users</li>
            <li>• Admin permissions include user management and analytics access</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminManagement;
