const status = document.getElementById("copy-status");

for (const button of document.querySelectorAll("button[data-copy]")) {
  const source = document.getElementById(button.dataset.copy);
  const label = button.textContent;
  let reset;

  button.hidden = false;
  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(source.textContent.trim());
      button.textContent = "복사됨";
      status.textContent = "클립보드에 복사했습니다.";
    } catch {
      const range = document.createRange();
      range.selectNodeContents(source);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      button.textContent = "선택됨";
      status.textContent = "선택된 텍스트를 복사하세요.";
    }
    window.clearTimeout(reset);
    reset = window.setTimeout(() => { button.textContent = label; }, 1800);
  });
}
