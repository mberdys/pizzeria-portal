import {select, classNames, templates} from '../settings.js';
import {utils} from '../utils.js';
import {AmountWidget} from './AmountWidget.js';

export class Product {
  constructor(id, data) {
    const thisProduct = this;
    thisProduct.id = id;
    thisProduct.data = data;
    
    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
    
    //console.log('new Product: ', thisProduct);
  }

  renderInMenu() {
    const thisProduct = this;
    /* generate HTML based on template */
    const generateHTML = templates.menuProduct(thisProduct.data);
    /* create element using utils.createElementFromHTML */
    thisProduct.element = utils.createDOMFromHTML(generateHTML);
    /* find menu container */
    const menuContainer = document.querySelector(select.containerOf.menu);
    /* add element menu */
    menuContainer.appendChild(thisProduct.element);
  }

  getElements() {
    const thisProduct = this;

    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);      
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }

  initAccordion() {
    const thisProduct = this;
    /* find the clickable trigger (the element that should react to clicking) */
    const trigger = thisProduct.accordionTrigger;
    /* START: click event listener to trigger */
    trigger.addEventListener('click', function(event) {
    /* prevent default action for event */
      event.preventDefault();
      /* toggle active class on element of thisProduct */
      thisProduct.element.classList.toggle('active');
      /* find all active products */
      const activeProducts = document.querySelectorAll(select.all.menuProductsActive);
      /* START LOOP: for each active product */
      for(let activeProduct of activeProducts) {
        /* START: if the active product isn't the element of thisProduct */
        if(!(activeProduct == thisProduct.element)) {
          /* remove class active for the active product */
          activeProduct.classList.remove('active');
        }
      }
    });
  }

  initOrderForm() {
    const thisProduct = this;
    
    thisProduct.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });
    
    for(let input of thisProduct.formInputs){
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    }
    
    thisProduct.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }

  processOrder() {
    const thisProduct = this;
          
    /* stała formData zczytuje dane z formularzy za pomocą: using utils.serializeFormToObject */
    const formData = utils.serializeFormToObject(thisProduct.form);
    
    thisProduct.params = {};
    let price = thisProduct.data.price;
    let params = thisProduct.data.params;
          
    for(let paramId in params) {
      const param = params[paramId];
      
      for(let optionId in param.options) {
        const option = param.options[optionId];
                  
        const selectedOption = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;
                
        if(selectedOption && !option.default) {
          price += option.price;
        } else if(!selectedOption && option.default) {
          price -= option.price;
        }
        const images =  thisProduct.imageWrapper.querySelectorAll('.' + (paramId) + '-' + (optionId));
        //console.log('param+option: ', '.' + (paramId) + '-' + (optionId));
        //console.log('images: ', [...images]);
        if(selectedOption) {
          if(!thisProduct.params[paramId]) {
            thisProduct.params[paramId] = {
              label: param.label,
              options: {},
            };
          }
          thisProduct.params[paramId].options[optionId] = option.label;
          for(let image of images) {
            image.classList.add(classNames.menuProduct.imageVisible);
          }
        } else {
          for(let image of images) {
            image.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
      }
    }
    
    thisProduct.priceSingle = price;
    thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;
    thisProduct.priceElem.innerHTML = thisProduct.price;
    //console.log('cena koncowa: ', price);
    //console.log('params: ', thisProduct.params);
  }

  initAmountWidget() {
    const thisProduct = this;
    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    thisProduct.amountWidgetElem.addEventListener('updated', function(){
      thisProduct.processOrder();
    });
  }

  addToCart() {
    const thisProduct = this;
    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value;
    
    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      },
    });
    thisProduct.element.dispatchEvent(event);
  }
}