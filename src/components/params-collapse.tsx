

import type { ParamItem } from '../model';
import { forwardRef } from 'react';
import { Collapse, Button } from 'antd';
import PanelContent from './panel-content';
import { structureCopy } from '../utils';

const { Panel } = Collapse;

interface Props {
  attrs: ParamItem[],
  header: string | React.ReactNode;
  interfaceName: string;
  slots?: React.ReactNode | '';
}
type DivRef = React.MutableRefObject<HTMLDivElement>
type ParamsCollapseType = React.ForwardRefRenderFunction<HTMLDivElement, Props>;

const ParamsCollapse: ParamsCollapseType = (props, parentRef) => {

  const { attrs, header, interfaceName, slots } = props;
  return <Collapse collapsible="icon" defaultActiveKey={['1']}>
    <Panel header={header} key="1">
      {slots}
      <PanelContent
        ref={parentRef}
        attrs={attrs}
        interfaceName={interfaceName}
        required={true}
      />
      <Button type="primary" onClick={() => structureCopy([(parentRef as DivRef)?.current])} >复制</Button>
    </Panel>
  </Collapse>
}

export default forwardRef(ParamsCollapse);