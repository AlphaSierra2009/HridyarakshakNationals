import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface WelcomeBannerProps {
  username: string;
}

export const WelcomeBanner = ({ username }: WelcomeBannerProps) => {
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBanner(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center py-8 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 backdrop-blur-xl border-b"
        >
          <div className="text-center">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              👋 Welcome back, {username}!
            </h2>
            <p className="text-muted-foreground mt-2">Your ECG monitoring dashboard is ready</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
