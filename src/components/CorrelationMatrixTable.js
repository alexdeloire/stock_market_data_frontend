import React from 'react';

const CorrelationMatrixTable = ({ matrix, companyNames }) => (
  <table border="1" style={{ borderCollapse: 'collapse', margin: '20px' }}>
    <thead>
      <tr>
        <th></th>
        {companyNames.map((name, index) => (
          <th key={index} style={{ padding: '8px', textAlign: 'center' }}>
            {name}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {matrix.map((row, rowIndex) => (
        <tr key={rowIndex}>
          <th style={{ padding: '8px', textAlign: 'center' }}>
            {companyNames[rowIndex]}
          </th>
          {row.map((cell, cellIndex) => (
            <td key={cellIndex} style={{ padding: '8px', textAlign: 'center' }}>
              {cell}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

export default CorrelationMatrixTable;
