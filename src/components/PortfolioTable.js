import React from 'react';

const PortfolioTable = ({ data }) => {
  if (data.length === 0) {
    return <p>No stocks in portfolio.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Symbol</th>
          <th>Current Value</th>
          <th>Shares</th>
          <th>Profit/Loss</th>
        </tr>
      </thead>
      <tbody>
        {data.map(item => (
          <tr key={item.key}>
            <td>{item.symbol}</td>
            <td>{item.currentValue}</td>
            <td>{item.shares}</td>
            <td>{item.profitLoss}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PortfolioTable;
