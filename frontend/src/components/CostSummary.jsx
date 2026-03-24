// Cost avoidance summary card
import React from 'react';
import { formatCurrency } from '../utils/formatters';

const cardStyle = {
  background: '#e8f5e9',
  border: '1px solid #a5d6a7',
  borderRadius: '8px',
  padding: '1rem 1.5rem',
  maxWidth: '360px',
};

/**
 * @param {{totalOemCost: number, totalCostAvoidance: number, savingsPct: string}} props
 */
function CostSummary({ totalOemCost, totalCostAvoidance, savingsPct }) {
  return (
    <div style={cardStyle}>
      <h3 style={{ margin: '0 0 0.75rem', color: '#2e7d32' }}>Cost Avoidance Summary</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            <td style={{ padding: '4px 0', color: '#555' }}>Total OEM (Tier 1) Cost:</td>
            <td style={{ padding: '4px 0', fontWeight: 600 }}>{formatCurrency(totalOemCost)}</td>
          </tr>
          <tr>
            <td style={{ padding: '4px 0', color: '#555' }}>Total Cost Avoidance:</td>
            <td style={{ padding: '4px 0', fontWeight: 600, color: '#388e3c' }}>
              {formatCurrency(totalCostAvoidance)}
            </td>
          </tr>
          <tr>
            <td style={{ padding: '4px 0', color: '#555' }}>Savings %:</td>
            <td style={{ padding: '4px 0', fontWeight: 600 }}>{savingsPct}%</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default CostSummary;
