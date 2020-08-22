import {templates, select, settings, classNames} from '../settings.js';
import {AmountWidget} from './AmountWidget.js';
import {DatePicker} from './DatePicker.js';
import {HourPicker} from './HourPicker.js';
import { utils } from '../utils.js';

export class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
    thisBooking.tableSelect();
  }

  render(booking) {
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget();

    thisBooking.dom = {};
    thisBooking.dom.wrapper = booking;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.starters = thisBooking.dom.wrapper.querySelector(select.booking.starters);
    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.booking.phone);
    thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.booking.address);
    thisBooking.dom.form = thisBooking.dom.wrapper.querySelector(select.booking.form);
  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', function() {
      thisBooking.updateDOM();
    });

    thisBooking.dom.form.addEventListener('submit', function(event) {
      event.preventDefault();
      thisBooking.sendReservation();
    });
  }

  getData() {
    const thisBooking = this;
    const startEndDates = {}; //obiekt z minDate i maxDate

    startEndDates[settings.db.dateStartParamKey] = //kluczem obiektu są parametry zapisane w settings.db
    utils.dateToStr(thisBooking.datePicker.minDate); //utils.dateToStr służy do uzyskania dat w postaci RR-MM-DD
    startEndDates[settings.db.dateEndParamKey] =
    utils.dateToStr(thisBooking.datePicker.maxDate);

    const endDate = {}; //obiekt zawierający datę końcową

    endDate[settings.db.dateEndParamKey] = //kluczem obiektu są parametry zapisane w settings.db
    startEndDates[settings.db.dateEndParamKey];

    const params = { // w tym obiekcie składamy wszystkie dane w całość
      booking: utils.queryParams(startEndDates),
      eventsCurrent: settings.db.notRepeatParam + '&' + utils.queryParams(startEndDates),
      eventsRepeat: settings.db.repeatParam + '&' + utils.queryParams(endDate),
    };

    //console.log('getData params: ', params);

    const urls = {
      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking,
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent,
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat,
    };
    
    //console.log('getData urls', urls);

    Promise.all([ // wysyłamy trzy zapytania pod przygotowane wcześniej adresy
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function([bookingsResponse, eventsCurrentResponse, eventsRepeatResponse]){
        return Promise.all([ // parsujemy odpowiedzi wszystkich trzech zapytań
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });    
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};
    //console.log('current event: ', eventsCurrent, eventsRepeat, bookings);
    //pętla iterująca po curent event i przepusza ją przez metodę makeBooked
    for(let eventCurrent of eventsCurrent) {
      //console.log(eventCurrent);
      thisBooking.makeBooked(eventCurrent.date, eventCurrent.hour, eventCurrent.duration, eventCurrent.table);
    }  
    
    for(let booking of bookings) {
      //console.log('booking: ', booking);
      thisBooking.makeBooked(booking.date, booking.hour, booking.duration, booking.table);
    }

    //zakresy dat zdefiniowane w datePicker
    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;
    //console.log('dates:', minDate, maxDate);

    //pętla iterująca po elementach eventsRepeat
    for(let eventRepeat of eventsRepeat) {
      //console.log('eventRepeat ', eventRepeat);
      //jeśli element się powtarza daily
      if(eventRepeat.repeat == 'daily') {
        //pętla iterująca po powtarzającym się dniu z zakresu dni (datePicker) 
        for(let repeatDay = minDate; repeatDay <= maxDate; repeatDay = utils.addDays(repeatDay, 1)) {
          //console.log('repeatDay: ', repeatDay);
          thisBooking.makeBooked(utils.dateToStr(repeatDay), eventRepeat.hour, eventRepeat.duration, eventRepeat.table);
        }
      }
    }

    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;
    //zapisanie godziny jako liczby
    const bookedHour = utils.hourToNumber(hour);
    
    //jeśli nie ma thisBooking.booked z kluczem date takim jak w app.json, to jest twórzony
    if(!thisBooking.booked[date]) {
      thisBooking.booked[date] = {};
    }

    //pętla iterująca po każdym półgodzinnym bloku z zabookowanej godziny, za każdym razem zwiększa blok o pół godziny
    for(let blockHour = bookedHour; blockHour < bookedHour + duration; blockHour += 0.5) {
      //console.log('blockHour: ', blockHour);
      //jeżeli nie istnieje taki półgodzinny blok, to jest on tworzony
      if(!thisBooking.booked[date][blockHour]) {
        thisBooking.booked[date][blockHour] = [];
      } 
      //do klucza blockHour w kluczu date w obiekcie thisBooking.booked dodajemy numer zabookowanego stolika 
      thisBooking.booked[date][blockHour].push(table);
    }
    //console.log(thisBooking.booked);
  }

  updateDOM() {
    const thisBooking = this;
    //console.log('dowolny text');

    //aktualne wartości dla daty i godziny
    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    //pętla iterująca po stolikach
    for(let table of thisBooking.dom.tables) {
      //zmienna numeru stolika pobierana przez getAttribute
      let tableNumber = table.getAttribute(settings.booking.tableIdAttribute);      
      tableNumber = parseInt(tableNumber); //zmiana tableNumber na liczbę
      //console.log('table: ', tableNumber);

      if(thisBooking.booked[thisBooking.date] && 
        thisBooking.booked[thisBooking.date][thisBooking.hour] &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableNumber)) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  tableSelect() {
    const thisBooking = this;
    //pętla iterująca po wszystkich stolikach 
    for(let table of thisBooking.dom.tables) {
      //dodać eventlistener na kliknięcie w stolik, zablokować domyślną akcję 
      table.addEventListener('click', function(event) {
        event.preventDefault();
        
        let tableId = table.getAttribute(settings.booking.tableIdAttribute); //zmienna zawiera id stolika
        tableId = parseInt(tableId); //zmiana tableId na liczbę
        //console.log('tableId: ', tableId);
        
        /*if(!table.classList.contains(classNames.booking.tableBooked)) {
          table.classList.add(classNames.booking.tableBooked);
        } 
        thisBooking.tableSelected = tableId;*/        
        
        if(table.classList.contains(classNames.booking.tableBooked)) {
          alert('table is booked!');
        } 
        else if(!table.classList.contains(classNames.booking.tableSelected)) {
          table.classList.add(classNames.booking.tableSelected); 
        } 
        else {
          table.classList.remove(classNames.booking.tableSelected);                        
        }
        thisBooking.tableSelected = tableId;        
      });
    }
  }

  sendReservation() {
    const thisBooking = this;
    
    function uuid() {
      var uuid = '', i, random;
      for (i = 0; i < 32; i++) {
        random = Math.random() * 16 | 0;    
        if (i == 8 || i == 12 || i == 16 || i == 20) {
          uuid += '-';
        }
        uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
      }
      return uuid;
    }
    const uuid1 = uuid();
    
    const url = settings.db.url + '/' + settings.db.booking;

    const payload = {
      date: thisBooking.date,
      hour: utils.numberToHour(thisBooking.hour),
      table: thisBooking.tableSelected,
      people: thisBooking.peopleAmount.value,
      duration: thisBooking.hoursAmount.value,      
      phone: thisBooking.dom.phone.value,
      starters: [],
      uuid: uuid1,
    };

    const starters = [...document.querySelectorAll(select.booking.starters)];

    payload.starters = starters.map(starter => starter.value);

    
    const options = {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
    fetch(url, options)
      .then(function(response) {
        return response.json();        
      }).then(function(parsedResponse) {
        console.log('parsedResponse: ', parsedResponse);
        //uniemożliwienie ponownej rezerwacji tego samego stolika w tym samym terminie
        thisBooking.makeBooked(payload.date, payload.hour, payload.duration, payload.table);
        thisBooking.updateDOM();
        console.log('Twój unikalmy link do rezerwacji to: ' + url + '/' + uuid1);
      });

    //http://localhost:3131/booking
  }
}