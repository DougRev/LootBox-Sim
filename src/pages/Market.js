import React from 'react';
import Vendor from '../components/Vendor';
import '../styles/Market.css';

const Market = () => {
  return (
    <div className="market-container">
      <h1 className='market-title'>Market</h1>
      <Vendor />
    </div>
  );
};

export default Market;
