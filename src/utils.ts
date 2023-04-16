import type { UnionParamItem, DataStructureList, ParamItem, ApiDataType } from './model'
import { RequestTypeMap } from './model'
import { message } from 'antd';

// 属性列表递归,将api的数据遍历成一个树结构
export function paramsListRecursion(list: UnionParamItem[], dataStructureList: DataStructureList): ParamItem[] {
  let arr: ParamItem[] = [];
  list.forEach(item => {
    if (item.structureID) {
      return arr.push(...(dataStructureList?.[item.structureID]?.structureData || []))
    }
    if (item.childList && item.childList.length) {
      item.childList = paramsListRecursion(item.childList, dataStructureList);
    }
    arr.push(item)
  })
  return arr;
}

let textArea: HTMLTextAreaElement;
export function structureCopy(elements: HTMLElement[]) {
  if (!textArea) {
    textArea = document.createElement('textarea');
    textArea.setAttribute('style', 'width: 0;height: 0;overflow: hidden;resize: none;border-width: 0;box-shadow: unset;outline: unset;background: transparent;')
  }
  document.body.appendChild(textArea);
  let texts: string = '';
  elements.forEach(ele => {
    texts += ele ? (ele.innerText + '\n') : '';
  })
  textArea.value = texts;
  try {
    textArea.select();
    document.execCommand("copy");
    message.success('应该复制成功了，没成功就手动复制吧[狗头]')
  } catch (err) {
    message.error('应该复制失败了，手动复制下吧[狗头]')
  }
  document.body.removeChild(textArea);
}


interface TemplateData {
  functionName: string;
  restfulParams: string;
  params: string;
  method: string;
  url: string;
  resultType: string;
}
export const defaultTemplate = `export function [functionName](data: [params]) {
  return http.[method]('[url]', data);
}`

export function replaceFunTemplate(templateData: TemplateData, templateStr: string = defaultTemplate): string {
  let funStr = templateStr;
  funStr = funStr.replace(/\[functionName\]/g, templateData.functionName);
  funStr = funStr.replace(/\[restfulParams\]/g, templateData.restfulParams || '');
  funStr = funStr.replace(/\[params\]/g, templateData.params || '');
  funStr = funStr.replace(/\[method\]/g, templateData.method);
  funStr = funStr.replace(/\[url\]/g, templateData.url);
  funStr = funStr.replace(/\[resultType\]/g, templateData.resultType);
  return funStr;
}

export const defaultNameFun = (str, baseInfo: ApiDataType['apiInfo']['baseInfo']): string => {
  if (!str) return '';
  let pathArr = str.split(/\//).slice(-3)?.filter(path => path);
  pathArr = pathArr
    .map((path) => path
      .replace(/-\w/, (v) => v.replace('-', '').toUpperCase())
      .replace(/\W/, '')
      .replace(/^\w/, (v) => v.toUpperCase())
    );
  return RequestTypeMap[baseInfo.apiRequestType].toLocaleLowerCase() + pathArr.join('');
}



export function getStorageItem<T = any>(name: string): T | false {
  let vals = localStorage.getItem(name);
  if (vals) return JSON.parse(vals) as T;
  return false;
}
export function setStorageItem(name: string, data: Record<string, any>): void {
  localStorage.setItem(name, JSON.stringify(data));
}


/**
 * 用于递归查找出属性数不为1的子接口，并返回接口名称
 * @param list 接口属性列表
 * @param keyName 父级属性名
 * @returns 
 */
function getDeepenComplierRecursion(list: ParamItem[], keyName?: string): [ParamItem[], string] {
  if (list.length === 1 && list[0].childList?.length) {
    return getDeepenComplierRecursion(list[0].childList, list[0].paramKey);
  }
  return [list, keyName];
}


/**
 * 处理选择解析指定参数，出现外层接口只有一个属性的情况，如
 * 
 * interface Record {
 *  a: string;
 *  b: string;
 * }
 * 
 * interface Data {
 *  record: Record[],
 * }
 * 
 * interface postListing {
 *  data: Data;
 * }
 * 这种情况下，递归返回子接口的类型有多个属性的子接口,
 * 并同时返回新接口名：此时使用defaultNameFun + 满足条件的子类型的上级属性名决定，以上为例接口为：
 * interface postListingRecord {
 *  a: string;
 *  b: string;
 * }
 * @param list 当前过滤后接口属性列表
 * @param baseInfo 接口信息，用于生成接口名
 * @param suffix 默认接口后缀，当list不为只有一个属性接口时，后续由该参数指定
 * @returns [子接口属性列表，接口名称]
 */
export function getParamsInterfaceName(
  list: ParamItem[],
  baseInfo: ApiDataType['apiInfo']['baseInfo'],
  suffix: string = ''): [ParamItem[], string] {
  let name = defaultNameFun(baseInfo.apiURI, baseInfo);
  if (list.length === 1 && list[0].childList?.length) {
    let [complierParams, keyName] = getDeepenComplierRecursion(list, list[0].paramKey);
    const UpperKeyName = keyName.replace(/^\w/, (v) => v.toUpperCase());
    return [complierParams, defaultNameFun(baseInfo.apiURI, baseInfo) + UpperKeyName];
  }
  return [list, name + suffix];
}