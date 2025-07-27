import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Search, ShoppingCart, User, LogIn, LogOut, Package, Bot, History, Menu, ShoppingBag, Grid3X3, Store, Crown, UserPlus } from "lucide-react";
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import SignInModal from '@/components/auth/SignInModal';
import SignUpModal from '@/components/auth/SignUpModal';
import UserProfile from '@/components/seller/UserProfile';
import MobileCategorySelector from './MobileCategorySelector';

const Navbar = () => {
  const { items } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  
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
          {isAuthenticated && (
            <Link to="/purchase-history" className="hidden md:flex items-center gap-2 text-foreground hover:text-primary transition-colors">
              <History className="h-4 w-4" />
              Purchase History
            </Link>
          )}
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
                <UserProfile 
                  trigger={
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                  }
                />
                <DropdownMenuItem asChild>
                  <Link to="/purchase-history">
                    <History className="mr-2 h-4 w-4" />
                    <span>Purchase History</span>
                  </Link>
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

      {/* Mobile Menu */}
      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <Menu className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white">
            <DropdownMenuLabel>Navigation</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/products" className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Products
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/product-assistant" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                AI Assistant
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <div className="w-full">
                <MobileCategorySelector 
                  trigger={
                    <button className="w-full flex items-center gap-2 text-sm">
                      <Grid3X3 className="h-4 w-4" />
                      Categories
                    </button>
                  }
                />
              </div>
            </DropdownMenuItem>
            {user ? (
              <>
                <DropdownMenuSeparator />
                {user.role === 'seller' && (
                  <DropdownMenuItem asChild>
                    <Link to="/seller-dashboard" className="flex items-center gap-2">
                      <Store className="h-4 w-4" />
                      Seller Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                {user.role === 'admin' && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin-dashboard" className="flex items-center gap-2">
                      <Crown className="h-4 w-4" />
                      Admin Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/purchase-history" className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Purchase History
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowSignIn(true)}>
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowSignUp(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Sign Up
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
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
