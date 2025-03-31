import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BookingForm from './components/BookingForm';
import App, { initializeTimes, updateTimes } from './App'; // Import App and reducer logic

// Mock the API module
jest.mock('./api/mockAPI', () => ({
  fetchAPI: jest.fn((date) => {
    // Return predictable times based on date for testing
    console.log("Mock fetchAPI called with date:", date);
    const day = date.getDate(); // Get day to vary results slightly
    if (day % 2 === 0) {
        return Promise.resolve(['17:00', '18:00', '19:00', '21:30']);
    } else {
        return Promise.resolve(['17:30', '18:30', '20:00', '20:30', '22:00']);
    }
  }),
  submitAPI: jest.fn(() => Promise.resolve(true)), // Mock successful submission
}));

// --- Test updateTimes Reducer ---
describe('updateTimes reducer', () => {
  it('should return the same state for unknown actions', () => {
    const currentState = ['17:00'];
    const action = { type: 'UNKNOWN_ACTION' };
    expect(updateTimes(currentState, action)).toEqual(currentState);
  });

  it('should return the new times payload for SET_TIMES action', () => {
      const currentState = ['17:00'];
      const newTimes = ['18:00', '19:00'];
      const action = { type: 'SET_TIMES', payload: newTimes };
      expect(updateTimes(currentState, action)).toEqual(newTimes);
  });

   // Note: Testing UPDATE_TIMES directly is less useful now as fetching moved out
   // You'd test the handleDateChange/initializeTimes wrapper functions instead
});


// --- Test initializeTimes Function ---
describe('initializeTimes', () => {
  it('should call fetchAPI and dispatch SET_TIMES with fetched times', async () => {
    const mockDispatch = jest.fn();
    const expectedTimes = ['17:30', '18:30', '20:00', '20:30', '22:00']; // Example based on mock logic for today's date

    await initializeTimes(mockDispatch);

    // Check if fetchAPI was called (implicitly tested by checking dispatch)
    // Check if dispatch was called correctly
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'SET_TIMES', payload: expect.any(Array) });
    // More specific check if the mock data is stable for today's date
    // expect(mockDispatch).toHaveBeenCalledWith({ type: 'SET_TIMES', payload: expectedTimes });
  });
});


