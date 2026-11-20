if (!window.AppPages) window.AppPages = {};

window.AppPages['user-approval'] = {
  render: function () {
    return `
      <h2>사용자 승인 관리</h2>
      <div class="card" style="margin-top:20px;">
        <table style="width:100%; border-collapse:collapse; text-align:left;">
          <thead>
            <tr style="border-bottom:2px solid #ddd;">
              <th style="padding:10px;">아이디</th>
              <th style="padding:10px;">이름</th>
              <th style="padding:10px;">상태</th>
              <th style="padding:10px;">승인 처리</th>
            </tr>
          </thead>
          <tbody id="user-table-body"></tbody>
        </table>
      </div>
    `;
  },
  init: function () {
    const tbody = document.getElementById('user-table-body');
    const users = JSON.parse(localStorage.getItem('app_users') || '[]');

    if (users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="padding:15px; text-align:center;">사용자가 없습니다.</td></tr>';
      return;
    }

    tbody.innerHTML = users.map(user => `
      <tr style="border-bottom:1px solid #eee;">
        <td style="padding:10px;">${user.userId}</td>
        <td style="padding:10px;">${user.name}</td>
        <td style="padding:10px;"><strong>${user.status}</strong></td>
        <td style="padding:10px;">
          ${user.status === 'PENDING' ? `
            <button class="btn btn-primary btn-sm" onclick="window.AppPages['user-approval'].changeStatus('${user.userId}', 'APPROVED')">승인</button>
            <button class="btn btn-danger btn-sm" onclick="window.AppPages['user-approval'].changeStatus('${user.userId}', 'REJECTED')">반려</button>
          ` : '-'}
        </td>
      </tr>
    `).join('');
  },
  changeStatus: function (userId, newStatus) {
    let users = JSON.parse(localStorage.getItem('app_users') || '[]');
    users = users.map(u => u.userId === userId ? { ...u, status: newStatus } : u);
    localStorage.setItem('app_users', JSON.stringify(users));
    this.init();
  }
};
