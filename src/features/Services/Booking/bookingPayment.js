export const isFreeBooking = (booking) => {
  if (booking?.price === null || booking?.price === undefined) return false;

  const price = Number(booking.price);
  return Number.isFinite(price) && price === 0;
};
