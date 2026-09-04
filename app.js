/**
 * Job Application Tracker - Frontend Controller (Phase 3: MySQL & REST API)
 *
 * Node.js + Express 백엔드 API(/api/applications)와 fetch로 통신하여
 * MySQL 데이터베이스와 연동합니다.
 */

// 1. 상태 변수
let applications = [];
let editingId = null;
let currentSearch = "";
let currentStatusFilter = "전체";

const API_BASE_URL = "/api/applications";

// 2. DOM 요소 캐시
const elements = {
  form: document.getElementById("application-form"),
  formTitle: document.getElementById("form-title"),
  editIdInput: document.getElementById("edit-id"),
  companyInput: document.getElementById("company-name"),
  jobTitleInput: document.getElementById("job-title"),
  jobUrlInput: document.getElementById("job-url"),
  applyDateInput: document.getElementById("apply-date"),
  statusSelect: document.getElementById("status"),
  notesTextarea: document.getElementById("notes"),
  saveBtn: document.getElementById("save-btn"),
  cancelBtn: document.getElementById("cancel-btn"),
  searchInput: document.getElementById("search-input"),
  statusFilter: document.getElementById("status-filter"),
  applicationList: document.getElementById("application-list"),
  totalCount: document.getElementById("total-count"),
  emptyState: document.getElementById("empty-state"),
  emptyTitle: document.getElementById("empty-title"),
  emptyDesc: document.getElementById("empty-desc")
};

// 3. 유틸리티 함수
function getTodayDateString() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// 4. API 연동 함수
async function loadApplications() {
  try {
    const res = await fetch(API_BASE_URL);
    if (!res.ok) {
      throw new Error(`서버 응답 오류 (상태코드: ${res.status})`);
    }

    const data = await res.json();

    // MySQL 컬럼명 규격을 프론트엔드 상태 규격에 매핑
    applications = data.map((item) => ({
      id: item.id,
      company: item.company,
      jobTitle: item.position,
      jobUrl: item.job_url,
      applyDate: typeof item.applied_date === "string" ? item.applied_date.substring(0, 10) : item.applied_date,
      status: item.status,
      notes: item.memo
    }));

    renderApplications();
  } catch (error) {
    console.error("데이터 조회 실패:", error);
    elements.emptyState.style.display = "block";
    elements.emptyTitle.textContent = "데이터를 불러오지 못했습니다.";
    elements.emptyDesc.textContent = "MySQL 서버 실행 및 .env 설정(DB 비밀번호 등)을 확인해주세요.";
  }
}

// 5. 필터링 및 렌더링 로직
function getFilteredApplications() {
  const query = currentSearch.toLowerCase().trim();

  return applications.filter((item) => {
    // 진행상태 일치 여부
    const matchesStatus =
      currentStatusFilter === "전체" || item.status === currentStatusFilter;

    // 검색어 포함 여부 (회사명 또는 직무)
    const matchesSearch =
      !query ||
      (item.company && item.company.toLowerCase().includes(query)) ||
      (item.jobTitle && item.jobTitle.toLowerCase().includes(query));

    return matchesStatus && matchesSearch;
  });
}

function renderApplications() {
  const filteredList = getFilteredApplications();
  const count = filteredList.length;
  elements.totalCount.textContent = `${count}건`;

  if (count === 0) {
    elements.applicationList.innerHTML = "";
    elements.emptyState.style.display = "block";

    if (applications.length === 0) {
      elements.emptyTitle.textContent = "등록된 지원 내역이 없습니다.";
      elements.emptyDesc.textContent = "상단 폼을 작성해 새로운 지원 정보를 추가해보세요.";
    } else {
      elements.emptyTitle.textContent = "일치하는 지원 내역이 없습니다.";
      elements.emptyDesc.textContent = "검색어 또는 진행상태 필터 조건을 확인해보세요.";
    }
    return;
  }

  elements.emptyState.style.display = "none";

  const rowsHtml = filteredList.map((item) => {
    const safeCompany = escapeHtml(item.company);
    const safeJobTitle = escapeHtml(item.jobTitle);
    const safeNotes = escapeHtml(item.notes || "-");
    const safeUrl = item.jobUrl ? escapeHtml(item.jobUrl) : "";

    const companyCell = safeUrl
      ? `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="cell-company-link" title="공고 바로가기">
          ${safeCompany}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
         </a>`
      : safeCompany;

    const statusBadgeClass = `status-badge-${item.status}`;

    return `
      <tr data-id="${item.id}">
        <td><strong>${companyCell}</strong></td>
        <td>${safeJobTitle}</td>
        <td>${item.applyDate}</td>
        <td class="text-center">
          <span class="badge ${statusBadgeClass}">${item.status}</span>
        </td>
        <td class="cell-notes">${safeNotes}</td>
        <td class="text-center">
          <button type="button" class="btn btn-sm btn-action-edit" data-action="edit" data-id="${item.id}">수정</button>
        </td>
        <td class="text-center">
          <button type="button" class="btn btn-sm btn-action-delete" data-action="delete" data-id="${item.id}">삭제</button>
        </td>
      </tr>
    `;
  }).join("");

  elements.applicationList.innerHTML = rowsHtml;
}

