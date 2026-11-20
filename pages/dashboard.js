if (!window.AppPages) window.AppPages = {};

window.AppPages['dashboard'] = {
  render: function () {
    return `
      <h2>대시보드</h2>
      <div style="display:flex; gap:16px; margin: 20px 0;">
        <div class="card" style="flex:1;">
          <h4>전체 가입자</h4>
          <p id="stat-total-users" style="font-size:24px; font-weight:bold; margin-top:8px;">조회중...</p>
        </div>
        <div class="card" style="flex:1;">
          <h4>승인 대기자</h4>
          <p id="stat-pending-users" style="font-size:24px; font-weight:bold; margin-top:8px; color:#eab308;">조회중...</p>
        </div>
        <div class="card" style="flex:1;">
          <h4>공지사항 수</h4>
          <p id="stat-notices" style="font-size:24px; font-weight:bold; margin-top:8px; color:#2563eb;">조회중...</p>
        </div>
      </div>
    `;
  },
  init: async function () {
    try {
      // 1. 유저 통계 조회
      const userSnapshot = await window.db.collection('users').get();
      let totalUsers = 0;
      let pendingUsers = 0;

      userSnapshot.forEach(doc => {
        totalUsers++;
        if (doc.data().status === 'PENDING') pendingUsers++;
      });

      document.getElementById('stat-total-users').innerText = totalUsers + '명';
      document.getElementById('stat-pending-users').innerText = pendingUsers + '명';

      // 2. 공지사항 통계 조회
      const noticeSnapshot = await window.db.collection('notices').get();
      document.getElementById('stat-notices').innerText = noticeSnapshot.size + '건';
    } catch (err) {
      console.error("대시보드 조회 실패:", err);
    }
  }
};
