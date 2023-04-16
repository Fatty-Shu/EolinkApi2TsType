import type { ApiDataType, TableDataType, ParamItem } from '../model';
import { RequestTypeMap, LocalStorageKeys, InterfaceType, ParamTypeMap } from '../model';
import { forwardRef, useState } from 'react';
import { Collapse, Button, Space, Select, Checkbox, Tooltip } from 'antd';
import { structureCopy, replaceFunTemplate, defaultTemplate, defaultNameFun } from '../utils';
import { FunTemplateModal } from './api-fun-template/fun-template-modal';
import { useTableDataMaintainHook } from '../hooks/table-data-maintain';

const { Panel } = Collapse;


// 行
const lineParamString = (param: ParamItem, subType?: string) => {
  const { paramNotNull, paramName, paramKey, paramType } = param;
  const optionalSymbol = (paramNotNull === '1') ? '?' : '';
  const commentStr = paramName ? ('\b//\b' + paramName) : '';

  return `\b\b${paramKey}${optionalSymbol}:${subType ? subType : ParamTypeMap[paramType]}${commentStr}\n`
}

// 获取直接插入模板的参数字符串
const getInsertParamsString = (params: ParamItem[]): string => {
  let str = '{\n'
  try {
    params.forEach((param) => {
      if (InterfaceType[param.paramType] && param.childList?.length) {
        return str += lineParamString(param, getInsertParamsString(param.childList) + (param.paramType === '12' ? '[]' : '') + ';');
      }
      str += lineParamString(param);
    })
  } catch (err) {
    console.log('参数解析发生错误', err)
  }
  str += '}'

  return str;
}

