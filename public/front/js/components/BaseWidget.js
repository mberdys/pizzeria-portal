export class BaseWidget {
  constructor(wrapperElement, initialValue) {
    const thisWidget = this; 

    thisWidget.dom = {};
    thisWidget.dom.wrapper = wrapperElement;
    thisWidget.correctValue = initialValue;
  }
  get value() {
    const thisWidget = this;

    return thisWidget.correctValue; //metoda get value zwraca wartość właściwości correctValue - w tej właściwości będzie przechowywana wartość widgetu
  }
  set value(assignedValue) { //metoda set value zostanie wywołana kiedy value zostanie przypisana wartość i przekazana jako pierwszy argument assignedValue
    const thisWidget = this;

    const newValue = thisWidget.parseValue(assignedValue); //stała newValue będzie zawierała metodę parsedValue(ta metoda przy próbie zmiany wartości widgetu będzie zmieniać przypisaną wartość) z argumentem assignedValue

    //if sprawdza czy wartość jest inna niż dotychczasowa i isValid do sprawdzenia czy wartość jest poprawna – np. czy jest liczbą.
    if(newValue != thisWidget.correctValue && thisWidget.isValid(newValue)) {
      thisWidget.correctValue = newValue; //jeśli oba warunki są spełnione nowa wartość zostanie zapisana w correctValue
      thisWidget.announce(); //i uruchomi się metoda announce - która wywoła event informujący o zmianie wartości
    }

    thisWidget.renderValue(); //wywołujemy metodę wyświetlającą wartość widgetu
  }
  parseValue(newValue) { //funkcja spróbuje skonwartować przekazany argument na liczbę
    return parseInt(newValue);
  }
  isValid(newValue) { //sprawdzamy czy ustawiona wartość jest poprawna
    return !isNaN(newValue);
  }
  renderValue() {
    const thisWidget = this;
    
    console.log('widget value: ', thisWidget.value);
  }
  announce() {
    const thisWidget = this;

    const event = new CustomEvent('updated', {
      bubbles: true
    });

    thisWidget.dom.wrapper.dispatchEvent(event);
  }
}