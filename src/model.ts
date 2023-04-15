
export const ParamTypeMap = {
  '0': 'string',
  '1': 'File',
  '2': 'string', // json
  '3': 'number', // int
  '4': 'number', // float
  '5': 'number', // double
  '6': 'string', // date
  '7': 'string', // date time
  '8': 'boolean', // boolean
  '9': 'string', // byte
  '10': 'number', // short
  '11': 'number', // long
  '12': 'string[]', // array
  '13': 'Record<string, any>', // object
  '14': 'number', // number
  '15': 'null', // null
  'char': 'string', // char
}

export const RequestTypeMap = { 0: 'POST', 1: 'GET', 2: 'PUT', 3: 'DELETE', 4: 'HEAD', 5: 'OPTIONS', 6: 'PATCH' }

type ParamTypeMapKeys = keyof typeof ParamTypeMap;
type RequestTypeVals = keyof typeof RequestTypeMap;
export interface ParamItem {
  childList: UnionParamItem[];
  paramKey: string;
  paramName: string;
  paramNotNull: '0' | '1'; // 参数是否可缺省，1可缺省，0不可缺省
  paramType: ParamTypeMapKeys;
}

interface StructureParamItem extends Partial<ParamItem> {
  structureID?: number;
}

export type UnionParamItem = StructureParamItem & ParamItem;

// eolink 接口 引用数据结构项 的类型
export interface DataStructureList {
  [propName: string]: {
    structureData: UnionParamItem[];
    structureType: ParamTypeMapKeys
  };
}
interface BaseInfo {
  apiName: string;
  apiURI: string;
  apiRequestType: RequestTypeVals;
}
interface ApiInfo {
  baseInfo: BaseInfo;
  dataStructureList: DataStructureList;
  requestInfo: UnionParamItem[];
  urlParam: UnionParamItem[];
  restfulParam: UnionParamItem[];
  resultInfo: { isDefault: 0 | 1, responseCode: number, responseName: string, paramList: UnionParamItem[], responseID: number }[]
}
export interface ApiDataType {
  apiInfo: ApiInfo
}


export interface TableDataType {
  key: number;
  name: string;
  content: string;
}

export const enum LocalStorageKeys  {
  FunTempList = 'FunTempList', // 调用方法模板 localStorage key
  DefaultFunKey = 'DefaultFunKey',  // 默认调用方法模板key
  FunNameGeneratorList = 'FunNameGeneratorList', // 调用方法名生成函数 localStorage key
  DefaultFunNameGeneratorKey = 'DefaultFunNameGeneratorKey', // 调用方法名生成函数 localStorage key
} 

// 要使用接口进行生成的属性类型
export const InterfaceType = {
  '12': true, // 数组
  '13': true, // 对象
}