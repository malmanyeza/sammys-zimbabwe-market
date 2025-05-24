
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Search, ShoppingCart, User, LogIn, LogOut, Package, Bot } from "lucide-react";
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import SignInModal from '@/components/auth/SignInModal';
import SignUpModal from '@/components/auth/SignUpModal';

const Navbar = () => {
  const { items } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  
  const cartItemsCount = items.reduce((total, item) => total + item.quantity, 0);
  
  const handleOpenSignIn = () => {
    setShowSignInModal(true);
    setShowSignUpModal(false);
  };
  
  const handleOpenSignUp = () => {
    setShowSignUpModal(true);
    setShowSignInModal(false);
  };
  
  const handleCloseModals = () => {
    setShowSignInModal(false);
    setShowSignUpModal(false);
  };

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
          <Link to="/product-assistant" className="hidden md:flex items-center gap-2 text-foreground hover:text-primary transition-colors">
            <Bot className="h-4 w-4" />
            AI Assistant
          </Link>
          {isAuthenticated && user?.role === 'seller' && (
            <Link to="/seller-dashboard" className="hidden md:block text-foreground hover:text-primary transition-colors">
              Seller Dashboard
            </Link>
          )}
        </div>
        
        <div className="hidden md:flex items-center space-x-6">
          <div className="relative">
            <input type="text" placeholder="Search products..." className="pl-10 pr-4 py-2 border border-gray-200 rounded-full w-64 focus:outline-none focus:border-primary" />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Link to="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Button>
          </Link>
          
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-gray-50">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                {user?.role === 'seller' && (
                  <DropdownMenuItem asChild>
                    <Link to="/seller-dashboard">
                      <Package className="mr-2 h-4 w-4" />
                      <span>Seller Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              variant="default" 
              className="bg-primary hover:bg-primary/90" 
              onClick={handleOpenSignIn}
            >
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Button>
          )}
        </div>
      </div>

      <SignInModal 
        isOpen={showSignInModal} 
        onClose={handleCloseModals} 
        onOpenSignUp={handleOpenSignUp} 
      />
      <SignUpModal 
        isOpen={showSignUpModal} 
        onClose={handleCloseModals} 
        onOpenSignIn={handleOpenSignIn} 
      />
    </nav>
  );
};

export default Navbar;