const getRestfulParamsString = (params: ParamItem[]): string => {
  return params.length <= 2 ? params.map(({ paramKey, paramType, paramNotNull }) => {
    const optionalSymbol = (paramNotNull === '1') ? '?' : '';
    return `${paramKey}${optionalSymbol}: ${ParamTypeMap[paramType]}`
  }).join(',\b')
    : getInsertParamsString(params)
}
interface Props {
  apiData: ApiDataType
  bodyInfos: [string, ParamItem[]];
  resultInfos: [string, ParamItem[]];
  queryInfos: [string, ParamItem[]];
  restfulParams: ParamItem[];
}
type DivRef = React.MutableRefObject<HTMLDivElement>
type ParamsCollapseType = React.ForwardRefRenderFunction<HTMLDivElement, Props>;
const ApiFunctionCollapse: ParamsCollapseType = (props, parentRef) => {
  const {
    apiData: { apiInfo: { baseInfo, resultParamJsonType } },
    bodyInfos: [bodyInterfaceName, bodyFilterParams],
    resultInfos: [resultInterfaceName, resultFilterParams],
    queryInfos: [queryInterfaceName, queryFilterParams],
    restfulParams,
  } = props;
  const [openFunTempModal, setFunTempModal] = useState(false);
  const {
    defaultKey: defaultFunKey,
    list: FunTempList,
    selected: selectedFunTemp,
    setSelected: setSelectedFunTemp,
    updateHandler: updateFunTempListHandler,
  } = useTableDataMaintainHook({
    listLocalKey: LocalStorageKeys.FunTempList,
    defaultLocalKey: LocalStorageKeys.DefaultFunKey,
    defaultList: [{ key: 0, name: '默认模板', content: defaultTemplate }]
  })

  const FunTempListKeyMap: { [PropName: number]: TableDataType } = {};
  FunTempList.map(item => FunTempListKeyMap[item.key] = item);

  const [insertBodyChecked, setInsertBodyChecked] = useState(false);
  const [insertResultChecked, setInsertResultChecked] = useState(false);
  const [onlyInsertResultType, setOnlyInsertResultType] = useState(false);
  const [isRestfulMode, setIsRestfulMode] = useState(Boolean(restfulParams.length))
  const [insertQueryChecked, setInsertQueryChecked] = useState(queryFilterParams.length <= 3);


  const getResultType = (): string => {
    // 最外层是数组的情况下，接口名和类型尾要带上“[]”
    let arrSymbol = resultParamJsonType === 1 ? '[]' : '';
    if (onlyInsertResultType) {
      const { paramType } = resultFilterParams[0];
      return ParamTypeMap[paramType] + (paramType === '12' ? '[]' : '')
    }
    let name = insertResultChecked ? getInsertParamsString(resultFilterParams) : resultInterfaceName;
    return name + arrSymbol;
  }

  const getParamsType = (): string => {
    // 最外层是数组的情况下，接口名和类型尾要带上“[]”
    let arrSymbol = baseInfo.apiRequestParamJsonType === 1 ? '[]' : '';
    let name = insertBodyChecked ? getInsertParamsString(bodyFilterParams) : bodyInterfaceName
    return name + arrSymbol;
  }

  return (
    <>
      <Collapse defaultActiveKey={['1']}>
        <Panel
          collapsible="icon"
          header={
            <div className='space-between'>
              调用方法
              <Button type='link' onClick={() => setFunTempModal(true)}>配置调用方法模板</Button>
            </div>
          }
          key="1">
          <Space size={12}>
            <Space size={0}>
              <span>模板：</span>
              <Select
                size="small"
                value={selectedFunTemp}
                onChange={(v) => setSelectedFunTemp(v)}
                options={FunTempList.map((item) => ({ value: item.key, label: item.name }))}
              />
            </Space>
            <Checkbox checked={insertQueryChecked} onChange={() => setInsertQueryChecked(!insertQueryChecked)}>
              将query参数直接插入模板
            </Checkbox>
            <Checkbox checked={insertBodyChecked} onChange={() => setInsertBodyChecked(!insertBodyChecked)}>
              将body参数直接插入模板
            </Checkbox>
            <Checkbox checked={insertResultChecked} onChange={() => setInsertResultChecked(!insertResultChecked)}>
              将返回参数直接插入模板
            </Checkbox>
            {
              resultFilterParams?.length === 1 && !resultFilterParams[0].childList?.length ?
                <Tooltip
                  title="当且仅当返回参数个数和深度都为1时可用！">
                  <Checkbox
                    checked={onlyInsertResultType}
                    onChange={() => setOnlyInsertResultType(!onlyInsertResultType)}>
                    直接插入返回参数类型
                  </Checkbox>
                </Tooltip>
                : ''
            }
            {
              restfulParams.length ?
                <Checkbox checked={isRestfulMode} onChange={() => setIsRestfulMode(!isRestfulMode)}>
                  以restful模式插入接口URL
                </Checkbox>
                : ''
            }
          </Space>
          <div ref={parentRef} className='code'>
            <pre>
              {
                replaceFunTemplate({
                  url: isRestfulMode ? baseInfo.apiURI.replace(/\{/g, '${') : baseInfo.apiURI,
                  restfulParams: getRestfulParamsString(restfulParams),
                  queryParams: insertQueryChecked ? getInsertParamsString(queryFilterParams) : queryInterfaceName,
                  params: getParamsType(),
                  resultType: getResultType(),
                  method: RequestTypeMap[String(baseInfo.apiRequestType)].toLocaleLowerCase(),
                  functionName: defaultNameFun(baseInfo.apiURI, baseInfo),
                }, FunTempListKeyMap[selectedFunTemp].content)
              }
            </pre>
          </div>
          <br />
          <Button
            type="primary"
            onClick={() => structureCopy([(parentRef as DivRef)?.current])} >
            复制
          </Button>
        </Panel>
      </Collapse>

      <FunTemplateModal
        defaultFunKey={defaultFunKey}
        list={FunTempList}
        isOpen={openFunTempModal}
        onUpdate={updateFunTempListHandler}
        onCancel={() => setFunTempModal(false)} />
    </>
  )
}







export default forwardRef(ApiFunctionCollapse);