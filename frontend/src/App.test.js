import { render, screen } from '@testing-library/react';
import App from './App';

test('renders IT Hardware Asset Inventory header', () => {
  render(<App />);
  const heading = screen.getByText(/IT Hardware Asset Inventory/i);
  expect(heading).toBeInTheDocument();
});