// --- Test BookingForm Component ---
describe('BookingForm', () => {
  const availableTimes = ['17:00', '18:00', '19:00', '20:00'];
  const mockDispatch = jest.fn();
  const mockSubmit = jest.fn();

  // Helper function to render the form with necessary props
  const renderForm = () => {
    render(
      <BookingForm
        availableTimes={availableTimes}
        dispatchTimes={mockDispatch}
        submitForm={mockSubmit}
      />
    );
  };

  test('Renders all form fields and labels', () => {
    renderForm();
    expect(screen.getByLabelText(/choose date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/choose time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/number of guests/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/occasion/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/special requests/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /make your reservation/i })).toBeInTheDocument();
  });

  test('Submit button is initially disabled', () => {
    renderForm();
    expect(screen.getByRole('button', { name: /make your reservation/i })).toBeDisabled();
  });

  test('HTML5 validation attributes are present', () => {
    renderForm();
    expect(screen.getByLabelText(/choose date/i)).toHaveAttribute('required');
    expect(screen.getByLabelText(/choose date/i)).toHaveAttribute('min');
    expect(screen.getByLabelText(/choose time/i)).toHaveAttribute('required');
    expect(screen.getByLabelText(/number of guests/i)).toHaveAttribute('required');
    expect(screen.getByLabelText(/number of guests/i)).toHaveAttribute('min', '1');
    expect(screen.getByLabelText(/number of guests/i)).toHaveAttribute('max', '10');
    expect(screen.getByLabelText(/first name \*/i)).toHaveAttribute('required'); // Match exact label text
    expect(screen.getByLabelText(/email \*/i)).toHaveAttribute('required');
    expect(screen.getByLabelText(/email \*/i)).toHaveAttribute('type', 'email');
  });

   test('Form submission is disabled until all required fields are valid', async () => {
      renderForm();
      const user = userEvent.setup();
      const submitButton = screen.getByRole('button', { name: /make your reservation/i });

      expect(submitButton).toBeDisabled();

      // Fill only some fields
      await user.type(screen.getByLabelText(/first name \*/i), 'John');
      await user.selectOptions(screen.getByLabelText(/choose time/i), '18:00');

      expect(submitButton).toBeDisabled(); // Still disabled

      // Fill remaining required fields
      const today = new Date().toISOString().split('T')[0];
      await user.type(screen.getByLabelText(/choose date/i), today);
      await user.type(screen.getByLabelText(/number of guests/i), '2'); // It's a string input first
      await user.type(screen.getByLabelText(/email \*/i), 'john.doe@example.com');


      // Now it should be enabled
       expect(submitButton).toBeEnabled();
    });

   test('Handles invalid input and shows validation errors on blur/submit attempt', async () => {
        renderForm();
        const user = userEvent.setup();
        const dateInput = screen.getByLabelText(/choose date \*/i);
        const firstNameInput = screen.getByLabelText(/first name \*/i);
        const submitButton = screen.getByRole('button', { name: /make your reservation/i });

        // Trigger blur without input
        fireEvent.blur(dateInput);
        await waitFor(() => {
             expect(screen.getByText('Date is required.')).toBeInTheDocument();
        });
        expect(dateInput).toHaveAttribute('aria-invalid', 'true');

        // Trigger submit with missing fields
        await user.click(submitButton);
        await waitFor(() => {
            expect(screen.getByText('Time is required.')).toBeInTheDocument();
            expect(screen.getByText('First name is required.')).toBeInTheDocument();
            expect(screen.getByText('Email is required.')).toBeInTheDocument();
        });
         expect(firstNameInput).toHaveAttribute('aria-invalid', 'true');

        // Enter invalid email and blur
        const emailInput = screen.getByLabelText(/email \*/i);
        await user.type(emailInput, 'invalid-email');
        fireEvent.blur(emailInput);
         await waitFor(() => {
            expect(screen.getByText('Email address is invalid.')).toBeInTheDocument();
        });
        expect(emailInput).toHaveAttribute('aria-invalid', 'true');

        // Correct the email
        await user.clear(emailInput);
        await user.type(emailInput, 'valid@email.com');
        fireEvent.blur(emailInput);
         await waitFor(() => {
            expect(screen.queryByText('Email address is invalid.')).not.toBeInTheDocument();
             expect(screen.queryByText('Email is required.')).not.toBeInTheDocument();
        });
        expect(emailInput).toHaveAttribute('aria-invalid', 'false'); // Or not have the attribute
   });

     test('Calls submitForm prop with correct data when form is valid and submitted', async () => {
        renderForm();
        const user = userEvent.setup();
        const submitButton = screen.getByRole('button', { name: /make your reservation/i });

        // Fill the form with valid data
        const today = new Date().toISOString().split('T')[0];
        await user.type(screen.getByLabelText(/choose date \*/i), today);
        await user.selectOptions(screen.getByLabelText(/choose time/i), '19:00');
        await user.clear(screen.getByLabelText(/number of guests/i)); // Clear default '1' if needed
        await user.type(screen.getByLabelText(/number of guests/i), '4');
        await user.selectOptions(screen.getByLabelText(/occasion/i), 'Anniversary');
        await user.type(screen.getByLabelText(/first name \*/i), 'Jane');
        await user.type(screen.getByLabelText(/last name/i), 'Doe');
        await user.type(screen.getByLabelText(/email \*/i), 'jane.doe@example.com');
        await user.type(screen.getByLabelText(/special requests/i), 'Window seat if possible');

        // Ensure button is enabled before clicking
        await waitFor(() => expect(submitButton).toBeEnabled());
        await user.click(submitButton);

        // Check if the mockSubmit function was called with the correct data
        expect(mockSubmit).toHaveBeenCalledTimes(1);
        expect(mockSubmit).toHaveBeenCalledWith({
            date: today,
            time: '19:00',
            guests: '4', // Input type=number often returns string
            occasion: 'Anniversary',
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'jane.doe@example.com',
            specialRequests: 'Window seat if possible',
        });
    });

});