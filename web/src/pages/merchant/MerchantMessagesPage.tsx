// src/pages/merchant/MerchantMessagesPage.tsx
export const MerchantMessagesPage = () => {
  return (
    <div className="py-16 text-center">
      <div className="mx-auto mb-4 h-24 w-24 text-neutral-300">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-neutral-800">
        Messages coming soon
      </h2>
      <p className="mt-2 text-neutral-500">
        Chat with customers about their reservations.
      </p>
    </div>
  );
};
