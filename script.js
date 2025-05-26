document.getElementById('form').addEventListener('submit', function(e) {
  e.preventDefault();
  const gender = document.getElementById('gender').value;
  const ageMin = parseInt(document.getElementById('ageMin').value);
  const ageMax = parseInt(document.getElementById('ageMax').value);
  const sampleSize = parseInt(document.getElementById('sampleSize').value);
  const answerValues = document.getElementById('answers').value.split(',').map(x => parseInt(x.trim())).filter(x => !isNaN(x));

  // 年齢補正付き人口ボリューム計算（仮定人口）
  let totalPop = 0;
  for (let age = ageMin; age <= ageMax; age++) {
    const base = 300000 + (age % 5) * 10000;
    totalPop += gender === 'male' ? base : gender === 'female' ? base - 10000 : base * 2;
  }

  const results = answerValues.map(n => {
    const rate = n / sampleSize;
    return {
      sample: n,
      rate: (rate * 100).toFixed(2) + '%',
      estimate: Math.round(rate * totalPop).toLocaleString() + '人'
    };
  });

  const html = `
    <h2>計算結果</h2>
    <p>対象人口（推定）: ${totalPop.toLocaleString()}人</p>
    <table>
      <thead><tr><th>回答数</th><th>回答率</th><th>推定人数</th></tr></thead>
      <tbody>
        ${results.map(r => `<tr><td>${r.sample}</td><td>${r.rate}</td><td>${r.estimate}</td></tr>`).join('')}
      </tbody>
    </table>
  `;
  document.getElementById('results').innerHTML = html;
});
