import React from 'react';

function ConfirmedBooking() {
  return (
    <div className="confirmation">
      <h2>Booking Confirmed!</h2>
      <p>Thank you for reserving a table at Little Lemon.</p>
      <p>You will receive an email confirmation shortly.</p>
      {/* You could add booking details here if passed as props */}
    </div>
  );
}

export default ConfirmedBooking;