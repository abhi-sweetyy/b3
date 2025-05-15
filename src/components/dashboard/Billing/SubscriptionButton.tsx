import { useState } from 'react';

interface SubscriptionButtonProps {
  isPro: boolean;
  isLoading: boolean;
}

export default function SubscriptionButton({ isPro, isLoading }: SubscriptionButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleSubscriptionAction = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Subscription action failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSubscriptionAction}
      disabled={loading || isLoading}
      className="w-full px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
    >
      {loading ? 'Processing...' : 'Upgrade to Pro'}
    </button>
  );
} 