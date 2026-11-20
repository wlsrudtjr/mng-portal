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
          <tbody id="user-table-body">
            <tr><td colspan="4" style="padding:15px; text-align:center;">데이터를 불러오는 중...</td></tr>
          </tbody>
        </table>
      </div>
    `;
  },
  init: async function () {
    const tbody = document.getElementById('user-table-body');
    try {
      const snapshot = await window.db.collection('users').get();
      if (snapshot.empty) {
        tbody.innerHTML = '<tr><td colspan="4" style="padding:15px; text-align:center;">가입된 사용자가 없습니다.</td></tr>';
        return;
      }

      let html = '';
      snapshot.forEach(doc => {
        const user = doc.data();
        html += `
          <tr style="border-bottom:1px solid #eee;">
            <td style="padding:10px;">${user.userId}</td>
            <td style="padding:10px;">${user.name}</td>
            <td style="padding:10px;">
              <span style="color:${user.status === 'APPROVED' ? '#16a34a' : user.status === 'PENDING' ? '#eab308' : '#dc2626'}; font-weight:bold;">
                ${user.status}
              </span>
            </td>
            <td style="padding:10px;">
              ${user.status === 'PENDING' ? `
                <button class="btn btn-primary btn-sm" onclick="window.AppPages['user-approval'].changeStatus('${user.userId}', 'APPROVED')">승인</button>
                <button class="btn btn-danger btn-sm" onclick="window.AppPages['user-approval'].changeStatus('${user.userId}', 'REJECTED')">반려</button>
              ` : '-'}
            </td>
          </tr>
        `;
      });
      tbody.innerHTML = html;
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="4" style="padding:15px; text-align:center; color:red;">에러: ${err.message}</td></tr>`;
    }
  },
  changeStatus: async function (userId, newStatus) {
    if (!confirm(`${userId} 사용자를 ${newStatus === 'APPROVED' ? '승인' : '반려'} 처리하시겠습니까?`)) return;
    try {
      await window.db.collection('users').doc(userId).update({ status: newStatus });
      alert('처리되었습니다.');
      this.init();
    } catch (err) {
      alert('처리 실패: ' + err.message);
    }
  }
};
