if (!window.AppPages) window.AppPages = {};

window.AppPages['dashboard'] = {
  render: function () {
    return `
      <h2>대시보드</h2>
      <div style="display:flex; gap:16px; margin: 20px 0;">
        <div class="card" style="flex:1;">
          <h4>전체 가입자</h4>
          <p id="stat-total-users" style="font-size:24px; font-weight:bold; margin-top:8px;">0명</p>
        </div>
        <div class="card" style="flex:1;">
          <h4>승인 대기자</h4>
          <p id="stat-pending-users" style="font-size:24px; font-weight:bold; margin-top:8px; color:#eab308;">0명</p>
        </div>
        <div class="card" style="flex:1;">
          <h4>공지사항 수</h4>
          <p id="stat-notices" style="font-size:24px; font-weight:bold; margin-top:8px; color:#2563eb;">0건</p>
        </div>
      </div>
    `;
  },
  init: function () {
    const users = JSON.parse(localStorage.getItem('app_users') || '[]');
    const notices = JSON.parse(localStorage.getItem('app_notices') || '[]');
    
    document.getElementById('stat-total-users').innerText = users.length + '명';
    document.getElementById('stat-pending-users').innerText = users.filter(u => u.status === 'PENDING').length + '명';
    document.getElementById('stat-notices').innerText = notices.length + '건';
  }
};
