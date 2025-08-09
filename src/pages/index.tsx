
import React, { useEffect, useState } from 'react';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { EmailFileSharing } from '@/components/EmailFileSharing';
import Balatro from "@/components/ui/Balatro/Balatro";
// // import dynamic from 'next/dynamic'
// import TextCursor from '@/components/ui/TextCursor/TextCursor';
import SplashCursor from "@/components/ui/SplashCursor/SplashCursor";

// Dynamically import components that use browser APIs
// const MainApp = dynamic(() => import('@/components/MainApp'), { 
//   ssr: false,
//   loading: () => <div className="min-h-screen bg-background flex items-center justify-center">
//     <div className="text-foreground">Loading...</div>
//   </div>
// })

const Index = () => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-foreground">Loading...</div>
    </div>
  }

  return (
    <div className="min-h-screen relative w-full overflow-hidden flex flex-col">
      {/* <TextCursor text="💵"/> */}
      <SplashCursor />
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 z-0">
          <AnimatedBackground />
        </div>
        <div className="absolute inset-0 z-10">
          <Balatro
            isRotate={false}
            mouseInteraction={true}
            pixelFilter={700}
          />
        </div>
      </div>

      {/* Main content */}
      <main className="relative z-20 flex-1 flex items-center justify-center">
        <EmailFileSharing />
      </main>
    </div>
  );
};

export default Index;