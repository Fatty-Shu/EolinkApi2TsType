import type { ParamItem } from '../model';
import { ParamTypeMap, InterfaceType} from '../model';
import { forwardRef } from 'react';


type LineType = React.FC<{ attr: ParamItem, interfaceKey?: string, required?: boolean }>
const Line: LineType = ({ attr, interfaceKey, required }) => {
  return (
    <>
      &nbsp;&nbsp;&nbsp;&nbsp;
      <span className={"key"}>
        {attr.paramKey}{required && attr.paramNotNull === '1' ? <span className={"optional-symbol"}>?</span> : ''}
      </span>:&nbsp;
      <span className={"keyword"}>{interfaceKey ? interfaceKey : ParamTypeMap[attr.paramType]}</span>;
      {attr.paramName ? <span className={"comment"}>&nbsp;&nbsp;// {attr.paramName}</span> : ''}
      <br />
    </>
  )
}
type PanelContentType =  React.ForwardRefRenderFunction<HTMLDivElement, { attrs: ParamItem[], required?: boolean, interfaceName?: string }> 
const PanelContent: PanelContentType = ({ attrs, required, interfaceName }, parentRef) => {
  return (
    <div ref={parentRef}>
      {
        attrs
          .filter(({ paramType, childList }) => InterfaceType[paramType] && childList?.length)
          .map(attr => {
            const subInterfaceName = attr.paramKey.replace(/^\w/, (v) => v.toUpperCase());
            return <ForwardRefPanelContent attrs={attr.childList} required={required} interfaceName={subInterfaceName} key={attr.paramKey} />
          })
      }
      <p>
        {interfaceName ? <> <span className='keyword'> interface</span> {interfaceName} </> : ''}
        <span className="brackets">{'{'}</span><br />
        {
          attrs.map(attr => {
            const subInterfaceName = attr.paramKey.replace(/^\w/, (v) => v.toUpperCase());
            if (InterfaceType[attr.paramType] && attr.childList?.length) {
              return <Line attr={attr} required={required} interfaceKey={`${subInterfaceName}${attr.paramType === '12' ? '[]' : ''}`} key={attr.paramKey} />
            }
            return <Line attr={attr} required={required} key={attr.paramKey} />
          })
        }
        <span className="brackets">{'}'}</span>
      </p>
    </div>
  )
}

const ForwardRefPanelContent = forwardRef(PanelContent)

export default ForwardRefPanelContent;