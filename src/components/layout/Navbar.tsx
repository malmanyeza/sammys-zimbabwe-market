
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Search, ShoppingCart, User } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="bg-background border-b border-primary/10 py-4 px-6 fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link to="/">
            <h1 className="text-2xl font-bold text-primary">Sammy's Market</h1>
          </Link>
          <Link to="/products" className="hidden md:block text-foreground hover:text-primary transition-colors">
            Products
          </Link>
        </div>
        
        <div className="hidden md:flex items-center space-x-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-full w-64 focus:outline-none focus:border-primary"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-primary text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
              0
            </span>
          </Button>
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
          <Button variant="default" className="bg-primary hover:bg-primary/90">
            Sign In
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
