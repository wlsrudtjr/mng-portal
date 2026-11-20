// pages/change-password.js
if (!window.AppPages) window.AppPages = {};

window.AppPages['change-password'] = {
  render: function() {
    return `
      <div class="page-container" style="padding: 20px; max-width: 500px;">
        <h2>비밀번호 변경</h2>
        <p style="color: #666; margin-bottom: 20px;">보안을 위해 주기적으로 비밀번호를 변경해주세요.</p>

        <form id="changePasswordForm">
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">현재 비밀번호</label>
            <input type="password" id="currentPassword" required style="width: 100%; padding: 8px; box-sizing: border-box;">
          </div>

          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">새 비밀번호</label>
            <input type="password" id="newPassword" required style="width: 100%; padding: 8px; box-sizing: border-box;">
          </div>

          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">새 비밀번호 확인</label>
            <input type="password" id="confirmPassword" required style="width: 100%; padding: 8px; box-sizing: border-box;">
          </div>

          <button type="submit" id="btnSubmitPassword" style="width: 100%; padding: 10px; background-color: #1890ff; color: white; border: none; border-radius: 4px; font-size: 16px; cursor: pointer;">
            비밀번호 변경
          </button>
        </form>
      </div>
    `;
  },

  init: async function() {
    const rawUser = sessionStorage.getItem('loginUser');
    const loginUser = rawUser ? JSON.parse(rawUser) : null;

    if (!loginUser) {
      alert('로그인이 필요한 기능입니다.');
      return;
    }

    const form = document.getElementById('changePasswordForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const currentPw = document.getElementById('currentPassword').value;
      const newPw = document.getElementById('newPassword').value;
      const confirmPw = document.getElementById('confirmPassword').value;

      if (newPw !== confirmPw) {
        alert('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
        return;
      }

      if (newPw.length < 4) {
        alert('비밀번호는 최소 4자 이상이어야 합니다.');
        return;
      }

      const submitBtn = document.getElementById('btnSubmitPassword');
      submitBtn.disabled = true;
      submitBtn.innerText = '변경 중...';

      try {
        const userDocRef = window.db.collection('users').doc(loginUser.userId);
        const docSnap = await userDocRef.get();

        if (!docSnap.exists) {
          alert('사용자 정보를 찾을 수 없습니다.');
          return;
        }

        const userData = docSnap.data();
        if (userData.password !== currentPw) {
          alert('현재 비밀번호가 일치하지 않습니다.');
          return;
        }

        await userDocRef.update({
          password: newPw,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert('비밀번호가 성공적으로 변경되었습니다. 보안을 위해 다시 로그인해주세요.');
        sessionStorage.removeItem('loginUser');
        window.location.reload();
      } catch (err) {
        console.error('비밀번호 변경 실패:', err);
        alert('비밀번호 변경 처리 중 오류가 발생했습니다.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = '비밀번호 변경';
      }
    });
  }
};
