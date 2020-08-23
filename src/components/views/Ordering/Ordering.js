import React from 'react';
import {Link} from 'react-router-dom';

import styles from './Ordering.scss';


const Ordering = () => {
  return (
    <div className={styles.component}>
      <h2>Ordering view</h2>
      <Link to={process.env.PUBLIC_URL + '/ordering/new'}>New Order</Link>
      <Link to={process.env.PUBLIC_URL + '/ordering/order/123abc'}>Orders</Link>
    </div>
  );
};

export default Ordering;