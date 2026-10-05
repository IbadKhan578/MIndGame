const $ = (s) => document.querySelector(s),
  paper = $("#paper"),
  note = $("#note"),
  hint = $("#hint");
const rnd = (a, b) => Math.random() * (b - a) + a,
  rd = () => Math.floor(rnd(0, 10));
let n, pairs, rows;
const wob = (s, cls) =>
  `<span class="num ${cls}">` +
  [...s]
    .map(
      (d) =>
        `<i style="transform:rotate(${rnd(-5, 5)}deg) translateY(${rnd(-2, 2)}px)">${d}</i>`,
    )
    .join("") +
  "</span>";
const comp = (s) => [...s].map((d) => 9 - d).join("");
const randNum = () =>
  String(Math.floor(rnd(1, 10))) + Array.from({ length: n - 1 }, rd).join("");
const predict = (s, k) =>
  (BigInt(s) + BigInt(k) * 10n ** BigInt(s.length) - BigInt(k))
    .toString()
    .padStart(s.length + 1, "0");
function addRow(tag, html) {
  const r = document.createElement("div");
  r.className = "row";
  r.innerHTML = `<span class="tag">${tag}</span>${html}`;
  paper.appendChild(r);
  return r;
}
function inputRow(tag, val, onDone) {
  const r = addRow(
    tag,
    `<input type="text" inputmode="numeric" maxlength="${n}" style="--n:${n}" value="${val}" aria-label="${tag}"><button class="ghost" type="button">🎲</button><button type="button">Write it</button>`,
  );
  const inp = r.querySelector("input");
  inp.focus();
  inp.oninput = () => (inp.value = inp.value.replace(/\D/g, ""));
  r.querySelector(".ghost").onclick = () => (inp.value = randNum());
  const go = () => {
    if (inp.value.length !== n) {
      hint.textContent = `Enter exactly ${n} digits.`;
      return;
    }
    hint.textContent = "";
    const v = inp.value;
    r.innerHTML = `<span class="tag">${tag}</span>${wob(v, "aud")}`;
    onDone(v);
  };
  r.querySelector("button:last-child").onclick = go;
  inp.onkeydown = (e) => {
    if (e.key === "Enter") go();
  };
}
function start() {
  n = Math.min(20, Math.max(2, +$("#digits").value || 5));
  pairs = Math.min(6, Math.max(1, +$("#pairs").value || 2));
  $("#digits").value = n;
  $("#pairs").value = pairs;
  paper.innerHTML = "";
  rows = [];
  note.className = "note sealed";
  note.innerHTML = "<small>Prediction</small>🔒 sealed";
  hint.textContent = "Write the first number (or tap the dice).";
  inputRow("Start", randNum(), (v) => {
    rows.push(v);
    showPrediction(v);
    ask(1);
  });
}
function showPrediction(first) {
  note.className = "note";
  note.innerHTML = `<small>Predicted total</small>${wob(predict(first, pairs), "tot")}`;
}
function ask(i) {
  hint.textContent = `Audience, call out a ${n}-digit number.`;
  inputRow(`Audience ${i}`, "", (v) => {
    rows.push(v);
    hint.textContent = "";
    setTimeout(() => {
      rows.push(comp(v));
      addRow("Me", wob(comp(v), "perf"));
      setTimeout(() => (i < pairs ? ask(i + 1) : finish()), 700);
    }, 600);
  });
}
function finish() {
  const b = document.createElement("button");
  b.textContent = "Add them all up";
  b.style.marginTop = "14px";
  paper.appendChild(b);
  b.onclick = () => {
    b.remove();
    const total = rows
        .reduce((a, x) => a + BigInt(x), 0n)
        .toString()
        .padStart(n + 1, "0"),
      p = predict(rows[0], pairs);
    const r = document.createElement("div");
    r.className = "rule";
    paper.appendChild(r);
    addRow("Total", wob(total, "tot"));
    note.className = "note";
    note.innerHTML = `<small>Predicted total</small>${wob(p, "tot")}<small style="margin-top:10px">Actual total</small>${wob(total, "tot")}<div class="ok">${p === total ? "✓ Prediction matches" : "✗ Mismatch"}</div>`;
    hint.textContent = `How: write each “Me” row so every column adds to 9. The pairs total ${"9".repeat(n)} each, so the sum is the first number − ${pairs}, with a ${pairs} in front.`;
  };
}
$("#start").onclick = start;
start();
