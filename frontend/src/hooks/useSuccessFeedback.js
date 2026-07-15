import { useState, useEffect } from 'react';

export const useSuccessFeedback = (initialMessage = null, duration = 4000) => {
  const [successMessage, setSuccessMessage] = useState(initialMessage);

  useEffect(() => {
    if (successMessage) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [successMessage, duration]);

  const clearSuccess = () => setSuccessMessage(null);

  return { successMessage, setSuccessMessage, clearSuccess };
};

export default useSuccessFeedback;
