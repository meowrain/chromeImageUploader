function sendMessage(msg) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "../icons/icon-128.png",
    title: "upload-image",
    message: msg,
  });
}
 // 根据jsonPath参数获取值的辅助函数
function getValueByJsonPath(data, jsonPath) {
  const keys = jsonPath.split('.');
  let value = data;

  for (const key of keys) {
    if (value.hasOwnProperty(key)) {
      value = value[key];
    } else {
      return null; // 如果路径无效或找不到对应的键，则返回null
    }
  }

  return value;
}

function base64ToBlob(base64Data, contentType) {
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: contentType });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const base64Data = request.imageData.split(",")[1];
  const blob = base64ToBlob(base64Data, "image/png");

  if (request.action == "uploadImage" && request.imageData) {
    chrome.storage.sync.get(["formaData"], (result) => {
      let token;
      let postHeaders;
      const apiUrl = result["formaData"].apiUrl;
      const jsonPath = result["formaData"].jsonPath;
      if (result["formaData"].postBodys) {
        token = JSON.parse(result["formaData"].postBodys).token;
      }
      if(result["formaData"].postHeaders){
        postHeaders = JSON.parse(result["formaData"].postHeaders)
      }
      const formData = new FormData();
      formData.append(result["formaData"].postParams, blob, "image.png"); // 使用实际的文件名
      formData.append("token", token);
      fetch(apiUrl, {
        method: "POST",
        body: formData,
        headers: postHeaders,
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Upload response:", data);
          const foundUrl = getValueByJsonPath(data, jsonPath);
          sendResponse({ success: true });
          sendMessage("Image uploaded successfully,url:\n" + foundUrl);
          //传送data.url到content.js
          chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
              chrome.tabs.sendMessage(
                tabs[0].id,
                { action: "picurl_copy", url: foundUrl },
                function (response) {
                  console.log(response);
                }
              );
            }
          );
        })
        .catch((error) => {
          console.error("Error uploading image:", error);
          sendResponse({ error: "Error uploading image" });
        });
    });

    return true;
  }
});
