chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action == "picurl_copy") {
    console.log("Uploaded Image URL " + message.url);
    //将图片地址保存到剪贴板
    saveUrlToClipboardWithConvertToMd(message.url);

    // 延迟关闭消息端口
    setTimeout(() => {
      sendResponse({ received: true }); // 发送响应
    }, 100); // 这里延迟了 100 毫秒关闭消息端口，你可以根据实际情况调整延迟时间
    return true; // 返回 true 以确保异步发送响应
  }
});
function saveUrlToClipboardWithConvertToMd(url) {
  const str = `![image](${url})`;
  const input = document.createElement("input");
  input.style.position = "fixed";
  input.style.opacity = 0;
  input.value = str;
  document.body.appendChild(input);

  input.select();
  input.setSelectionRange(0, input.value.length);
  document.execCommand("copy");
  document.body.removeChild(input);
}

document.addEventListener("paste", function (event) {
  const items = (event.clipboardData || event.originalEvent.clipboardData)
    .items;

  if (!items) {
    return;
  }

  for (const item of items) {
    if (item.type.indexOf("image") === 0) {
      const blob = item.getAsFile();
      if (blob) {
        // 将 Blob 对象转换为 base64 字符串
        const reader = new FileReader();
        reader.onload = function (event) {
          const base64String = event.target.result;
          chrome.runtime.sendMessage(
            { action: "uploadImage", imageData: base64String },
            function (response) {
              console.log(response);
            }
          );
        };
        reader.readAsDataURL(blob);
      }
    }
  }
});
