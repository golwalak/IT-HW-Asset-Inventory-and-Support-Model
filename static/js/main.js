/**
 * VibeAThon POC – IT Hardware Asset Inventory & Support Model
 * Shared Chart.js helper functions for dashboard and analysis views.
 */

const CHART_COLORS = [
  '#4361ee', '#f72585', '#4cc9f0', '#7209b7', '#3f37c9',
  '#4895ef', '#560bad', '#480ca8', '#b5179e', '#f3722c',
];

/**
 * Build a doughnut chart.
 * @param {string} canvasId - The canvas element id.
 * @param {Object} dataObj  - { label: value } mapping.
 * @param {string[]} colors - Array of colour strings.
 */
function buildDoughnutChart(canvasId, dataObj, colors) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const labels = Object.keys(dataObj);
  const values = Object.values(dataObj);
  new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors || CHART_COLORS.slice(0, labels.length),
        borderWidth: 2,
        borderColor: '#fff',
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { font: { size: 11 }, boxWidth: 12 },
        },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.label}: ${ctx.parsed}`,
          },
        },
      },
    },
  });
}

/**
 * Build a vertical bar chart.
 * @param {string} canvasId - The canvas element id.
 * @param {Object} dataObj  - { label: value } mapping.
 * @param {string} color    - Bar colour.
 * @param {string} yLabel   - Y-axis label.
 */
function buildBarChart(canvasId, dataObj, color, yLabel) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const labels = Object.keys(dataObj);
  const values = Object.values(dataObj);
  new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: yLabel || 'Value',
        data: values,
        backgroundColor: color || '#4361ee',
        borderRadius: 4,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => {
              const val = ctx.parsed.y;
              // Format large numbers as currency if yLabel suggests it
              if (yLabel && yLabel.includes('$')) {
                return ` $${val.toLocaleString()}`;
              }
              return ` ${val}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            font: { size: 11 },
            callback: val => yLabel && yLabel.includes('$') ? `$${val.toLocaleString()}` : val,
          },
          grid: { color: 'rgba(0,0,0,0.05)' },
        },
        x: {
          ticks: { font: { size: 10 } },
          grid: { display: false },
        },
      },
    },
  });
}
