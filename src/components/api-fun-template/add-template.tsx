import type { FormInstance } from 'antd/es/form';
import type { TableDataType } from '../../model';
import { LocalStorageKeys } from '../../model';
import { useRef, useEffect } from 'react';
import { Modal, Form, Input, Typography, Popover, message } from 'antd';
import { getStorageItem } from '../../utils';

interface ModalProps {
  editItem: TableDataType;
  isOpen: boolean;
  onUpdate: () => void;
  onCancel: () => void;
}
export const defaultTemplate = `export function [functionName](data: [params]) {
  return http.[method]('[url]', data);
}`
const TextareaPlaceholder = `模板是一个带占位符的字符串，点位符会替换为相应的内容。点位符号如下：
  [functionName]  方法名称(通过方法名生成函数控制)；
  [restfulParams] restful接口入参；
  [queryParams]   接口URl入参
  [params]        body入参接口名称或类型字符串；
  [method]        接口请求方法(默认小写)；
  [url]           接口路径
  [resultType]    返回参数接口名称
`
const AddFunTemplateModal: React.FC<ModalProps> = (props) => {
  const { isOpen, onUpdate, onCancel, editItem } = props;
  const formRef = useRef<FormInstance>(null);
  const onOkHandler = () => {
    return new Promise((resolve, reject) => {
      formRef.current?.validateFields()
        .then(({ errorFields, name, content }) => {
          if (errorFields && errorFields.length) return reject();
          const localFunTempList = getStorageItem<TableDataType[]>(LocalStorageKeys.FunTempList) || [];
          if (editItem?.key) {
            let idx = localFunTempList.findIndex(item => item.key === editItem.key);
            localFunTempList.splice(idx, 1, {
              key: editItem.key,
              name,
              content,
            })
          } else {
            localFunTempList.push({
              key: new Date().getTime(),
              name,
              content,
            });
          }
          localStorage.setItem(LocalStorageKeys.FunTempList, JSON.stringify(localFunTempList));
          onUpdate();
          message.success(editItem?.key ? '修改模板成功' : '添加模板成功！')
          resolve(true)
        })
    })
  }

  useEffect(() => {
    editItem?.key
      ? formRef.current?.setFieldsValue({ 'name': editItem.name, content: editItem.content })
      : formRef.current?.resetFields();
  })

  return (
    <Modal
      title={`${editItem?.key ? '编辑' : '新增'}调用方法模板`}
      open={isOpen}
      onOk={onOkHandler}
      onCancel={onCancel}
      okText={editItem?.key ? '保存' : '确认'}
      cancelText="取消"
    >
      <div style={{ marginTop: '24px' }} >
        <Form
          ref={formRef}
          name="basic"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
          style={{ maxWidth: 600 }}
          autoComplete="off"
        >
          <Form.Item
            label="模板名称"
            name="name"
            rules={[{ required: true, message: '请填写模板名称！' }]}
          >
            <Input placeholder='请填写模板名称' />
          </Form.Item>

          <Form.Item
            label="模板"
            name="content"
            rules={[{ required: true, message: '请填写模板内容！' }]}
          >
            <Input.TextArea
              autoSize={{ minRows: 8, maxRows: 16 }}
              placeholder={TextareaPlaceholder}
            />
          </Form.Item>
          <Form.Item label=" " colon={false}>
            <Popover content={<pre>{TextareaPlaceholder}</pre>}>
              <Typography.Link >模板说明</Typography.Link>
            </Popover>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  )
}

export default AddFunTemplateModal;