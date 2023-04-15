import type { ColumnsType } from 'antd/es/table';
import type { TableDataType } from '../../model';
import { useState } from 'react';
import { Button, Space, Modal, Table, Tag, Popconfirm, Tooltip, message } from 'antd';
import { getStorageItem } from '../../utils';
import { LocalStorageKeys } from '../../model';
import AddFunTemplateModal from './add-template';



interface OperationCellProps {
  record: TableDataType;
  defaultFunKey: number;
  onUpdate: () => void;
  onEdit:()=>void;
}

const OperationCell: React.FC<OperationCellProps> = (props) => {
  const { record, onUpdate,onEdit, defaultFunKey } = props;
  const confirmDelete = () => {
    const localFunTempList = getStorageItem<TableDataType[]>(LocalStorageKeys.FunTempList) || [];
    const idx = localFunTempList.findIndex(v => v.key === record.key);
    localFunTempList.splice(idx, 1);
    localStorage.setItem(LocalStorageKeys.FunTempList, JSON.stringify(localFunTempList));
    onUpdate();
  }
  const setDefault = ()=>{
    localStorage.setItem(LocalStorageKeys.DefaultFunKey, String(record.key));
    onUpdate();
    message.success('设置成功！')
  }
  return (
    <Space>
      {record.key !== 0 ?
        <Button type='link' onClick={onEdit}>编辑</Button> :
        <Tooltip title="默认模板不可编辑">
          <Button type='link' disabled >编辑</Button>
        </Tooltip>
      }
      {defaultFunKey !== record.key ? <Button type='link' onClick={setDefault}>设为默认</Button> : ''}
      {record.key !== 0 ?
        <Popconfirm
          title="提示"
          description={`确认要模板"${name}"删除吗?`}
          onConfirm={confirmDelete}
        >
          <Button type='link' danger >删除</Button>
        </Popconfirm>
        :
        <Tooltip title="默认模板不可删除">
          <Button type='link' danger disabled >删除</Button>
        </Tooltip>
      }
    </Space>
  )
}

interface FunTempModalProps {
  defaultFunKey: number;
  list: TableDataType[];
  isOpen: boolean;
  onUpdate: () => void;
  onCancel: () => void;
}

export const FunTemplateModal: React.FC<FunTempModalProps> = (props) => {
  const { isOpen, list, onCancel, onUpdate, defaultFunKey } = props;
  const [addModalShow, setAddModalShow] = useState(false);
  const [editItem, setEditItem] = useState<TableDataType>();

  const addOkHandler = () => {
    setAddModalShow(false);
    onUpdate();
  }

  const editHandler = (item: TableDataType)=>{
    setAddModalShow(true);
    setEditItem(item)
  }

  const addButtonHandler = ()=>{
    setAddModalShow(true)
    setEditItem(null)
  }

  const FunModalColumns: ColumnsType<TableDataType> = [
    {
      title: '模板名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, { key }) => (
        <Space>
          {text}
          {defaultFunKey === key ? <Tag color='cyan'>默认</Tag> : ''}
        </Space>
      ),
    },
    {
      title: '模板内容',
      dataIndex: 'content',
      key: 'content',
      render: (text) => <div style={{ wordBreak: 'break-all' }}>{text}</div>,
    },
    {
      title: '操作',
      dataIndex: 'operation',
      render: (...args) => <OperationCell 
                              record={args[1]} 
                              onUpdate={onUpdate} 
                              defaultFunKey={defaultFunKey}
                              onEdit={()=>editHandler(args[1])}  />,
    }
  ]



  return (
    <>
      <Modal
        title="调用方法模板管理"
        open={isOpen}
        footer={false}
        onCancel={onCancel}
        width="85%"
      >
        <Space direction='vertical' style={{ display: 'flex' }} >
          <Space style={{ display: 'flex', justifyContent: 'flex-end' }} >
            <Button type="primary" onClick={addButtonHandler}>添加模板</Button>
          </Space>
          <Table
            columns={FunModalColumns}
            dataSource={list}
            bordered={true}
            pagination={false} />
        </Space>
      </Modal>
      <AddFunTemplateModal
        editItem={editItem}
        isOpen={addModalShow}
        onUpdate={addOkHandler}
        onCancel={() => setAddModalShow(false)}
      />
    </>
  )
}