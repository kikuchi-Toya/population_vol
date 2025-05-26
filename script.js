document.getElementById('form').addEventListener('submit', function(e) {
  e.preventDefault();
  const gender = document.getElementById('gender').value;
  const ageMin = parseInt(document.getElementById('ageMin').value);
  const ageMax = parseInt(document.getElementById('ageMax').value);
  const sampleSize = parseInt(document.getElementById('sampleSize').value);
  const answerValues = document.getElementById('answers').value
    .split(/[,\n]/)
    .map(x => parseInt(x.trim()))
    .filter(x => !isNaN(x));

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
      rate: (rate * 100).toFixed(2),
      estimate: displayAsMan
        ? (rate * totalPop / 10000).toFixed(2) + '万人'
        : Math.round(rate * totalPop).toLocaleString() + '人'
    };
  });

  const tableRows = results.map(r => `<tr><td>${r.sample}</td><td>${r.rate}%</td><td>${r.estimate}</td></tr>`).join('');
  document.getElementById('results').innerHTML = `
    <h2>計算結果</h2>
    <p>対象人口（推定）: ${totalPop.toLocaleString()}人</p>
    <table>
      <thead><tr><th>回答数</th><th>回答率</th><th>推定人数</th></tr></thead>
      <tbody>${tableRows}</tbody>
    </table>
    <button onclick="downloadCSV()">CSV出力</button>
  `;

  window.currentCSV = [
    ['回答数', '回答率(%)', displayAsMan ? '推定人数(万人)' : '推定人数(人)'],
    ...results.map(r => [r.sample, r.rate, r.estimate.replace(/[,人]/g, '')])
  ];
});

function downloadCSV() {
  if (!window.currentCSV) return;
  const csv = window.currentCSV.map(row => row.join(',')).join('\n');
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "population_estimate.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
