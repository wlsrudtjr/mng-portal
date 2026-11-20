if (!window.AppPages) window.AppPages = {};

window.AppPages['notice-manage'] = {
  render: function () {
    return `
      <div class="page-container">
        <div class="page-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
          <h2>공지사항 관리</h2>
          <button id="btn-open-modal" class="btn btn-primary">+ 신규 공지 등록</button>
        </div>

        <div class="card">
          <table class="data-table" style="width:100%; border-collapse:collapse;">
            <thead>
              <tr style="border-bottom:2px solid #ddd; text-align:left;">
                <th style="padding:10px;">번호</th>
                <th style="padding:10px;">제목</th>
                <th style="padding:10px;">작성자</th>
                <th style="padding:10px;">등록일</th>
                <th style="padding:10px;">관리</th>
              </tr>
            </thead>
            <tbody id="notice-list-body">
              <tr><td colspan="5" style="text-align:center; padding:20px;">불러오는 중...</td></tr>
            </tbody>
          </table>
        </div>

        <!-- 등록 모달 -->
        <div id="notice-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); justify-content:center; align-items:center;">
          <div style="background:#fff; padding:24px; border-radius:8px; width:450px;">
            <h3>공지사항 등록</h3>
            <div style="margin:12px 0;">
              <label style="display:block; margin-bottom:4px;">제목</label>
              <input type="text" id="notice-title" style="width:100%; padding:8px; box-sizing:border-box;" placeholder="제목을 입력하세요">
            </div>
            <div style="margin:12px 0;">
              <label style="display:block; margin-bottom:4px;">내용</label>
              <textarea id="notice-content" style="width:100%; height:100px; padding:8px; box-sizing:border-box;" placeholder="내용을 입력하세요"></textarea>
            </div>
            <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:16px;">
              <button id="btn-modal-close" class="btn">취소</button>
              <button id="btn-save-notice" class="btn btn-primary">저장</button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  init: function () {
    const listBody = document.getElementById('notice-list-body');
    const modal = document.getElementById('notice-modal');
    const openBtn = document.getElementById('btn-open-modal');
    const closeBtn = document.getElementById('btn-modal-close');
    const saveBtn = document.getElementById('btn-save-notice');
    const titleInput = document.getElementById('notice-title');
    const contentInput = document.getElementById('notice-content');

    // Firestore 공지 로드 함수
    const loadNotices = async () => {
      try {
        const snapshot = await window.db.collection('notices').orderBy('createdAt', 'desc').get();
        if (snapshot.empty) {
          listBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px; color:#888;">등록된 공지사항이 없습니다.</td></tr>`;
          return;
        }

        let index = snapshot.size;
        let html = '';
        snapshot.forEach(doc => {
          const notice = doc.data();
          html += `
            <tr style="border-bottom:1px solid #eee;">
              <td style="padding:10px;">${index--}</td>
              <td style="padding:10px; font-weight:bold;">${notice.title}</td>
              <td style="padding:10px;">${notice.author}</td>
              <td style="padding:10px;">${notice.date}</td>
              <td style="padding:10px;">
                <button class="btn btn-danger btn-sm" onclick="window.AppPages['notice-manage'].deleteNotice('${doc.id}')">삭제</button>
              </td>
            </tr>
          `;
        });
        listBody.innerHTML = html;
      } catch (err) {
        listBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px; color:red;">에러: ${err.message}</td></tr>`;
      }
    };

    openBtn.addEventListener('click', () => { modal.style.display = 'flex'; });
    closeBtn.addEventListener('click', () => { modal.style.display = 'none'; });

    saveBtn.addEventListener('click', async () => {
      const title = titleInput.value.trim();
      const content = contentInput.value.trim();
      if (!title || !content) return alert('제목과 내용을 모두 입력해주세요.');

      const currentUser = JSON.parse(sessionStorage.getItem('loginUser') || '{"userId":"관리자"}');

      try {
        await window.db.collection('notices').add({
          title: title,
          content: content,
          author: currentUser.userId,
          date: new Date().toISOString().split('T')[0],
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        titleInput.value = '';
        contentInput.value = '';
        modal.style.display = 'none';
        loadNotices();
      } catch (err) {
        alert('공지 저장 실패: ' + err.message);
      }
    });

    loadNotices();
  },

  deleteNotice: async function (docId) {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await window.db.collection('notices').doc(docId).delete();
      alert('삭제되었습니다.');
      this.init();
    } catch (err) {
      alert('삭제 실패: ' + err.message);
    }
  }
};
