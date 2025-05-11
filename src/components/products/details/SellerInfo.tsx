
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from 'lucide-react';

interface SellerInfoProps {
  sellerId: string;
}

interface Profile {
  id: string;
  name: string;
  created_at: string;
}

const SellerInfo = ({ sellerId }: SellerInfoProps) => {
  const [seller, setSeller] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSellerInfo = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sellerId)
          .single();
          
        if (error) {
          console.error('Error fetching seller info:', error);
        } else {
          setSeller(data as Profile);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (sellerId) {
      fetchSellerInfo();
    }
  }, [sellerId]);

  if (loading) {
    return (
      <Card className="p-6 flex justify-center items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <User className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">{seller?.name || "Zimbabwe Artisans Collective"}</h3>
          <p className="text-sm text-muted-foreground">
            Member since {seller?.created_at 
              ? new Date(seller.created_at).getFullYear() 
              : "2023"}
          </p>
        </div>
      </div>
      <Button variant="outline" className="w-full">
        View Seller's Store
      </Button>
    </Card>
  );
};

export default SellerInfo;
