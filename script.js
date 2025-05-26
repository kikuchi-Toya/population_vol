document.getElementById('form').addEventListener('submit', function(e) {
  e.preventDefault();
  const errorBox = document.getElementById('error');
  errorBox.classList.add('hidden');
  errorBox.textContent = '';

  const gender = document.getElementById('gender').value;
  const ageMin = parseInt(document.getElementById('ageMin').value);
  const ageMax = parseInt(document.getElementById('ageMax').value);
  const sampleSize = parseInt(document.getElementById('sampleSize').value);
  const answerValues = document.getElementById('answers').value
    .split(/[,
]/)
    .map(x => parseInt(x.trim()))
    .filter(x => !isNaN(x));

  if (!ageMin || !ageMax || !sampleSize || answerValues.length === 0) {
    errorBox.textContent = 'すべての項目を入力してください。';
    errorBox.classList.remove('hidden');
    return;
  }

  let totalPop = 0;
  for (let age = ageMin; age <= ageMax; age++) {
    const base = 300000 + (age % 5) * 10000;
    totalPop += gender === 'male' ? base : gender === 'female' ? base - 10000 : base * 2;
  }

  const displayAsMan = document.getElementById('unit').checked;
  const results = answerValues.map(n => {
    const rate = n / sampleSize;
    return {
      sample: n,
      rate,
      estimate: rate * totalPop
    };
  });

  renderResults(results, totalPop, displayAsMan);
  renderChart(results);
  document.getElementById('results').classList.remove('hidden');
});

function renderResults(results, totalPop, asMan) {
  const info = document.getElementById('population-info');
  info.textContent = `対象人口（推定）: ${totalPop.toLocaleString()}人`;

  const table = document.getElementById('results-table');
  table.innerHTML = `
    <table class="w-full text-sm">
      <thead><tr><th>回答数</th><th>回答率</th><th>推定人数</th></tr></thead>
      <tbody>
        ${results.map(r => `
          <tr>
            <td>${r.sample}</td>
            <td>${(r.rate * 100).toFixed(2)}%</td>
            <td>${asMan ? (r.estimate / 10000).toFixed(2) + '万人' : Math.round(r.estimate).toLocaleString() + '人'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  window.currentCSV = [
    ["回答数", "回答率(%)", asMan ? "推定人数(万人)" : "推定人数(人)"],
    ...results.map(r => [
      r.sample,
      (r.rate * 100).toFixed(2),
      asMan ? (r.estimate / 10000).toFixed(2) : Math.round(r.estimate)
    ])
  ];
}

function renderChart(results) {
  const ctx = document.getElementById("population-chart").getContext("2d");
  if (window.chart) window.chart.destroy();
  window.chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: results.map(r => r.sample + '件'),
      datasets: [{
        label: '推定人数',
        data: results.map(r => Math.round(r.estimate)),
        backgroundColor: 'rgba(34,197,94,0.6)',
        borderColor: 'rgba(34,197,94,1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: value => value.toLocaleString() + '人'
          }
        }
      }
    }
  });
}

function downloadCSV() {
  if (!window.currentCSV) return;
  const csv = window.currentCSV.map(row => row.join(',')).join('\n');
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "population_estimate.csv";
  link.click();
}
