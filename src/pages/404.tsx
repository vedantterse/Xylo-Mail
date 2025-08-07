import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Import FuzzyText normally since it might not have window dependencies
const FuzzyText = dynamic(() => import("@/components/ui/FuzzyText/FuzzyText"), {
  ssr: false,
});

// Dynamically import FaultyTerminal with SSR disabled
const FaultyTerminal = dynamic(
  () => import("@/components/ui/FaultyTerminal/FaultyTerminal"),
  { ssr: false }
);

const NotFound = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    console.error(
      "404 Error: User attempted to access non-existent route:",
      router.asPath
    );
  }, [router.asPath]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-4xl">404 - Page Not Found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative w-full overflow-hidden flex flex-col">
      {/* Background Terminal - with more subtle settings */}
      <div className="absolute inset-0 z-0">
        <FaultyTerminal
          scale={0.4}
          timeScale={0.1}
          curvature={0.2}
          scanlineIntensity={0.2}
          noiseAmp={0.6}
          glitchAmount={1.0}
          flickerAmount={0.5}
          chromaticAberration={0.5}
          mouseReact={true}
          mouseStrength={0.15}
          tint="#285e0bff"
          brightness={0.7}
        />
      </div>

      {/* Centered Content */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <FuzzyText
          fontSize="clamp(1.5rem, 5vw, 9rem)"
          fontWeight={1000}
          color="#821537ff"
          enableHover={false}
          baseIntensity={0.1}
        >
          404 : Page Not Found
        </FuzzyText>
      </div>
    </div>
  );
};

export default NotFound;

