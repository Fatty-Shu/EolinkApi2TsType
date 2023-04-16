import type { ApiDataType } from './model';

import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Tabs, Empty } from 'antd';
import { TabContent } from './tab-content';
import 'antd/dist/reset.css';


// TODO: 需要考虑出参最外层是数组的情况

interface State {
  activeKey: string;
  apiObj: { [key: string]: ApiDataType };
  keys: string[];
}

let updateState;
let scopeState: State = {
  activeKey: '',
  apiObj: {},
  keys: [],
};
function App() {
  const [state, setState] = useState<State>({
    activeKey: '',
    apiObj: {},
    keys: [],
  });
  const { apiObj, activeKey, keys } = state;
  updateState = setState.bind(this);
  scopeState = state;

  const remove = (targetKey) => {
    const newApiObj = apiObj;
    delete newApiObj[targetKey];
    setState({
      apiObj: newApiObj,
      activeKey: activeKey === targetKey ? Object.keys(newApiObj)?.[0] : activeKey,
      keys: keys.splice(keys.findIndex(key => key === targetKey), 1)
    })
  }

  return (
    <>
      {
        keys.length ?
          <div className='container'>
            <Tabs
              hideAdd={true}
              type="editable-card"
              activeKey={activeKey}
              onChange={(activeKey) => setState({ apiObj, activeKey, keys })}
              onEdit={remove}
              items={keys.map((key) => {
                return {
                  label: apiObj[key]?.apiInfo?.baseInfo?.apiName,
                  key,
                  closable: true,
                };
              })}
            />
            <TabContent apiData={apiObj[activeKey]} key={activeKey} />
          </div>
          : <Empty style={{ margin: '12px' }} description={'请打开Eolink网页页面，点击接口(如已打开，刷新当前Eolink页面即可)，接口页面加载完毕后将自动解析。'} />
      }
    </>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);

window.addEventListener('message', (event) => {
  if (event.data === 'init') {
    return true;
  }
  if (!event.data?.isEolinkData) {
    return false;
  }

  if (!event.data) return false;
  const keys = Object.keys(event.data?.apiData || {})
  scopeState.keys.push(...keys);
  updateState && updateState({ ...scopeState, activeKey: keys[0], apiObj: { ...scopeState.apiObj, ...event.data?.apiData } })
})
