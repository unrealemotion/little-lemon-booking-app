import React, { useReducer, useState, useEffect } from 'react'; 
import './App.css';
import BookingForm from './components/BookingForm';
import ConfirmedBooking from './components/ConfirmedBooking';
import { fetchAPI, submitAPI } from './api/mockAPI'; // Import mock API functions

// Reducer function to update available times based on the selected date
export const updateTimes = (state, action) => {
  switch (action.type) {
    case 'INITIALIZE_TIMES':
    case 'UPDATE_TIMES': // Both initialize and update fetch new times
      // In a real app, action.payload would be the date used to fetch
      console.log("Fetching times for date:", action.payload || 'initial');
      // The actual fetching logic is now handled outside the reducer (see initializeTimes)
      // Here we just expect the fetched times to be passed in payload for 'SET_TIMES'
      return state; // Return current state until new times are set
    case 'SET_TIMES':
       console.log("Setting times:", action.payload);
       return action.payload; // Set the state to the newly fetched times
    default:
      return state; // Return current state for unknown actions
  }
};

// Async function to fetch initial times
export const initializeTimes = async (dispatch) => {
    const today = new Date();
    try {
        const times = await fetchAPI(today); // Fetch for today initially
        dispatch({ type: 'SET_TIMES', payload: times }); // Dispatch action to set times
    } catch (error) {
        console.error("Failed to initialize times:", error);
        dispatch({ type: 'SET_TIMES', payload: [] }); // Set to empty on error
    }
};

function App() {
  // useReducer for managing available times
  // initializeTimes is called outside the reducer to handle async fetching
  const [availableTimes, dispatchTimes] = useReducer(updateTimes, []);

  // State to track booking confirmation status
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // To potentially disable form during submission

   // Effect to initialize times when the component mounts
   useEffect(() => {
       initializeTimes(dispatchTimes);
   }, []); // Empty dependency array ensures this runs only once


  // Function to handle form submission passed down to BookingForm
  const submitForm = async (formData) => {
    setIsSubmitting(true);
    try {
      const success = await submitAPI(formData); // Call the mock submission API
      if (success) {
        setBookingConfirmed(true); // Update state to show confirmation
      } else {
        alert("Booking failed. Please try again."); // Or show a more integrated error
      }
    } catch (error) {
       console.error("Submission error:", error);
       alert("An error occurred during booking. Please try again.");
    } finally {
        setIsSubmitting(false);
    }
  };

    // Function to update times when date changes in BookingForm
    // This needs to be async because fetchAPI is async
    const handleDateChange = async (action) => {
        dispatchTimes(action); // Dispatch UPDATE_TIMES first (optional, maybe for loading state)
        try {
            const date = new Date(action.payload); // Convert string back to Date if needed by API
            const newTimes = await fetchAPI(date);
            dispatchTimes({ type: 'SET_TIMES', payload: newTimes });
        } catch (error) {
            console.error("Failed to update times:", error);
            dispatchTimes({ type: 'SET_TIMES', payload: [] }); // Set empty on error
        }
    };


  return (
    <div className="container main-layout">
      <header className="app-header">
        {/* Basic Header for the App */}
        <img src="/logo.png" alt="Little Lemon Logo" height="50" /> {/* Assuming logo in public folder */}
        <h1>Little Lemon Restaurant</h1>
      </header>
      <main>
        {/* Conditionally render BookingForm or ConfirmedBooking */}
        {!bookingConfirmed ? (
          <>
            <h2>Reserve a Table</h2>
            <BookingForm
              availableTimes={availableTimes}
              dispatchTimes={handleDateChange} // Pass the wrapper function
              submitForm={submitForm}
              isSubmitting={isSubmitting}
            />
          </>
        ) : (
          <ConfirmedBooking />
        )}
      </main>
      <footer className="app-footer">
        <p>© {new Date().getFullYear()} Little Lemon</p>
      </footer>
    </div>
  );
}

export default App;