import {templates, select} from '../settings.js';
import { utils } from '../utils.js';

export class Home {
  constructor(data) {
    const thisHome = this;

    thisHome.data = data;

    thisHome.render();
  }

  render() {
    const thisHome = this;

    const generateHTML = templates.homePage(thisHome.data);
    thisHome.element = utils.createDOMFromHTML(generateHTML);
    const homeContainer = document.querySelector(select.containerOf.home);
    homeContainer.appendChild(thisHome.element);
    //console.log('render home');
  }

  
}