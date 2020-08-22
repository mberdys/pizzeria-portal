import {Product} from './components/Product.js';
import {Cart} from './components/Cart.js';
import {Booking} from './components/Booking.js';
import {Home} from './components/Home.js';
import {select, settings, classNames} from './settings.js';


const app = {
  initMenu: function() {
    const thisApp = this;
    //console.log('thisApp.data: ', thisApp.data);


    for(let productData in thisApp.data.products) {
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },

  initData: function() {
    const thisApp = this;

    thisApp.data = {};

    const url = settings.db.url + '/' + settings.db.product;

    fetch(url)
      .then(function(rawResponse) {
        return rawResponse.json();
      })
      .then(function(parsedResponse) {
        console.log('parsed response: ', parsedResponse);
        thisApp.data.products = parsedResponse;
        thisApp.initMenu();
      });

    console.log('thisApp.data: ', JSON.stringify(thisApp.data));
  },

  initCart: function() {
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function(event) {
      app.cart.add(event.detail.product);
    });
  },

  initBooking: function() {
    const thisApp = this;

    const booking = document.querySelector(select.containerOf.booking);
    thisApp.booking = new Booking(booking);
  },

  initHome: function() {
    const thisApp = this;

    const home = document.querySelector(select.containerOf.home);
    thisApp.home = new Home(home);
  },

  initCarousel: function() {
    console.log('kontener', document.querySelectorAll('.carousel-container'));
    // eslint-disable-next-line no-undef
    $('.carousel-container').slick({
      dots: true,
      arrows: false,
      autoplay: true,
      autoplaySpeed: 3000,
    });
  },

  initPages: function() {
    const thisApp = this;

    thisApp.pages = Array.from(document.querySelector(select.containerOf.pages).children);
    thisApp.navHome = Array.from(document.querySelectorAll(select.nav.home));
    thisApp.navOrder = Array.from(document.querySelectorAll(select.nav.order));
    thisApp.navBooking = Array.from(document.querySelectorAll(select.nav.booking));
    thisApp.navSubmit = Array.from(document.querySelectorAll(select.nav.submit));
    console.log('submit: ', thisApp.navSubmit);
    //console.log('order: ', thisApp.navOrder);
    //console.log('booking: ', thisApp.navBooking);
    
    let pagesMatchingHash = [];

    if(window.location.hash.length > 2) {
      const idFromHash = window.location.hash.replace('#/', '');

      pagesMatchingHash = thisApp.pages.filter(function(page) {
        return page.id == idFromHash;
      });
    }

    thisApp.activatePage(pagesMatchingHash.length ? pagesMatchingHash[0].id : thisApp.pages[0].id);

    for(let link of thisApp.navHome) {
      link.addEventListener('click', function(event) {
        const clickedElement = this;
        event.preventDefault();

        const id = clickedElement.getAttribute('href').replace('#', '');
        thisApp.activatePage(id);
      });
    }

    for(let link of thisApp.navOrder) {
      link.addEventListener('click', function(event) {
        const clickedElement = this;
        event.preventDefault();

        const id = clickedElement.getAttribute('href').replace('#', '');
        thisApp.activatePage(id);
      });
    }

    for(let link of thisApp.navBooking) {
      link.addEventListener('click', function(event) {
        const clickedElement = this;
        event.preventDefault();

        const id = clickedElement.getAttribute('href').replace('#', '');
        thisApp.activatePage(id);    
      });
    }
  },

  activatePage: function(pageId) {
    const thisApp = this;

    for(let link of thisApp.navHome) {
      link.classList.toggle(classNames.nav.active, link.getAttribute('href') == '#' + pageId);
    }

    for(let link of thisApp.navOrder) {
      link.classList.toggle(classNames.nav.active, link.getAttribute('href') == '#' + pageId);
    }

    for(let link of thisApp.navBooking) {
      link.classList.toggle(classNames.nav.active, link.getAttribute('href') == '#' + pageId);
    }

    for(let page of thisApp.pages) {
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }

    window.location.hash = '#/' + pageId;

  },

  init: function() {
    const thisApp = this;
    //console.log('*** App starting ***');
    //console.log('thisApp:', thisApp);
    //console.log('classNames:', classNames);
    //console.log('settings:', settings);
    //console.log('templates:', templates);

    thisApp.initPages();
    thisApp.initData();
    thisApp.initCart();
    thisApp.initBooking();
    thisApp.initHome();
    thisApp.initCarousel();
  },
};

app.init();

