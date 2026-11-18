async function loadTemplate(source) {
  const copy = document.querySelector('[data-copy="' + source.id + '"]');
  try {
    const response = await fetch(source.dataset.templateSrc);
    if (!response.ok) throw new Error("Unable to load template");
    const content = await response.text();
    if (!content.trim()) throw new Error("Template is empty");
    source.textContent = content;
    copy.disabled = false;
  } catch {
    source.textContent = "파일 내용을 불러오지 못했습니다. 위의 다운로드 링크를 이용하세요.";
  }
}

for (const source of document.querySelectorAll("code[data-template-src]")) {
  loadTemplate(source);
}
