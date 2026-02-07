const dummyTrains = [
    { id: 1, name: 'Rajdhani Express', trainNumber: '12001', departureTime: '08:00', arrivalTime: '16:30', distance: '540 km', duration: '8h 30m', availability: 45, basePrice: 1200 },
    { id: 2, name: 'Shatabdi Express', trainNumber: '12002', departureTime: '06:00', arrivalTime: '14:15', distance: '540 km', duration: '8h 15m', availability: 60, basePrice: 1000 },
    { id: 3, name: 'Local Express', trainNumber: '12003', departureTime: '10:30', arrivalTime: '18:45', distance: '540 km', duration: '8h 15m', availability: 35, basePrice: 800 },
    { id: 4, name: 'Premium Express', trainNumber: '12004', departureTime: '14:00', arrivalTime: '22:00', distance: '540 km', duration: '8h 00m', availability: 25, basePrice: 1500 },
    { id: 5, name: 'Night Express', trainNumber: '12005', departureTime: '22:00', arrivalTime: '06:30', distance: '540 km', duration: '8h 30m', availability: 50, basePrice: 900 }
];

let bookingData = {
    source: '',
    destination: '',
    journeyDate: '',
    class: '',
    quota: '',
    passengers: 1,
    selectedTrain: null,
    passengerDetails: [],
    totalFare: 0,
    pnrNumber: ''
};

$(document).ready(function () {
    const today = new Date().toISOString().split('T')[0];
    $('#journeyDate').attr('min', today);
    initializeEventListeners();
    initializeTooltips();
});

function initializeEventListeners() {
    $('#bookingForm').on('submit', handleFormSubmit);
    $('#resetButton').on('click', e => { e.preventDefault(); resetForm(); });
    $('#increasePassenger').on('click', increasePassengers);
    $('#decreasePassenger').on('click', decreasePassengers);
    $('#downloadTicket').on('click', downloadTicket);
    $('#cancelBooking').on('click', cancelBooking);
    $('#bookAgain').on('click', bookAgain);
    $('#checkPnrBtn').on('click', checkPnrStatus);
    $(document).on('change', 'input[name="trainSelect"]', selectTrain);
    $(document).on('click', '#summarySection .summary-card h3', () => $('#summarySection .summary-details').slideToggle(300));
    $('#confirmBookingBtn').on('click', confirmAndBook);
    $(document).on('click', '#proceedButton', proceedToPayment);
}

function validateForm() {
    let isValid = true;
    clearErrorMessages();

    const source = $('#source').val().trim();
    const destination = $('#destination').val().trim();
    const journeyDate = $('#journeyDate').val();
    const passengers = parseInt($('#passengerCount').val());

    if (!source) { showError('#sourceError', 'Source station is required'); isValid = false; }
    if (!destination) { showError('#destinationError', 'Destination station is required'); isValid = false; }
    if (source && destination && source.toLowerCase() === destination.toLowerCase()) {
        showError('#destinationError', 'Source and destination cannot be the same');
        isValid = false;
    }

    if (!journeyDate) {
        showError('#dateError', 'Journey date is required');
        isValid = false;
    } else {
        const selectedDate = new Date(journeyDate);
        const today = new Date(); today.setHours(0, 0, 0, 0);
        if (selectedDate < today) { showError('#dateError', 'Cannot book ticket for past dates'); isValid = false; }
    }

    if (passengers < 1 || passengers > 6) { showError('#passengerError', 'Passenger count must be between 1 and 6'); isValid = false; }
    if (!$('#classSelect').val()) { showError('#classSelect', 'Please select a class'); isValid = false; }
    if (!$('#quotaSelect').val()) { showError('#quotaSelect', 'Please select a quota'); isValid = false; }

    return isValid;
}

function showError(selector, message) {
    $(selector).text(message).addClass('show').fadeIn(300);
}

function clearErrorMessages() {
    $('.error-message').text('').removeClass('show');
}

function handleFormSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return showAlert('Please fix the errors above', 'error');

    bookingData = {
        ...bookingData,
        source: $('#source').val().trim(),
        destination: $('#destination').val().trim(),
        journeyDate: $('#journeyDate').val(),
        class: $('#classSelect').val(),
        quota: $('#quotaSelect').val(),
        passengers: parseInt($('#passengerCount').val())
    };

    displayAvailableTrains();
    showAlert('Trains found! Please select one to proceed.', 'success');
}

function displayAvailableTrains() {
    const list = $('#trainsList').empty();
    dummyTrains.forEach(t => {
        list.append(`
            <div class="train-card" data-train-id="${t.id}">
                <input type="radio" name="trainSelect" value="${t.id}">
                <strong>${t.name}</strong> (#${t.trainNumber}) — ${t.departureTime} to ${t.arrivalTime}
            </div>
        `);
    });
    $('#trainsSection').slideDown(500);
}

function selectTrain(e) {
    const id = $(e.target).val();
    bookingData.selectedTrain = dummyTrains.find(t => t.id == id);
    calculateFare();
    displaySeatAvailability();
    displayPassengerInputs();
}

function calculateFare() {
    if (!bookingData.selectedTrain) return;
    const base = +$('#classSelect option:selected').data('price');
    const surcharge = +$('#quotaSelect option:selected').data('surcharge') || 0;
    const subtotal = (base + surcharge) * bookingData.passengers;
    const gst = subtotal * 0.05;
    bookingData.totalFare = subtotal + gst;
    $('#totalFare').text('₹' + bookingData.totalFare.toFixed(2));
}

function displaySeatAvailability() {
    $('#seatCount').text(bookingData.selectedTrain.availability);
    $('#seatSection').slideDown(500);
}

function displayPassengerInputs() {
    const list = $('#passengerList').empty();
    for (let i = 1; i <= bookingData.passengers; i++) {
        list.append(`
            <div>
                <input class="passenger-name" placeholder="Name">
                <select class="passenger-age">
                    <option value="">Age Group</option>
                    <option>Adult</option>
                    <option>Child</option>
                    <option>Senior</option>
                </select>
            </div>
        `);
    }
    $('#passengerSection').slideDown(500);
}

function proceedToPayment() {
    const passengers = [];
    $('.passenger-name').each((i, el) => {
        const name = $(el).val();
        const age = $(el).next().val();
        if (!name || !age) return;
        passengers.push({ name, ageGroup: age });
    });
    bookingData.passengerDetails = passengers;
    displayBookingSummary();
}

function displayBookingSummary() {
    $('#summaryTotal').text('₹' + bookingData.totalFare.toFixed(2));
    $('#summarySection').slideDown(500);
}

function confirmAndBook() {
    bookingData.pnrNumber = Math.random().toString(36).substring(2, 12).toUpperCase();
    displayBookingSuccess();
}

function displayBookingSuccess() {
    $('#successSection').html(`<h2>PNR: ${bookingData.pnrNumber}</h2>`).fadeIn(500);
    saveLastBooking();
}

function downloadTicket() {
    showAlert('Ticket downloaded successfully!', 'success');
}

function cancelBooking() {
    if (confirm('Cancel booking?')) resetBooking();
}

function bookAgain() {
    resetBooking();
}

function resetBooking() {
    $('#bookingForm')[0].reset();
    bookingData.passengers = 1;
}

function saveLastBooking() {
    localStorage.setItem('lastBooking', JSON.stringify(bookingData));
}

function increasePassengers() {
    let c = +$('#passengerCount').val();
    if (c < 6) $('#passengerCount').val(++c);
}

function decreasePassengers() {
    let c = +$('#passengerCount').val();
    if (c > 1) $('#passengerCount').val(--c);
}

function checkPnrStatus() {
    const pnr = $('#pnrInput').val();
    const last = JSON.parse(localStorage.getItem('lastBooking'));
    $('#pnrResult').text(last && last.pnrNumber === pnr ? 'Confirmed' : 'Not Found');
}

function initializeTooltips() {
    $('[data-bs-toggle="tooltip"]').each(function () {
        new bootstrap.Tooltip(this);
    });
}

function showAlert(message, type) {
    alert(message);
}

console.log('🚆 Railway Ticket Booking System Loaded!');