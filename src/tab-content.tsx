import type { ApiDataType, ParamItem, UnionParamItem } from './model';
import { useState, useRef } from 'react';
import { structureCopy, paramsListRecursion, defaultNameFun } from './utils';
import { Card, Tabs, Button, Space, Cascader } from 'antd';
import { useParamsFilterHooks } from './hooks/params-filter';
import ParamsCollapse from './components/params-collapse';
import ApiFunctionCollapse from './components/api-function-collapse';


const FilterKeyCascaderFieldNames = { label: 'paramKey', value: 'paramKey', children: 'childList' }

export const TabContent: React.FC<{ apiData: ApiDataType }> = ({ apiData }) => {
  const { apiInfo: { baseInfo, requestInfo, dataStructureList, restfulParam, urlParam, resultInfo } } = apiData
  const [activeKey, setActiveKey] = useState('0')
  const restfulParamRef = useRef<HTMLDivElement>(null)
  const urlParamRef = useRef<HTMLDivElement>(null)
  const requestInfoRef = useRef<HTMLDivElement>(null)
  const resultInfoRef = useRef<HTMLDivElement>(null)
  const apiFunTemplateRef = useRef<HTMLDivElement>(null)
  const queryParamsName = defaultNameFun(baseInfo.apiURI, baseInfo) + 'QueryParams';



  const getParams = (list: UnionParamItem[]): ParamItem[] => {
    return paramsListRecursion(list, dataStructureList);
  }

  const {
    filterKeys: resultFilterKeys,
    setFilterKeys: setResultFilterKeys,
    filteredParams: resultFilterParams,
    interfaceName: resultInterfaceName,
  } = useParamsFilterHooks({
    apiData,
    paramList: getParams(resultInfo[Number(activeKey)]?.paramList),
    suffix: 'Result',
  })

  const {
    filterKeys: bodyFilterKeys,
    setFilterKeys: setBodyFilterKeys,
    filteredParams: bodyFilterParams,
    interfaceName: bodyInterfaceName,
  } = useParamsFilterHooks({
    apiData,
    paramList: getParams(requestInfo),
    suffix: 'BodyParams',
  })

  
  const urlParamList = getParams(urlParam || []);

  return (
    <Card
      title={`${baseInfo.apiName}(${baseInfo.apiURI})`}
      extra={
        <Button
          type="primary"
          onClick={
            () => structureCopy([
              restfulParamRef.current,
              urlParamRef.current,
              requestInfoRef.current,
              resultInfoRef.current,
              apiFunTemplateRef.current,
            ])
          }
        >
          复制全部
        </Button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <ApiFunctionCollapse
          ref={apiFunTemplateRef}
          apiData={apiData}
          restfulParams={restfulParam}
          bodyInfos={[bodyInterfaceName, bodyFilterParams]}
          queryInfos={[queryParamsName, urlParamList]}
          resultInfos={[resultInterfaceName, resultFilterParams]}
        />
        {
          restfulParam?.length ?
            <ParamsCollapse
              ref={restfulParamRef}
              header="REST 参数"
              attrs={getParams(restfulParam)}
              interfaceName={'RestfulParam'}
            />
            : ''
        }

        {
          urlParam?.length ?
            <ParamsCollapse
              ref={urlParamRef}
              header="Query 请求参数"
              attrs={urlParamList}
              interfaceName={queryParamsName}
            />
            : ''
        }

        {
          requestInfo?.length ?
            <ParamsCollapse
              ref={requestInfoRef}
              header='Body 请求参数'
              attrs={bodyFilterParams}
              interfaceName={bodyInterfaceName}
              slots={
                <Space size={0}>
                  <span>解析属性：</span>
                  <Cascader
                    size="small"
                    multiple
                    maxTagCount="responsive"
                    value={bodyFilterKeys}
                    onChange={(v) => setBodyFilterKeys(v as string[][])}
                    fieldNames={FilterKeyCascaderFieldNames}
                    options={getParams(requestInfo)}
                  />
                </Space>
              }
            />

            : ''
        }

        {
          resultInfo?.length ?
            <ParamsCollapse
              ref={resultInfoRef}
              header="返回参数"
              attrs={resultFilterParams}
              interfaceName={resultInterfaceName}
              slots=
              {<>
                {
                  resultInfo?.length > 1 ? <Tabs
                    activeKey={activeKey}
                    onChange={setActiveKey}
                    tabBarGutter={50}
                    items={resultInfo.map((result, idx) => {
                      return {
                        label: `${result.isDefault ? '[默认]' : ''} ${result.responseName} (${result.responseCode})`,
                        key: idx + '',
                        closable: true,
                      };
                    })}
                  /> : ''
                }
                <Space size={12}>
                  <Space size={0}>
                    <span>解析属性：</span>
                    <Cascader
                      size="small"
                      multiple
                      maxTagCount="responsive"
                      value={resultFilterKeys}
                      onChange={(v) => setResultFilterKeys(v as string[][])}
                      fieldNames={FilterKeyCascaderFieldNames}
                      options={getParams(resultInfo[Number(activeKey)]?.paramList || [])}
                    />
                  </Space>
                </Space>
              </>
              }
            />
            : ''
        }

      </div>
    </Card>
  )
}