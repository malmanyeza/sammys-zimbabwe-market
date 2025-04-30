
import React, { useState } from "react";
import SignInModal from "./SignInModal";
import SignUpModal from "./SignUpModal";

interface AuthModalsProps {
  defaultOpen?: "signin" | "signup" | null;
}

const AuthModals: React.FC<AuthModalsProps> = ({ defaultOpen = null }) => {
  const [showSignInModal, setShowSignInModal] = useState(defaultOpen === "signin");
  const [showSignUpModal, setShowSignUpModal] = useState(defaultOpen === "signup");

  const openSignInModal = () => {
    setShowSignInModal(true);
    setShowSignUpModal(false);
  };

  const openSignUpModal = () => {
    setShowSignInModal(false);
    setShowSignUpModal(true);
  };

  return (
    <>
      <SignInModal
        isOpen={showSignInModal}
        onClose={() => setShowSignInModal(false)}
        onOpenSignUp={openSignUpModal}
      />
      <SignUpModal
        isOpen={showSignUpModal}
        onClose={() => setShowSignUpModal(false)}
        onOpenSignIn={openSignInModal}
      />
    </>
  );
};

export default AuthModals;

// Export helper functions
export const useAuthModals = () => {
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  const openSignInModal = () => {
    setShowSignInModal(true);
    setShowSignUpModal(false);
  };

  const openSignUpModal = () => {
    setShowSignInModal(false);
    setShowSignUpModal(true);
  };

  const closeModals = () => {
    setShowSignInModal(false);
    setShowSignUpModal(false);
  };

  const AuthModalsComponent = () => (
    <>
      <SignInModal
        isOpen={showSignInModal}
        onClose={() => setShowSignInModal(false)}
        onOpenSignUp={openSignUpModal}
      />
      <SignUpModal
        isOpen={showSignUpModal}
        onClose={() => setShowSignUpModal(false)}
        onOpenSignIn={openSignInModal}
      />
    </>
  );

  return {
    openSignInModal,
    openSignUpModal,
    closeModals,
    AuthModalsComponent
  };
};
