
import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import SignInModal from "./SignInModal";
import SignUpModal from "./SignUpModal";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "customer" | "seller";
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setShowSignInModal(true);
    }
  }, [isAuthenticated]);

  // If user is authenticated but doesn't have the required role
  if (isAuthenticated && requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  // If user is authenticated, show the protected content
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // If not authenticated, show auth modals and return null (won't render the protected content)
  return (
    <>
      <SignInModal 
        isOpen={showSignInModal}
        onClose={() => setShowSignInModal(false)}
        onOpenSignUp={() => {
          setShowSignInModal(false);
          setShowSignUpModal(true);
        }}
      />
      <SignUpModal 
        isOpen={showSignUpModal}
        onClose={() => setShowSignUpModal(false)}
        onOpenSignIn={() => {
          setShowSignUpModal(false);
          setShowSignInModal(true);
        }}
      />
      <Navigate to="/" state={{ from: location }} replace />
    </>
  );
};

export default ProtectedRoute;
