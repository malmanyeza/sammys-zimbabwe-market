
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { User } from "lucide-react";

const SellerInfo = () => {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <User className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Zimbabwe Artisans Collective</h3>
          <p className="text-sm text-muted-foreground">Member since 2023</p>
        </div>
      </div>
      <Button variant="outline" className="w-full">
        View Seller's Store
      </Button>
    </Card>
  );
};

export default SellerInfo;
