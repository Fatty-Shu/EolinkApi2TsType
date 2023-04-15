import type {  TableDataType } from '../model';
import { useState } from 'react';
import { getStorageItem } from '../utils'

interface TableDataMaintainHookOpts {
  listLocalKey: string;
  defaultLocalKey: string;
  defaultList: TableDataType[];
}
interface TableDataMaintainHookReturn {
  defaultKey: number;
  selected: number;
  list: TableDataType[];
  setSelected: (key: number) => void;
  updateHandler: () => void;
}



/**
 * 一个维护(更新、设置默认)本地表格(key,name,content)数据的hooks
 * @param opts TableDataMaintainHookOpts
 * @returns 
 */
export function useTableDataMaintainHook(opts: TableDataMaintainHookOpts): TableDataMaintainHookReturn {
  const { listLocalKey, defaultLocalKey, defaultList } = opts;
  const localList = getStorageItem<TableDataType[]>(listLocalKey);
  const localDefaultKey = Number(localStorage.getItem(defaultLocalKey));
  const [defaultKey, setDefaultKey] = useState(localDefaultKey || 0);
  const [selected, setSelected] = useState(defaultKey);
  const [list, setList] = useState<TableDataType[]>([
    ...defaultList,
    ...(localList || []),
  ]);

  const updateHandler = () => {
    const newLocalList = getStorageItem<TableDataType[]>(listLocalKey);
    const newDefaultKey = Number(localStorage.getItem(defaultLocalKey))
    setList([
      ...defaultList,
      ...(newLocalList || []),
    ])
    if (newDefaultKey !== undefined && newDefaultKey !== defaultKey) {
      setDefaultKey(newDefaultKey);
      setSelected(newDefaultKey)
    }

  }



  return {
    defaultKey,
    list,
    selected,
    setSelected,
    updateHandler
  }
}



