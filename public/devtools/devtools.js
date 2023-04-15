// 获取指定请求体属性值
function getFormDataAttrVal(request, key = 'apiID') {
  if (!request || !request.postData || !request.postData.params || !request.postData.params.length) return false;
  let len = request.postData.params.length;
  for (let i = 0; i < len; i++) {
    let item = request.postData.params[i];
    if (item.name === key) return item.value
  }
  return false;
}

chrome.devtools.panels.create("EolinkApi2TsType",
  "",
  "/devtools/panel.html",
  function(panel) {
    panel.onShown.addListener((win)=>{
      win.postMessage('init', '*');

      chrome.devtools.network.onRequestFinished.addListener(
        function(req) {
          if (req.request.method === 'OPTIONS') return false;
          if (/\/api\/apiManagementPro\/Api\/getApi$/.test(req.request.url)){
            
            req.getContent((body)=>{
              let data = {isEolinkData: true,apiData:{}}
              data.apiData[getFormDataAttrVal(req.request)] = JSON.parse(body)
              win.postMessage(data, '*');
            })
          }
        }
      );
    })
  }
);