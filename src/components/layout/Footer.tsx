
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-secondary text-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Sammy's Market</h3>
            <p className="text-white/80">
              Bringing authentic Zimbabwean crafts and culture to your doorstep.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-white/80 hover:text-accent">About Us</a></li>
              <li><a href="#" className="text-white/80 hover:text-accent">Products</a></li>
              <li><a href="#" className="text-white/80 hover:text-accent">Artisans</a></li>
              <li><a href="#" className="text-white/80 hover:text-accent">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Categories</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-white/80 hover:text-accent">Crafts</a></li>
              <li><a href="#" className="text-white/80 hover:text-accent">Jewelry</a></li>
              <li><a href="#" className="text-white/80 hover:text-accent">Clothing</a></li>
              <li><a href="#" className="text-white/80 hover:text-accent">Art</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Newsletter</h4>
            <p className="text-white/80 mb-4">Subscribe to receive updates about new products and cultural events.</p>
            <input
              type="email"
              placeholder="Your email"
              className="w-full px-4 py-2 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:border-accent"
            />
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/10 text-center text-white/60">
          <p>&copy; 2024 Sammy's Market. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
