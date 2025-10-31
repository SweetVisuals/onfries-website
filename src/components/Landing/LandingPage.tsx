import React from 'react';
import { Button } from '@/components/ui/button';
import { Component as SignInForm } from '@/components/ui/sign-in-flo';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-background">
      <SignInForm />
    </div>
  );
};

export default LandingPage;
