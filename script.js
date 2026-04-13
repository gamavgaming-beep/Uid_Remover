const fileInput = document.getElementById('fileInput');
const fileNameDiv = document.getElementById('fileName');
const patternMsg = document.getElementById('patternMsg');
const downloadBtn = document.getElementById('downloadBtn');

let modifiedBuffer = null;
let originalFileName = '';

fileInput.addEventListener('change', function () {
  const file = this.files[0];
  if (file && file.name.endsWith('.bytes')) {
    originalFileName = file.name;
    fileNameDiv.textContent = "Selected File: " + file.name;
    const reader = new FileReader();

    reader.onload = function (e) {
      const buffer = new Uint8Array(e.target.result);
      let index = -1;

      for (let i = buffer.length - 7; i >= 0; i--) {
        if (buffer[i] === 0x38 && buffer[i + 6] === 0x42) {
          index = i;
          break;
        }
      }

      if (index !== -1) {
        const newBuffer = new Uint8Array(buffer.length - 4); // remove 4 bytes
        newBuffer.set(buffer.slice(0, index), 0);
        newBuffer.set([0x38, 0x00, 0x42], index);
        newBuffer.set(buffer.slice(index + 7), index + 3);

        modifiedBuffer = newBuffer;
        patternMsg.textContent = '';
        downloadBtn.disabled = false;
      } else {
        patternMsg.textContent = 'Pattern not found';
        downloadBtn.disabled = true;
        modifiedBuffer = null;
      }
    };

    reader.readAsArrayBuffer(file);
  } else {
    fileNameDiv.textContent = "Invalid file type. Please select a .bytes file.";
    patternMsg.textContent = '';
    this.value = '';
    downloadBtn.disabled = true;
  }
});

downloadBtn.addEventListener('click', function () {
  if (modifiedBuffer && originalFileName) {
    const blob = new Blob([modifiedBuffer], { type: "application/octet-stream" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `modified_${originalFileName}`;
    a.click();
    URL.revokeObjectURL(a.href);
  }
});
