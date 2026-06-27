import LoginForm from '@/components/LoginForm';
import React, { Suspense } from 'react';

const LogInPage = () => {
  return (
    <div className="container mx-auto min-h-[80vh] flex justify-center items-center p-4">
      {/* 
       npm buil fail hoay uesSearchParams er jonno LoginForm name alada component banay suspense diya wrap kora hoyase
      */}
      <Suspense
        fallback={
          <div className="text-amber-500 font-mono text-xs uppercase tracking-widest animate-pulse">
            Establishing Connection...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
};

export default LogInPage;
