//保存设置
function saveSettings() {
    const apiUrl = document.getElementById("apiUrl").value;
    const jsonPath = document.getElementById("jsonPath").value;
    const postParams = document.getElementById("postParam").value;
    const postHeaders = document.getElementById("customRequestHeaders").value;
    const postBodys = document.getElementById("customRequestBody").value;
    const formData = {
        apiUrl,
        jsonPath,
        postParams,
        postHeaders,
        postBodys
    };
    chrome.storage.sync.set({'formaData': formData}).then(() => {
        console.log('save success');
    });
}
document.addEventListener('DOMContentLoaded', function() {
    const saveButton = document.querySelector("#saveBtn");
    chrome.storage.sync.get(['formaData']).then((result) => {
        const apiUrl = result['formaData'].apiUrl;
        const jsonPath = result['formaData'].jsonPath;
        const postParams = result['formaData'].postParams;
        const postHeaders = result['formaData'].postHeaders;
        const postBodys = result['formaData'].postBodys;
        document.getElementById("apiUrl").value = apiUrl;
        document.getElementById("jsonPath").value = jsonPath;
        document.getElementById("postParam").value = postParams;
        document.getElementById("customRequestHeaders").value = postHeaders;
        document.getElementById("customRequestBody").value = postBodys;
    });
    saveButton.addEventListener('click', saveSettings);
})