// 6. 폼 및 액션 이벤트 핸들러
function resetForm() {
  elements.form.reset();
  elements.editIdInput.value = "";
  editingId = null;
  elements.applyDateInput.value = getTodayDateString();
  elements.formTitle.textContent = "지원 내역 등록";
  elements.saveBtn.textContent = "저장";
  elements.cancelBtn.style.display = "none";
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const company = elements.companyInput.value.trim();
  const jobTitle = elements.jobTitleInput.value.trim();
  const jobUrl = elements.jobUrlInput.value.trim();
  const applyDate = elements.applyDateInput.value;
  const status = elements.statusSelect.value;
  const notes = elements.notesTextarea.value.trim();

  if (!company || !jobTitle || !applyDate) {
    alert("회사명, 직무, 지원일은 필수 입력 항목입니다.");
    return;
  }

  // 서버 API 전송용 페이로드
  const payload = {
    company,
    position: jobTitle,
    job_url: jobUrl || null,
    applied_date: applyDate,
    status,
    memo: notes || null
  };

  try {
    if (editingId) {
      // 1. 수정 모드: PUT /api/applications/:id
      const res = await fetch(`${API_BASE_URL}/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "수정에 실패했습니다.");
      }
    } else {
      // 2. 신규 등록: POST /api/applications
      const res = await fetch(API_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "등록에 실패했습니다.");
      }
    }

    resetForm();
    await loadApplications();
  } catch (error) {
    console.error("저장 실패:", error);
    alert(`오류: ${error.message}`);
  }
}

function startEdit(id) {
  const target = applications.find((item) => String(item.id) === String(id));
  if (!target) return;

  editingId = target.id;
  elements.editIdInput.value = target.id;
  elements.companyInput.value = target.company;
  elements.jobTitleInput.value = target.jobTitle;
  elements.jobUrlInput.value = target.jobUrl || "";
  elements.applyDateInput.value = target.applyDate;
  elements.statusSelect.value = target.status;
  elements.notesTextarea.value = target.notes || "";

  elements.formTitle.textContent = "지원 내역 수정";
  elements.saveBtn.textContent = "수정 완료";
  elements.cancelBtn.style.display = "inline-flex";

  elements.form.scrollIntoView({ behavior: "smooth", block: "start" });
  elements.companyInput.focus();
}

async function deleteApplication(id) {
  if (!confirm("해당 지원 내역을 삭제하시겠습니까?")) return;

  try {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: "DELETE"
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "삭제에 실패했습니다.");
    }

    if (String(editingId) === String(id)) {
      resetForm();
    }

    await loadApplications();
  } catch (error) {
    console.error("삭제 실패:", error);
    alert(`삭제 중 오류 발생: ${error.message}`);
  }
}

// 7. 초기화 및 이벤트 리스너 등록
function init() {
  // 기본 지원일 오늘 날짜로 세팅
  elements.applyDateInput.value = getTodayDateString();

  // 폼 제출 이벤트
  elements.form.addEventListener("submit", handleFormSubmit);

  // 수정 취소 버튼 이벤트
  elements.cancelBtn.addEventListener("click", resetForm);

  // 실시간 검색어 입력 이벤트
  elements.searchInput.addEventListener("input", (e) => {
    currentSearch = e.target.value;
    renderApplications();
  });

  // 상태 필터 변경 이벤트
  elements.statusFilter.addEventListener("change", (e) => {
    currentStatusFilter = e.target.value;
    renderApplications();
  });

  // 테이블 액션(수정/삭제) 이벤트 위임
  elements.applicationList.addEventListener("click", (e) => {
    const target = e.target.closest("button");
    if (!target) return;

    const action = target.dataset.action;
    const id = target.dataset.id;

    if (action === "edit") {
      startEdit(id);
    } else if (action === "delete") {
      deleteApplication(id);
    }
  });

  // 서버에서 초기 지원 목록 로드
  loadApplications();
}

// DOM 로드 완료 시 실행
document.addEventListener("DOMContentLoaded", init);
