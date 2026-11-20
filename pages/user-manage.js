// pages/user-manage.js
if (!window.AppPages) window.AppPages = {};

window.AppPages['user-manage'] = {
  render: function() {
    return `
      <div class="page-container" style="padding: 20px;">
        <h2>사용자 권한 및 계정 관리 (관리자 전용)</h2>
        <p style="color: #666; margin-bottom: 20px;">승인된 회원의 권한을 변경하거나 계정을 강퇴 처리할 수 있습니다.</p>

        <div style="margin-bottom: 15px;">
          <input type="text" id="userSearchInput" placeholder="아이디 또는 이름 검색" style="padding: 8px; width: 250px;">
          <button id="btnRefreshUsers" style="padding: 8px 16px; cursor: pointer;">새로고침</button>
        </div>

        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead>
            <tr style="background-color: #f4f4f4; border-bottom: 2px solid #ddd;">
              <th style="padding: 10px;">아이디</th>
              <th style="padding: 10px;">이름</th>
              <th style="padding: 10px;">상태</th>
              <th style="padding: 10px;">권한</th>
              <th style="padding: 10px;">작업</th>
            </tr>
          </thead>
          <tbody id="userTableBody">
            <tr><td colspan="5" style="text-align: center; padding: 20px;">데이터를 불러오는 중...</td></tr>
          </tbody>
        </table>
      </div>
    `;
  },

  init: async function() {
    const rawUser = sessionStorage.getItem('loginUser');
    const loginUser = rawUser ? JSON.parse(rawUser) : null;

    // 관리자 접근 제한 검증
    if (!loginUser || loginUser.role !== 'ADMIN') {
      alert('관리자만 접근 가능한 페이지입니다.');
      const tbody = document.getElementById('userTableBody');
      if (tbody) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: red; padding: 20px;">접근 권한이 없습니다.</td></tr>`;
      }
      return;
    }

    let usersCache = [];

    const loadUsers = async () => {
      const tbody = document.getElementById('userTableBody');
      try {
        // 승인 및 강퇴 대상 조회
        const snapshot = await window.db.collection('users')
          .where('status', 'in', ['APPROVED', 'BANNED'])
          .get();

        usersCache = [];
        snapshot.forEach(doc => {
          usersCache.push({ id: doc.id, ...doc.data() });
        });

        renderTable(usersCache);
      } catch (err) {
        console.error('사용자 목록 로드 실패:', err);
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: red; padding: 20px;">목록을 불러오는 중 오류가 발생했습니다.</td></tr>`;
      }
    };

    const renderTable = (users) => {
      const tbody = document.getElementById('userTableBody');
      if (!tbody) return;

      if (users.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px;">조회된 회원이 없습니다.</td></tr>`;
        return;
      }

      tbody.innerHTML = users.map(user => {
        const isSelf = user.id === loginUser.userId;
        const currentRole = user.role || 'USER';
        const isBanned = user.status === 'BANNED';

        return `
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px;">${user.userId || user.id}</td>
            <td style="padding: 10px;">${user.name}</td>
            <td style="padding: 10px;">
              <span style="color: ${isBanned ? 'red' : 'green'}; font-weight: bold;">
                ${isBanned ? '강퇴됨' : '정상(승인)'}
              </span>
            </td>
            <td style="padding: 10px;">
              <select class="role-select" data-userid="${user.id}" ${isSelf ? 'disabled' : ''} style="padding: 4px;">
                <option value="USER" ${currentRole === 'USER' ? 'selected' : ''}>일반사용자(USER)</option>
                <option value="ADMIN" ${currentRole === 'ADMIN' ? 'selected' : ''}>관리자(ADMIN)</option>
              </select>
            </td>
            <td style="padding: 10px;">
              ${isSelf 
                ? '<span style="color: #999;">본인 계정</span>' 
                : (isBanned 
                    ? `<button class="btn-unban" data-userid="${user.id}" style="padding: 4px 8px; cursor: pointer;">강퇴 해제</button>`
                    : `<button class="btn-ban" data-userid="${user.id}" style="padding: 4px 8px; background-color: #ff4d4f; color: white; border: none; border-radius: 4px; cursor: pointer;">강퇴</button>`
                  )
              }
            </td>
          </tr>
        `;
      }).join('');

      bindRowEvents();
    };

    const bindRowEvents = () => {
      // 권한 변경 이벤트
      document.querySelectorAll('.role-select').forEach(select => {
        select.addEventListener('change', async (e) => {
          const targetUserId = e.target.getAttribute('data-userid');
          const newRole = e.target.value;

          if (!confirm(`${targetUserId} 회원의 권한을 ${newRole}(으)로 변경하시겠습니까?`)) {
            loadUsers();
            return;
          }

          try {
            await window.db.collection('users').doc(targetUserId).update({ role: newRole });
            alert('권한이 성공적으로 변경되었습니다.');
            loadUsers();
          } catch (err) {
            console.error('권한 변경 실패:', err);
            alert('권한 변경 중 오류가 발생했습니다.');
          }
        });
      });

      // 강퇴 처리 이벤트
      document.querySelectorAll('.btn-ban').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const targetUserId = e.target.getAttribute('data-userid');
          if (!confirm(`정말 ${targetUserId} 회원을 강퇴 처리하시겠습니까? 로그인할 수 없게 됩니다.`)) {
            return;
          }

          try {
            await window.db.collection('users').doc(targetUserId).update({
              status: 'BANNED',
              bannedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            alert('강퇴 처리가 완료되었습니다.');
            loadUsers();
          } catch (err) {
            console.error('강퇴 실패:', err);
            alert('강퇴 처리 중 오류가 발생했습니다.');
          }
        });
      });

      // 강퇴 해제 이벤트
      document.querySelectorAll('.btn-unban').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const targetUserId = e.target.getAttribute('data-userid');
          if (!confirm(`${targetUserId} 회원의 강퇴를 해제하고 정상 상태로 복구하시겠습니까?`)) {
            return;
          }

          try {
            await window.db.collection('users').doc(targetUserId).update({ status: 'APPROVED' });
            alert('정상 상태로 복원되었습니다.');
            loadUsers();
          } catch (err) {
            console.error('강퇴 해제 실패:', err);
            alert('강퇴 해제 중 오류가 발생했습니다.');
          }
        });
      });
    };

    // 검색 필터링
    document.getElementById('userSearchInput').addEventListener('input', (e) => {
      const keyword = e.target.value.trim().toLowerCase();
      const filtered = usersCache.filter(u => 
        (u.userId && u.userId.toLowerCase().includes(keyword)) ||
        (u.name && u.name.toLowerCase().includes(keyword))
      );
      renderTable(filtered);
    });

    document.getElementById('btnRefreshUsers').addEventListener('click', loadUsers);

    await loadUsers();
  }
};
