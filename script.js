function getDeviceId() {
    let id = localStorage.getItem('deviceId');
    if (!id) {
      id = 'dev_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('deviceId', id);
    }
    return id;
  }
  
  const deviceId = getDeviceId();
  let currency = localStorage.getItem('currency') || 'USD';
  document.getElementById('currency').value = currency;
  document.getElementById('currency').addEventListener('change', e => {
    currency = e.target.value;
    localStorage.setItem('currency', currency);
    render();
  });
  
  const exchangeRates = {
    USD: 1,
    EUR: 0.9,
    RUB: 90
  };
  
  let data = JSON.parse(localStorage.getItem('financeData_' + deviceId)) || {
    income: [],
    expense: []
  };
  
  function saveData() {
    localStorage.setItem('financeData_' + deviceId, JSON.stringify(data));
  }
  
  function addEntry(type) {
    const title = prompt('Описание:');
    const amount = parseFloat(prompt('Сумма:'));
  
    if (!title || isNaN(amount)) return;
  
    data[type].push({
      title,
      amount,
      date: new Date().toISOString().split('T')[0]
    });
    saveData();
    render();
  }
  function render() {
    ['income', 'expense'].forEach(type => {
      const list = document.getElementById(type + '-list');
      list.innerHTML = '';
      data[type].forEach(entry => {
        const li = document.createElement('li');
        li.textContent = `${entry.title} — ${convert(entry.amount)} ${currency}`;
        list.appendChild(li);
      });
    });
    renderChart();
  }
  function convert(amount) {
    return (amount * exchangeRates[currency]).toFixed(2);
  }
  function renderChart() {
    const dates = [...new Set([...data.income, ...data.expense].map(e => e.date))].sort();
  
    const incomeData = dates.map(date =>
      data.income.filter(e => e.date === date).reduce((sum, e) => sum + e.amount, 0) * exchangeRates[currency]
    );
  
    const expenseData = dates.map(date =>
      data.expense.filter(e => e.date === date).reduce((sum, e) => sum + e.amount, 0) * exchangeRates[currency]
    );
  
    if (window.financeChart) window.financeChart.destroy();
  
    const ctx = document.getElementById('finance-chart').getContext('2d');
    window.financeChart = new Chart(ctx, {
      type: 'line',
      data: {
     labels: dates,
        datasets: [
          {
            label: 'Доходы',
            data: incomeData,
            borderColor: 'green',
            fill: false
          },
          {
            label: 'Расходы',
            data: expenseData,
            borderColor: 'red',
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
        legend: {
        position: 'bottom'
          }
        }
      }
    });
  }
  render();
  