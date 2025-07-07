function textToBinary(text) {
  return text.split('').map(char => {
    return char.charCodeAt(0).toString(2).padStart(8, '0');
  }).join('');
}

function binaryToText(binary) {
  let chars = [];
  for (let i = 0; i < binary.length; i += 8) {
    let byte = binary.slice(i, i + 8);
    chars.push(String.fromCharCode(parseInt(byte, 2)));
  }
  return chars.join('');
}

function encode() {
  const input = document.getElementById('imageInput');
  const message = document.getElementById('messageInput').value;
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const downloadLink = document.getElementById('downloadLink');

  if (!input.files[0] || !message) {
    alert("⚠️ Please upload a PNG image and enter a message!");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      const binaryMsg = textToBinary(message + "|||");
      let index = 0;

      for (let i = 0; i < data.length; i += 4) {
        if (index < binaryMsg.length) {
          data[i] = (data[i] & 0xFE) | parseInt(binaryMsg[index]); index++;
        }
        if (index < binaryMsg.length) {
          data[i + 1] = (data[i + 1] & 0xFE) | parseInt(binaryMsg[index]); index++;
        }
        if (index < binaryMsg.length) {
          data[i + 2] = (data[i + 2] & 0xFE) | parseInt(binaryMsg[index]); index++;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      const encodedURL = canvas.toDataURL();
      downloadLink.href = encodedURL;
      downloadLink.download = "encoded_image.png";
      downloadLink.style.display = "inline-block";
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(input.files[0]);
}

function decode() {
  const input = document.getElementById('decodeInput');
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const output = document.getElementById('output');

  if (!input.files[0]) {
    alert("⚠️ Please upload an encoded PNG image!");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      let binary = '';
      for (let i = 0; i < data.length; i += 4) {
        binary += (data[i] & 1).toString();
        binary += (data[i + 1] & 1).toString();
        binary += (data[i + 2] & 1).toString();
      }

      const text = binaryToText(binary);
      const hiddenMessage = text.split("|||")[0];
      output.textContent = hiddenMessage ? hiddenMessage : "(No message found)";
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(input.files[0]);
}
