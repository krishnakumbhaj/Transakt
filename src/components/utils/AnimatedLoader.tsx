import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'minimal' | 'cosmic' | 'rainbow';
  showText?: boolean;
  text?: string;
}

const AnimatedLoader: React.FC<LoaderProps> = ({ 
  size = 'md', 
  variant = 'default',
  showText = false,
  text = 'Loading...'
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-28 h-28',
    xl: 'w-36 h-36'
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'minimal':
        return {
          circle1: 'bg-gradient-to-br from-gray-400 to-gray-600',
          circle2: 'bg-gradient-to-br from-gray-300 to-gray-500',
          circle3: 'bg-gradient-to-br from-gray-600 to-gray-800',
          circle4: 'bg-gradient-to-br from-gray-350 to-gray-550',
          center: 'bg-gradient-to-br from-white to-gray-200'
        };
      case 'cosmic':
        return {
          circle1: 'bg-gradient-to-br from-cyan-400 to-blue-600',
          circle2: 'bg-gradient-to-br from-purple-400 to-cyan-500',
          circle3: 'bg-gradient-to-br from-indigo-700 to-purple-900',
          circle4: 'bg-gradient-to-br from-blue-400 to-purple-400',
          center: 'bg-gradient-to-br from-white to-cyan-200'
        };
      case 'rainbow':
        return {
          circle1: 'bg-gradient-to-br from-red-400 to-pink-600',
          circle2: 'bg-gradient-to-br from-yellow-400 to-orange-500',
          circle3: 'bg-gradient-to-br from-green-400 to-blue-500',
          circle4: 'bg-gradient-to-br from-purple-400 to-pink-400',
          center: 'bg-gradient-to-br from-white to-yellow-200'
        };
      default:
        return {
          circle1: 'bg-gradient-to-br from-purple-500 to-purple-600',
          circle2: 'bg-gradient-to-br from-pink-400 to-purple-500',
          circle3: 'bg-gradient-to-br from-indigo-700 to-indigo-900',
          circle4: 'bg-gradient-to-br from-purple-400 to-pink-400',
          center: 'bg-gradient-to-br from-white to-purple-200'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Outer glow effect */}
      <div className="relative">
        <div className={`${sizeClasses[size]} relative`}>
          {/* Background blur circles for glow effect */}
          <div className="absolute inset-0 animate-spin">
            <div className={`absolute top-0 left-1/2 w-8 h-8 ${styles.circle1} rounded-full transform -translate-x-1/2 blur-sm opacity-60`}></div>
            <div className={`absolute top-1/2 right-0 w-10 h-10 ${styles.circle2} rounded-full transform -translate-y-1/2 blur-sm opacity-60`}></div>
            <div className={`absolute bottom-0 left-0 w-6 h-6 ${styles.circle3} rounded-full blur-sm opacity-60`}></div>
            <div className={`absolute top-1/4 left-1/4 w-7 h-7 ${styles.circle4} rounded-full blur-sm opacity-60`}></div>
          </div>

          {/* Main spinning container with different speeds */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
            {/* Main purple circle */}
            <div className={`absolute top-0 left-1/2 w-8 h-8 ${styles.circle1} rounded-full transform -translate-x-1/2 shadow-2xl animate-pulse`} 
                 style={{ animationDelay: '0s', animationDuration: '2s' }}></div>
            
            {/* Pink circle with bounce */}
            <div className={`absolute top-1/2 right-0 w-10 h-10 ${styles.circle2} rounded-full transform -translate-y-1/2 shadow-2xl opacity-90 animate-bounce`}
                 style={{ animationDelay: '0.5s', animationDuration: '1.5s' }}></div>
            
            {/* Dark blue circle */}
            <div className={`absolute bottom-0 left-0 w-6 h-6 ${styles.circle3} rounded-full shadow-2xl animate-pulse`}
                 style={{ animationDelay: '1s', animationDuration: '2.5s' }}></div>
            
            {/* Light purple circle */}
            <div className={`absolute top-1/4 left-1/4 w-7 h-7 ${styles.circle4} rounded-full shadow-2xl opacity-80 animate-ping`}
                 style={{ animationDelay: '1.5s', animationDuration: '3s' }}></div>
          </div>

          {/* Counter-rotating inner elements */}
          <div className="absolute inset-0 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '4s' }}>
            <div className="absolute top-1/3 right-1/3 w-4 h-4 bg-gradient-to-br from-white to-purple-300 rounded-full shadow-lg opacity-70 animate-pulse"></div>
            <div className="absolute bottom-1/3 left-1/2 w-3 h-3 bg-gradient-to-br from-pink-300 to-white rounded-full shadow-lg opacity-60"></div>
          </div>
          
          {/* Enhanced pulsing center */}
          <div className={`absolute top-1/2 left-1/2 w-4 h-4 ${styles.center} rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-lg`}>
            <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent rounded-full animate-ping opacity-75"></div>
            <div className="absolute inset-1 bg-white rounded-full animate-pulse"></div>
          </div>

          {/* Orbiting particles */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '8s' }}>
            <div className="absolute top-2 left-1/2 w-1 h-1 bg-purple-400 rounded-full opacity-60"></div>
            <div className="absolute right-2 top-1/2 w-1 h-1 bg-pink-400 rounded-full opacity-60"></div>
            <div className="absolute bottom-2 left-1/2 w-1 h-1 bg-indigo-400 rounded-full opacity-60"></div>
            <div className="absolute left-2 top-1/2 w-1 h-1 bg-purple-300 rounded-full opacity-60"></div>
          </div>
        </div>

        {/* Animated loading text */}
        {showText && (
          <div className="mt-8 text-center">
            <p className="text-lg font-medium text-gray-700 animate-pulse">
              {text}
            </p>
            <div className="flex justify-center mt-2 space-x-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
      </div>

      {/* Custom CSS animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.4); }
          50% { box-shadow: 0 0 40px rgba(168, 85, 247, 0.8); }
        }
      `}</style>
    </div>
  );
};

export default AnimatedLoader;