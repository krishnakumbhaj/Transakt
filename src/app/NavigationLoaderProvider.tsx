'use client';
import { useRouter, usePathname } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';
import AnimatedLoader from '../components/utils/AnimatedLoader'; // Your loader component

const NavigationContext = createContext({
  isLoading: false,
  navigate: (url: string) => {},
});

export const useNavigation = () => useContext(NavigationContext);

export const NavigationLoaderProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname(); // This detects route change
  const [isLoading, setIsLoading] = useState(false);

  const navigate = (url: string) => {
    setIsLoading(true);
    router.push(url);
  };

  // When pathname changes, stop loading
  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  return (
    <NavigationContext.Provider value={{ isLoading, navigate }}>
      {isLoading && <AnimatedLoader showText variant="cosmic" text="Redirecting..." />}
      {children}
    </NavigationContext.Provider>
  );
};
