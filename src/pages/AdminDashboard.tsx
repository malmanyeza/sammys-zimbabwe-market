
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Users, ShoppingBag, Package, TrendingUp, Crown } from 'lucide-react';
import UserManagement from '@/components/admin/UserManagement';
import AnalyticsCharts from '@/components/admin/AnalyticsCharts';
import RankingsDisplay from '@/components/admin/RankingsDisplay';

const AdminDashboard = () => {
  const { user } = useAuth();

  // Redirect if not admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // Fetch user analytics
  const { data: userAnalytics = [], isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ['userAnalytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_analytics')
        .select('*');
      
      if (error) {
        console.error('Error fetching user analytics:', error);
        throw new Error('Failed to fetch user analytics');
      }
      
      return data;
    },
  });

  // Fetch all rankings
  const { data: sellerRankings = [], isLoading: isLoadingSellerRankings } = useQuery({
    queryKey: ['sellerRankings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seller_rankings')
        .select('*')
        .limit(10);
      
      if (error) {
        console.error('Error fetching seller rankings:', error);
        throw new Error('Failed to fetch seller rankings');
      }
      
      return data;
    },
  });

  const { data: buyerRankings = [], isLoading: isLoadingBuyerRankings } = useQuery({
    queryKey: ['buyerRankings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('buyer_rankings')
        .select('*')
        .limit(10);
      
      if (error) {
        console.error('Error fetching buyer rankings:', error);
        throw new Error('Failed to fetch buyer rankings');
      }
      
      return data;
    },
  });

  const { data: productRankings = [], isLoading: isLoadingProductRankings } = useQuery({
    queryKey: ['productRankings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_rankings')
        .select('*')
        .limit(10);
      
      if (error) {
        console.error('Error fetching product rankings:', error);
        throw new Error('Failed to fetch product rankings');
      }
      
      return data;
    },
  });

  const { data: categoryRankings = [], isLoading: isLoadingCategoryRankings } = useQuery({
    queryKey: ['categoryRankings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('category_rankings')
        .select('*')
        .limit(10);
      
      if (error) {
        console.error('Error fetching category rankings:', error);
        throw new Error('Failed to fetch category rankings');
      }
      
      return data;
    },
  });

  const totalUsers = userAnalytics.reduce((sum, item) => sum + item.count, 0);
  const sellers = userAnalytics.find(item => item.role === 'seller')?.count || 0;
  const customers = userAnalytics.find(item => item.role === 'customer')?.count || 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="h-8 w-8 text-yellow-500" />
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}. Manage users and view analytics.
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{totalUsers}</p>
                </div>
                <div className="bg-primary/10 p-3 rounded-full">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sellers</p>
                  <p className="text-2xl font-bold">{sellers}</p>
                </div>
                <div className="bg-primary/10 p-3 rounded-full">
                  <ShoppingBag className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Customers</p>
                  <p className="text-2xl font-bold">{customers}</p>
                </div>
                <div className="bg-primary/10 p-3 rounded-full">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Products</p>
                  <p className="text-2xl font-bold">{productRankings.length}</p>
                </div>
                <div className="bg-primary/10 p-3 rounded-full">
                  <Package className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="rankings">Rankings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user accounts and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <UserManagement />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Platform Analytics</CardTitle>
                <CardDescription>Visual insights into platform performance</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingAnalytics ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <AnalyticsCharts userAnalytics={userAnalytics} />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="rankings">
            <div className="space-y-6">
              <RankingsDisplay
                sellerRankings={sellerRankings}
                buyerRankings={buyerRankings}
                productRankings={productRankings}
                categoryRankings={categoryRankings}
                isLoading={isLoadingSellerRankings || isLoadingBuyerRankings || isLoadingProductRankings || isLoadingCategoryRankings}
              />
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
