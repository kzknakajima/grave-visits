import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const visitsRef = collection(db, "visits");

const form = document.getElementById("visit-form");
const idInput = document.getElementById("visit-id");
const dateInput = document.getElementById("date");
const visitorsInput = document.getElementById("visitors");
const flowersInput = document.getElementById("flowersOffered");
const cleanedInput = document.getElementById("cleaned");
const memoInput = document.getElementById("memo");
const submitBtn = document.getElementById("submit-btn");
const cancelBtn = document.getElementById("cancel-edit-btn");
const formTitle = document.getElementById("form-title");
const listEl = document.getElementById("visit-list");
const loadingEl = document.getElementById("loading");
const emptyEl = document.getElementById("empty");
const hintEl = document.getElementById("hint");

// 今日の日付をデフォルトにする
dateInput.value = new Date().toISOString().slice(0, 10);

function resetForm() {
  form.reset();
  idInput.value = "";
  dateInput.value = new Date().toISOString().slice(0, 10);
  formTitle.textContent = "記録を追加";
  submitBtn.textContent = "記録を保存";
  cancelBtn.classList.add("hidden");
}

cancelBtn.addEventListener("click", resetForm);

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const visitors = visitorsInput.value
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const data = {
    date: dateInput.value,
    visitors,
    flowersOffered: flowersInput.checked,
    cleaned: cleanedInput.checked,
    memo: memoInput.value.trim(),
    updatedAt: serverTimestamp(),
  };

  submitBtn.disabled = true;
  try {
    if (idInput.value) {
      await updateDoc(doc(db, "visits", idInput.value), data);
    } else {
      data.createdAt = serverTimestamp();
      await addDoc(visitsRef, data);
    }
    resetForm();
  } catch (err) {
    alert("保存に失敗しました: " + err.message);
  } finally {
    submitBtn.disabled = false;
  }
});

function startEdit(id, v) {
  idInput.value = id;
  dateInput.value = v.date || "";
  visitorsInput.value = (v.visitors || []).join(", ");
  flowersInput.checked = !!v.flowersOffered;
  cleanedInput.checked = !!v.cleaned;
  memoInput.value = v.memo || "";
  formTitle.textContent = "記録を編集";
  submitBtn.textContent = "更新する";
  cancelBtn.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function removeVisit(id) {
  if (!confirm("この記録を削除しますか?")) return;
  try {
    await deleteDoc(doc(db, "visits", id));
  } catch (err) {
    alert("削除に失敗しました: " + err.message);
  }
}

function renderHint(latest) {
  if (!latest) {
    hintEl.classList.add("hidden");
    return;
  }
  hintEl.classList.remove("hidden");
  if (!latest.flowersOffered) {
    hintEl.textContent = `前回(${latest.date})はお花を供えていません。そろそろお花を買った方が良さそうです。`;
  } else {
    hintEl.textContent = `前回(${latest.date})はお花を供えました。`;
  }
}

function renderList(items) {
  loadingEl.classList.add("hidden");
  listEl.innerHTML = "";

  if (items.length === 0) {
    emptyEl.classList.remove("hidden");
    renderHint(null);
    return;
  }
  emptyEl.classList.add("hidden");
  renderHint(items[0].data);

  for (const { id, data } of items) {
    const li = document.createElement("li");
    li.className = "visit-item";

    const dateEl = document.createElement("div");
    dateEl.className = "visit-date";
    dateEl.textContent = data.date;
    li.appendChild(dateEl);

    if (data.visitors && data.visitors.length > 0) {
      const visitorsEl = document.createElement("div");
      visitorsEl.className = "visit-visitors";
      visitorsEl.textContent = data.visitors.join(" / ");
      li.appendChild(visitorsEl);
    }

    const tagsEl = document.createElement("div");
    tagsEl.className = "visit-tags";
    const flowerTag = document.createElement("span");
    flowerTag.className = "tag " + (data.flowersOffered ? "done" : "notdone");
    flowerTag.textContent = data.flowersOffered ? "花: 供えた" : "花: 供えていない";
    tagsEl.appendChild(flowerTag);
    const cleanTag = document.createElement("span");
    cleanTag.className = "tag " + (data.cleaned ? "done" : "notdone");
    cleanTag.textContent = data.cleaned ? "掃除: した" : "掃除: していない";
    tagsEl.appendChild(cleanTag);
    li.appendChild(tagsEl);

    if (data.memo) {
      const memoEl = document.createElement("div");
      memoEl.className = "visit-memo";
      memoEl.textContent = data.memo;
      li.appendChild(memoEl);
    }

    const actionsEl = document.createElement("div");
    actionsEl.className = "visit-actions";
    const editBtn = document.createElement("button");
    editBtn.textContent = "編集";
    editBtn.addEventListener("click", () => startEdit(id, data));
    actionsEl.appendChild(editBtn);
    const delBtn = document.createElement("button");
    delBtn.className = "danger";
    delBtn.textContent = "削除";
    delBtn.addEventListener("click", () => removeVisit(id));
    actionsEl.appendChild(delBtn);
    li.appendChild(actionsEl);

    listEl.appendChild(li);
  }
}

const q = query(visitsRef, orderBy("date", "desc"));
onSnapshot(
  q,
  (snapshot) => {
    const items = snapshot.docs.map((d) => ({ id: d.id, data: d.data() }));
    renderList(items);
  },
  (err) => {
    loadingEl.textContent = "読み込みに失敗しました: " + err.message;
  }
);
