
import React from 'react';
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import { Link } from "react-router-dom";

const FloatingAiButton = () => {
  return (
    <Link to="/product-assistant">
      <Button
        size="lg"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 z-50 group"
        aria-label="Chat with AI Assistant"
      >
        <Bot className="h-6 w-6 text-white" />
      </Button>
    </Link>
  );
};

export default FloatingAiButton;
