import React from 'react';
import {Link} from 'react-router-dom';

import styles from './Tables.scss';


const Tables = () => {
  return (
    <div className={styles.component}>
      <h2>Tables view</h2>
      <Link to={process.env.PUBLIC_URL + '/tables/booking/:id'}>Reservation</Link>
      <Link to={process.env.PUBLIC_URL + '/tables/event/:id'}>Event</Link>
    </div>
  );
};

export default Tables;