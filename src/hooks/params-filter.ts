import type { ApiDataType, ParamItem } from '../model';
import { useState } from 'react';
import { getParamsInterfaceName } from '../utils';

interface FilterTree {
  [PropName: string]: FilterTreeItem
}
interface FilterTreeItem {
  key: string,
  child: FilterTree | boolean,
}

interface ParamItemTree {
  [PropName: string]: {
    item: ParamItem,
    emptyChildItem: ParamItem,
    child: ParamItemTree
  }
}

/**
 * 将深层次参数数组，转换为对象树结构
 * @param paramList 参数列表
 * @returns 
 */
const getParamTree = (paramList: ParamItem[]): ParamItemTree => {
  const obj: ParamItemTree = {}
  if (!paramList || !paramList.length) return obj;
  for (let item of paramList) {
    let emptyChildItem = { ...item, childList: [] };
    obj[item.paramKey] = {
      emptyChildItem,
      item,
      child: item.childList?.length ? getParamTree(item.childList) : ({}),
    }
  }
  return obj;
}

/**
 * 将antd Cascader选择器返回的数据，转换为树
 * @param keys 过滤参数列表
 * @returns 返回过滤参数树
 * Cascader选择器返回的数据结构为:
    [
      ['code'],
      ['data', 'current'],
      ['data', 'records', 'cbtItemId'],
      ['data', 'records', 'chargePersonIdList'],
      ['data', 'total'],
    ]
*/
function getFilterTree(keys: string[][]): FilterTree {

  const obj: FilterTree = {};
  let currentObj: FilterTree

  for (let keyList of keys) {
    // 第一层循环，所以首元素不存在属性，需要添加个初始属性
    if (!obj[keyList[0]]) {
      obj[keyList[0]] = {
        key: keyList[0],
        // 如果keyList长度为1，表示没有子级了，否则表示有子级
        child: keyList.length>1? {} : false,
      }
    }

    // 如果keyList长度为1，可以不用继续往下了
    if (keyList.length === 1) continue;

    // 否则，继续添加子元素，更新一下currentObj，标记当前层级对象
    currentObj = obj[keyList[0]].child as FilterTree;

    // 去掉第一层，刚刚已经添加
    const subKeyList = keyList.slice(1);
    let len = subKeyList.length;

    // 第二层遍历，添加子元素
    for (let i = 0; i < len; i++) {
      let key = subKeyList[i];
      let newChild = {
        key,
        // 如果keyList长度为1，表示没有子级了，否则表示有子级
        child: i + 1 < len ? {} : false,
      }
      // 添加当前子元素
      currentObj[key] = newChild;
      // 更新一下currentObj，更新当前层级对象
      currentObj = newChild.child;
    }

  }
  return obj;
}



/**
 * 递归解析过滤参数树，返回过滤后的参数列表  
 * @param paramTree 参数权
 * @param keysTree 过滤参数树
 * @returns 过滤后参数列表    
 */
const filterParamsRecursion = (paramTree: ParamItemTree, keysTree: FilterTree | boolean): ParamItem[] => {
  let arr: ParamItem[] = [];

  Object.keys(keysTree).forEach(key => {
    let keyItem = keysTree[key]
    if (!keyItem.child) {
      // 过滤参数树不存在子级了，则直接将对应当前层的参数列表树的值直接返回
      arr.push(paramTree[key].item);
      return;
    }

    // 否则，将当前项push进列表，同时递归处理子级
    arr.push({
      ...paramTree[key].emptyChildItem,
      childList: filterParamsRecursion(paramTree[key].child, keysTree[key].child),
    });
  })
  return arr;

}

/**
 * 过滤要解析的参数
 * 将参数列表和要解析参数都转换成树结构
 * 然后再通过递归解析参数树，返回参数列表
 * @param paramList 参数列表
 * @param keys 过滤的参数keys
 * @returns 过滤后的参数列表
 */
const filterParams = (paramList: ParamItem[], keys: string[][]): ParamItem[] => {
  if (!keys || !keys.length) return paramList;
  return filterParamsRecursion(getParamTree(paramList), getFilterTree(keys));
}



export function useParamsFilterHooks(opts: {
  paramList: ParamItem[],
  apiData: ApiDataType,
  suffix?: string,
}): {
  interfaceName: string;
  filteredParams: ParamItem[];
  filterKeys: string[][];
  setFilterKeys: (keys: string[][]) => void;
} {
  const { paramList, apiData, suffix } = opts;
  const [filterKeys, setFilterKeys] = useState([]);
  const allFilteredParams = filterParams(paramList, filterKeys);
  // 这里过滤掉父级只有一个属性的情况，详情可查看getParamsInterfaceName方法说明
  const [filteredParams, interfaceName] = getParamsInterfaceName(allFilteredParams, apiData.apiInfo.baseInfo, suffix);
  return {
    interfaceName,
    filteredParams,
    filterKeys,
    setFilterKeys,
  }
}