// src/pages/merchant/MerchantTodayPage.tsx

const EmptyStateIllustration = () => (
  <svg
    className="mx-auto h-24 w-24 text-neutral-300"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M4 2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM4 4v16h16V4H4zm2 2h12v2H6V6zm0 4h12v2H6v-2zm0 4h8v2H6v-2z"
      fill="currentColor"
    />
  </svg>
);

export const MerchantTodayPage = () => {
  // In a real app, you'd fetch reservations
  const reservations = [];

  return (
    <div>
      {reservations.length === 0 ? (
        <div className="py-16 text-center">
          <EmptyStateIllustration />
          <h2 className="mt-4 text-2xl font-bold text-neutral-800">
            You don't have any reservations
          </h2>
          <p className="mt-2 text-neutral-500">
            When a guest books a deal, their reservation will appear here.
          </p>
        </div>
      ) : (
        <div>{/* List of reservations would go here */}</div>
      )}
    </div>
  );
};
