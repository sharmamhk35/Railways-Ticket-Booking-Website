const dummyTrains = [
  { id: 1, name: 'Rajdhani Express', trainNumber: '12001', departureTime: '08:00', arrivalTime: '16:30', availability: 45, basePrice: 1200 },
  { id: 2, name: 'Shatabdi Express', trainNumber: '12002', departureTime: '06:00', arrivalTime: '14:15', availability: 60, basePrice: 1000 },
  { id: 3, name: 'Local Express', trainNumber: '12003', departureTime: '10:30', arrivalTime: '18:45', availability: 35, basePrice: 800 },
  { id: 4, name: 'Premium Express', trainNumber: '12004', departureTime: '14:00', arrivalTime: '22:00', availability: 25, basePrice: 1500 },
  { id: 5, name: 'Night Express', trainNumber: '12005', departureTime: '22:00', arrivalTime: '06:30', availability: 50, basePrice: 900 }
];

let bookingData = {
  source: '',
  destination: '',
  journeyDate: '',
  travelClass: '',
  quota: '',
  passengers: 1,
  selectedTrain: null,
  passengerDetails: [],
  fare: {},
  pnr: ''
};

$(document).ready(() => {
  $('#journeyDate').attr('min', new Date().toISOString().split('T')[0]);

  $('#bookingForm').on('submit', handleSearch);
  $('#increasePassenger').on('click', () => updatePassenger(1));
  $('#decreasePassenger').on('click', () => updatePassenger(-1));
  $(document).on('change', 'input[name="trainSelect"]', selectTrain);
  $('#proceedButton').on('click', showSummary);
  $('#confirmBookingBtn').on('click', confirmBooking);
  $('#cancelBooking').on('click', cancelBooking);
  $('#checkPnrBtn').on('click', checkPnrStatus);
});

/* ================= SEARCH ================= */

function handleSearch(e) {
  e.preventDefault();

  bookingData.source = $('#source').val();
  bookingData.destination = $('#destination').val();
  bookingData.journeyDate = $('#journeyDate').val();
  bookingData.travelClass = $('#classSelect').val();
  bookingData.quota = $('#quotaSelect').val();
  bookingData.passengers = +$('#passengerCount').val();

  displayTrains();
}

function displayTrains() {
  $('#trainsList').empty();

  dummyTrains.forEach(train => {
    $('#trainsList').append(`
      <div class="train-card">
        <input type="radio" name="trainSelect" value="${train.id}">
        <strong>${train.name}</strong> (${train.trainNumber})<br>
        ${train.departureTime} - ${train.arrivalTime}
      </div>
    `);
  });

  $('#trainsSection').slideDown();
}

/* ================= TRAIN SELECTION ================= */

function selectTrain() {
  const trainId = $(this).val();
  bookingData.selectedTrain = dummyTrains.find(t => t.id == trainId);

  showSeatAvailability();
  calculateFare();
  generatePassengerInputs();
}

function showSeatAvailability() {
  $('#seatCount').text(bookingData.selectedTrain.availability);
  $('#seatSection').fadeIn();
}

/* ================= PASSENGERS ================= */

function updatePassenger(change) {
  let count = +$('#passengerCount').val();
  if (count + change >= 1 && count + change <= 6) {
    $('#passengerCount').val(count + change);
  }
}

function generatePassengerInputs() {
  $('#passengerList').empty();

  for (let i = 1; i <= bookingData.passengers; i++) {
    $('#passengerList').append(`
      <div class="passenger-row">
        <input placeholder="Passenger ${i} Name" class="p-name">
        <select class="p-age">
          <option value="">Age Group</option>
          <option>Adult</option>
          <option>Child</option>
          <option>Senior</option>
        </select>
      </div>
    `);
  }

  $('#passengerSection').slideDown();
}

/* ================= FARE ================= */

function calculateFare() {
  const classPrice = +$('#classSelect option:selected').data('price');
  const quotaCharge = +$('#quotaSelect option:selected').data('surcharge') || 0;

  const baseFare = (classPrice + quotaCharge) * bookingData.passengers;
  const gst = baseFare * 0.05;
  const total = baseFare + gst;

  bookingData.fare = { baseFare, quotaCharge, gst, total };

  $('#fareBreakup').html(`
    <p>Base Fare: ₹${baseFare.toFixed(2)}</p>
    <p>Quota Charges: ₹${quotaCharge.toFixed(2)}</p>
    <p>GST (5%): ₹${gst.toFixed(2)}</p>
    <h4>Total Fare: ₹${total.toFixed(2)}</h4>
  `);

  $('#fareSection').fadeIn();
}

/* ================= SUMMARY ================= */

function showSummary() {
  bookingData.passengerDetails = [];

  $('.passenger-row').each(function () {
    const name = $(this).find('.p-name').val();
    const age = $(this).find('.p-age').val();
    if (name && age) bookingData.passengerDetails.push({ name, age });
  });

  $('#summaryTotal').text(`₹${bookingData.fare.total.toFixed(2)}`);
  $('#summarySection').slideDown();
}

/* ================= BOOKING ================= */

function confirmBooking() {
  if (!confirm('Are you sure you want to confirm booking?')) return;

  bookingData.pnr = generatePNR();
  localStorage.setItem('lastBooking', JSON.stringify(bookingData));

  $('#successSection').html(`
    <h2>🎉 Booking Successful!</h2>
    <p>Your PNR Number:</p>
    <h3>${bookingData.pnr}</h3>
  `).fadeIn();

  $('#thankYouSection').fadeIn();
}

function generatePNR() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

/* ================= CANCEL ================= */

function cancelBooking() {
  if (confirm('Do you want to cancel this booking?')) {
    location.reload();
  }
}

/* ================= PNR STATUS ================= */

function checkPnrStatus() {
  const pnr = $('#pnrInput').val();
  const lastBooking = JSON.parse(localStorage.getItem('lastBooking'));

  if (lastBooking && lastBooking.pnr === pnr) {
    $('#pnrResult').text('✅ Booking Confirmed');
  } else {
    $('#pnrResult').text('❌ PNR Not Found');
  }
}

console.log('🚆 Railway Booking System – Fully Loaded');
