// Simulates fetching available booking times for a given date
// In a real app, this would make a network request to a backend API

// Helper to create seeded random numbers for consistent mock data
const seededRandom = function (seed) {
    var m = 2**35 - 31;
    var a = 185852;
    var s = seed % m;
    return function () {
        return (s = s * a % m) / m;
    };
}

// Function to fetch available times based on a date string (YYYY-MM-DD)
const fetchAPI = function(date) {
    let result = [];
    let random = seededRandom(date.getDate()); // Use day of the month as seed

    for(let i = 17; i <= 23; i++) { // Example restaurant hours 5 PM to 11 PM
        if(random() < 0.5) { // 50% chance a time slot is available
            result.push(i + ':00');
        }
        if(random() < 0.5) { // 50% chance a half-hour slot is available
            result.push(i + ':30');
        }
    }
    // Simulate network delay
    return new Promise((resolve) => {
        setTimeout(() => resolve(result), 600 + random() * 400); // Delay 0.6-1s
    });
};

// Simulates submitting form data
// In a real app, this would POST data to a backend API
const submitAPI = function(formData) {
    console.log("Submitting Form Data:", formData);
    // Simulate network request success/failure
    return new Promise((resolve) => {
        setTimeout(() => {
             // Simulate a successful submission ~80% of the time
            const success = Math.random() < 0.9; // Higher chance of success for demo
            resolve(success);
        }, 600 + Math.random() * 400); // Delay 0.6-1s
    });

};

export { fetchAPI, submitAPI };