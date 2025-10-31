import React from 'react';
import { Component as SignInForm } from '@/components/ui/sign-in-flo';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <SignInForm />
    </div>
  );
};

export default LandingPage;
