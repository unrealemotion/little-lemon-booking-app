import React, { useState, useEffect } from 'react';

function BookingForm({ availableTimes, dispatchTimes, submitForm, isSubmitting }) {
  // State for form fields
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState('1'); // Default to 1 guest
  const [occasion, setOccasion] = useState('Birthday'); // Default occasion
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  // State for validation feedback
  const [errors, setErrors] = useState({});

  // State to track if form fields have been touched (for showing errors)
  const [touched, setTouched] = useState({
    date: false,
    time: false,
    guests: false,
    firstName: false,
    email: false,
  });

  // Get today's date for the min attribute on the date input
  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Fetch available times when the date changes
  useEffect(() => {
    if (date) {
      dispatchTimes({ type: 'UPDATE_TIMES', payload: date });
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]); // Rerun effect when date changes

   // Validation logic
   useEffect(() => {
     const newErrors = {};
     if (touched.date && !date) newErrors.date = 'Date is required.';
     if (touched.time && !time) newErrors.time = 'Time is required.';
     if (touched.guests && (guests < 1 || guests > 10)) newErrors.guests = 'Must be between 1 and 10 guests.';
     if (touched.firstName && !firstName.trim()) newErrors.firstName = 'First name is required.';
     if (touched.email) {
        if (!email) {
          newErrors.email = 'Email is required.';
        } else if (!/\S+@\S+\.\S+/.test(email)) { // Basic email format check
          newErrors.email = 'Email address is invalid.';
        }
     }
     setErrors(newErrors);
   }, [date, time, guests, occasion, firstName, email, touched]); // Re-validate when relevant fields change

  // Check if the form is valid overall
  const isFormValid = () => {
    return (
      date && time && guests >= 1 && guests <= 10 && firstName.trim() && email && /\S+@\S+\.\S+/.test(email)
    );
  };

  const handleBlur = (fieldName) => {
      setTouched(prev => ({ ...prev, [fieldName]: true }));
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mark all fields as touched on submit attempt
    setTouched({ date: true, time: true, guests: true, firstName: true, email: true });

    if (isFormValid()) {
      const formData = { date, time, guests, occasion, firstName, lastName, email, specialRequests };
      submitForm(formData); // Call the function passed from App/Main
    } else {
      console.log("Form has errors, cannot submit.");
      // Errors will be displayed due to the useEffect validation
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate> {/* noValidate disables default browser popups */}
      <fieldset> {/* Group related fields */}
        <legend>Reservation Details</legend>

        {/* Date Input */}
        <div className="form-group">
          <label htmlFor="res-date">Choose date *</label>
          <input
            type="date"
            id="res-date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            onBlur={() => handleBlur('date')} // Mark as touched on blur
            required
            min={getTodayString()} // Prevent past dates
            aria-required="true"
            aria-invalid={!!errors.date} // Set aria-invalid based on error state
            aria-describedby={errors.date ? "date-error" : undefined}
          />
           {errors.date && <p id="date-error" className="error-message">{errors.date}</p>}
        </div>

        {/* Time Input */}
        <div className="form-group">
          <label htmlFor="res-time">Choose time *</label>
          <select
            id="res-time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            onBlur={() => handleBlur('time')}
            required
            aria-required="true"
             aria-invalid={!!errors.time}
             aria-describedby={errors.time ? "time-error" : undefined}
          >
            <option value="" disabled>Select a time</option>
            {availableTimes && availableTimes.length > 0 ? (
                availableTimes.map(t => <option key={t} value={t}>{t}</option>)
            ) : (
                <option disabled>No times available for selected date</option>
            )}
          </select>
           {errors.time && <p id="time-error" className="error-message">{errors.time}</p>}
        </div>

        {/* Number of Guests Input */}
        <div className="form-group">
          <label htmlFor="guests">Number of guests *</label>
          <input
            type="number"
            placeholder="1"
            min="1"
            max="10"
            id="guests"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            onBlur={() => handleBlur('guests')}
            required
            aria-required="true"
             aria-invalid={!!errors.guests}
             aria-describedby={errors.guests ? "guests-error" : undefined}
          />
          {errors.guests && <p id="guests-error" className="error-message">{errors.guests}</p>}
        </div>

        {/* Occasion Select */}
        <div className="form-group">
          <label htmlFor="occasion">Occasion</label>
          <select
            id="occasion"
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
          >
            <option>Birthday</option>
            <option>Anniversary</option>
            <option>Business</option>
            <option>Other</option>
          </select>
        </div>
      </fieldset>

      <fieldset>
         <legend>Contact Information</legend>
          {/* First Name */}
          <div className="form-group">
            <label htmlFor="firstName">First Name *</label>
            <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                onBlur={() => handleBlur('firstName')}
                required
                aria-required="true"
                aria-invalid={!!errors.firstName}
                aria-describedby={errors.firstName ? "firstName-error" : undefined}
            />
             {errors.firstName && <p id="firstName-error" className="error-message">{errors.firstName}</p>}
          </div>

           {/* Last Name */}
           <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
            />
          </div>

           {/* Email */}
           <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur('email')}
                required
                aria-required="true"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
            />
             {errors.email && <p id="email-error" className="error-message">{errors.email}</p>}
          </div>

           {/* Special Requests */}
           <div className="form-group">
            <label htmlFor="specialRequests">Special Requests (Optional)</label>
            <textarea
                id="specialRequests"
                rows="4"
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
            />
          </div>
      </fieldset>


      {/* Submit Button */}
      <button type="submit" disabled={!isFormValid() || isSubmitting} aria-label="On Click: Make Your reservation">
        {isSubmitting ? 'Submitting...' : 'Make Your reservation'}
        </button>
    </form>
  );
}

export default BookingForm;