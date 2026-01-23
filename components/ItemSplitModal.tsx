
import React, { useState } from 'react';
import { X, Search, Plus, Info, ChevronDown, ChevronRight, Link, Edit2, Trash2, ArrowUp, ArrowDown, Check, Zap, RotateCcw, FileText, CheckCircle, Database, Settings, Layout, FileCheck, Share2, Save, Link2, Download, FileUp, UploadCloud, FileType, Trash, AlertTriangle, ToggleLeft, ToggleRight, FileX } from 'lucide-react';

interface TableRow {
  id: number;
  infoItem: string;
  isLinked: string; // '是' | '否' | '无需接入' | '请选择'
  resourceDir: string;
  resourceCode?: string;
  selectedField?: string;
  remark: string;
  isEditing?: boolean;
}

interface MaterialConfig {
  id: string;
  name: string;
  fieldsText: string;
  isLinked: string;
  accessMethod: string;
  remark: string;
}

interface ItemSplitModalProps {
  onClose: () => void;
}

const ItemSplitModal: React.FC<ItemSplitModalProps> = ({ onClose }) => {
  // --- 状态定义 ---
  const [selectedTreeId, setSelectedTreeId] = useState('form-info');
  const [inputExpanded, setInputExpanded] = useState(true);
  const [outputExpanded, setOutputExpanded] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // 控制表单信息拆分是否存在的状态：'unset' (初始未选) | 'yes' (确定有) | 'no' (确定无)
  const [hasFormInfo, setHasFormInfo] = useState<'unset' | 'yes' | 'no'>('unset');

  // 1. 表单信息拆分数据
  const [formTableData, setFormTableData] = useState<TableRow[]>([
    { id: 1, infoItem: '姓名', isLinked: '是', resourceDir: '自然人基础信息查询接口', resourceCode: '370001', selectedField: '姓名', remark: '--' },
    { id: 2, infoItem: '照片', isLinked: '否', resourceDir: '--', remark: '电子证照中获取' },
    { id: 3, infoItem: '结婚证号', isLinked: '是', resourceDir: '婚姻登记状态查询接口', resourceCode: '370005', selectedField: '婚姻状态', remark: '--' },
  ]);

  // 2. 办理结果拆分数据
  const [resultTableData, setResultTableData] = useState<TableRow[]>([
    { id: 101, infoItem: '批准决定书编号', isLinked: '是', resourceDir: '审批结果公示库', resourceCode: '99002', selectedField: '编号', remark: '' },
  ]);

  // 批量选择状态
  const [selectedRowIds, setSelectedRowIds] = useState<number[]>([]);

  // 3. 其他申报材料整体配置数据
  const [materialsConfigs, setMaterialsConfigs] = useState<Record<string, MaterialConfig>>({
    'in-1': { id: 'in-1', name: '居民户口搏', fieldsText: '户主姓名、户口簿首页、出生日期、身份证号码、户籍地址、与户主关系', isLinked: '是', accessMethod: '电子证照回流', remark: '' },
    'in-2': { id: 'in-2', name: '身份证', fieldsText: '姓名、性别、民族、出生日期、住址、公民身份号码、签发机关、有效期限', isLinked: '是', accessMethod: '电子证照回流', remark: '读取正反面信息' },
    'in-3': { id: 'in-3', name: '延长参保缴费年限申请表', fieldsText: '', isLinked: '否', accessMethod: '', remark: '' },
  });

  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [isSmartMode, setIsSmartMode] = useState(false); 
  const [currentRowId, setCurrentRowId] = useState<number | null>(null);

  // --- 操作函数 ---

  const toggleSelectAll = (data: TableRow[]) => {
    if (selectedRowIds.length === data.length) {
      setSelectedRowIds([]);
    } else {
      setSelectedRowIds(data.map(r => r.id));
    }
  };

  const toggleSelectRow = (id: number) => {
    setSelectedRowIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBatchDelete = (data: TableRow[], setData: React.Dispatch<React.SetStateAction<TableRow[]>>) => {
    if (selectedRowIds.length === 0) return;
    if (window.confirm(`确认删除选中的 ${selectedRowIds.length} 条记录吗？`)) {
      setData(data.filter(r => !selectedRowIds.includes(r.id)));
      setSelectedRowIds([]);
    }
  };

  const handleBatchUpdateStatus = (data: TableRow[], setData: React.Dispatch<React.SetStateAction<TableRow[]>>, status: string) => {
    if (selectedRowIds.length === 0) return;
    setData(data.map(r => selectedRowIds.includes(r.id) ? { ...r, isLinked: status } : r));
    setSelectedRowIds([]);
  };

  const handleBatchEdit = (data: TableRow[], setData: React.Dispatch<React.SetStateAction<TableRow[]>>) => {
    if (selectedRowIds.length === 0) return;
    setData(data.map(r => selectedRowIds.includes(r.id) ? { ...r, isEditing: true } : r));
  };

  const moveRow = (data: TableRow[], setData: React.Dispatch<React.SetStateAction<TableRow[]>>, index: number, direction: 'up' | 'down') => {
    const newData = [...data];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newData.length) {
      [newData[index], newData[targetIndex]] = [newData[targetIndex], newData[index]];
      setData(newData);
    }
  };

  const addNewField = (setData: React.Dispatch<React.SetStateAction<TableRow[]>>) => {
    setData(prev => [...prev, {
      id: Date.now(),
      infoItem: '',
      isLinked: '请选择',
      resourceDir: '--',
      remark: '',
      isEditing: true
    }]);
  };

  const updateRowField = (data: TableRow[], setData: React.Dispatch<React.SetStateAction<TableRow[]>>, id: number, field: keyof TableRow, value: any) => {
    setData(data.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const saveRow = (data: TableRow[], setData: React.Dispatch<React.SetStateAction<TableRow[]>>, id: number) => {
    setData(data.map(r => r.id === id ? { ...r, isEditing: false } : r));
  };

  const handleSmartMatch = (dirName: string, fields: string[]) => {
    const currentData = selectedTreeId === 'form-info' ? formTableData : resultTableData;
    const setData = selectedTreeId === 'form-info' ? setFormTableData : setResultTableData;

    const newData = currentData.map(row => {
      const matchedField = fields.find(f => f === row.infoItem);
      if (matchedField) {
        return {
          ...row,
          isLinked: '是',
          resourceDir: dirName,
          selectedField: matchedField
        };
      }
      return row;
    });

    setData(newData);
    setIsResourceModalOpen(false);
  };

  const handleHasFormInfoChange = (val: 'yes' | 'no') => {
    if (val === 'no' && hasFormInfo === 'yes' && formTableData.length > 0) {
      if (!window.confirm("切换为“无表单信息”将导致当前已配置的表单拆分信息项数据被清除覆盖，是否继续？")) {
        return;
      }
      setFormTableData([]);
      setSelectedRowIds([]);
    }
    setHasFormInfo(val);
  };

  // --- 视图渲染 ---

  const renderSplitTableView = (data: TableRow[], setData: React.Dispatch<React.SetStateAction<TableRow[]>>, title: string, isFormInfoView: boolean = false) => {
    
    if (isFormInfoView && hasFormInfo === 'unset') {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-10 bg-white space-y-12 animate-in zoom-in-95 duration-300">
          <div className="flex flex-col items-center gap-4">
             <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center text-blue-600 shadow-sm">
                <Layout size={40} />
             </div>
             <div className="text-center space-y-2">
                <h3 className="text-2xl font-black text-gray-800">该事项是否有表单信息？</h3>
                <p className="text-sm text-gray-400 font-medium max-w-lg">选择“是”后，您可以对在线申报表单中的每一个字段进行精细化拆分与数据关联。</p>
             </div>
          </div>
          <div className="flex gap-8 w-full max-w-2xl h-64">
            <button onClick={() => handleHasFormInfoChange('yes')} className="flex-1 bg-white border-2 border-gray-100 rounded-3xl flex flex-col items-center justify-center gap-5 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-50 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <CheckCircle size={28} />
              </div>
              <div className="text-center">
                 <span className="block font-black text-lg text-gray-600 group-hover:text-blue-600">是，包含表单信息</span>
                 <span className="text-xs text-gray-400 font-medium mt-1 group-hover:text-blue-400">需要对字段进行逐项拆分</span>
              </div>
            </button>
            <button onClick={() => handleHasFormInfoChange('no')} className="flex-1 bg-white border-2 border-gray-100 rounded-3xl flex flex-col items-center justify-center gap-5 hover:border-gray-800 hover:shadow-xl hover:shadow-gray-50 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-gray-800 group-hover:text-white transition-all">
                <FileX size={28} />
              </div>
              <div className="text-center">
                 <span className="block font-black text-lg text-gray-600 group-hover:text-gray-800">否，无表单信息</span>
                 <span className="text-xs text-gray-400 font-medium mt-1 group-hover:text-gray-500">此事项无需进行字段拆分</span>
              </div>
            </button>
          </div>
        </div>
      );
    }

    if (isFormInfoView && hasFormInfo === 'no') {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-10 bg-white space-y-8 animate-in fade-in duration-300">
           <div className="flex flex-col items-center gap-5">
              <div className="w-24 h-24 bg-[#fafbfc] rounded-full flex items-center justify-center text-gray-200 border-2 border-dashed border-gray-100">
                 <Database size={48} />
              </div>
              <div className="text-center">
                 <p className="text-xl font-black text-gray-700">无需拆分关联</p>
                 <p className="text-sm text-gray-400 font-medium mt-2">当前已设置此事项无表单字段信息，系统默认无需进行字段级接入。</p>
              </div>
           </div>
           <button onClick={() => handleHasFormInfoChange('yes')} className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-2xl text-sm font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95">
             <RotateCcw size={18} /> 重新启用表单拆分
           </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col flex-1 overflow-hidden p-6 bg-white animate-in fade-in duration-300">
        <div className="w-full bg-[#f0f7ff] border border-[#d1e9ff] rounded-md p-3 mb-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white"><Zap size={16} /></div>
            <div className="text-sm">
              <span className="font-bold text-blue-900 mr-2">智能匹配助手</span>
              <span className="text-blue-700 text-xs">选择某个数据资源目录，系统将自动把该目录下包含的信息项与当前列表中的同名项进行关联。</span>
            </div>
          </div>
          <button onClick={() => { setIsResourceModalOpen(true); setIsSmartMode(true); }} className="px-4 py-1.5 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm shadow-blue-100">
             <Link2 size={14} /> 开始智能匹配
          </button>
        </div>

        <div className="flex items-center justify-between mb-4 p-2 bg-gray-50 rounded-lg border border-gray-100">
          <div className={`flex items-center gap-4 ${selectedRowIds.length > 0 ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
            <span className="text-xs font-bold text-gray-500 ml-2">已选 {selectedRowIds.length} 项:</span>
            <div className="flex items-center gap-2">
               <span className="text-[11px] text-gray-400">批量设置接入状态:</span>
               <button onClick={() => handleBatchUpdateStatus(data, setData, '是')} className="px-3 py-1 bg-white border border-gray-200 rounded text-[11px] hover:border-blue-500 hover:text-blue-600 font-bold transition-colors shadow-sm">是</button>
               <button onClick={() => handleBatchUpdateStatus(data, setData, '否')} className="px-3 py-1 bg-white border border-gray-200 rounded text-[11px] hover:border-blue-500 hover:text-blue-600 font-bold transition-colors shadow-sm">否</button>
               <button onClick={() => handleBatchUpdateStatus(data, setData, '无需接入')} className="px-3 py-1 bg-white border border-gray-200 rounded text-[11px] hover:border-blue-500 hover:text-blue-600 font-bold transition-colors shadow-sm">无需接入</button>
            </div>
            <div className="w-px h-4 bg-gray-200 mx-2"></div>
            <button onClick={() => handleBatchEdit(data, setData)} className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-200 rounded text-[11px] hover:border-blue-500 hover:text-blue-600 font-bold transition-colors shadow-sm">
              <Edit2 size={12}/> 批量编辑
            </button>
            <button onClick={() => handleBatchDelete(data, setData)} className="flex items-center gap-1 px-3 py-1 bg-white border border-red-100 text-red-500 rounded text-[11px] hover:bg-red-50 font-bold transition-colors shadow-sm">
              <Trash2 size={12}/> 批量删除
            </button>
          </div>

          {isFormInfoView && (
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2 px-3 py-1 bg-orange-50/30 rounded-lg text-[10px] text-orange-600 font-bold border border-orange-100/20">
                  <AlertTriangle size={12} className="text-orange-400" />
                  状态切换将覆盖当前列表
               </div>
               <button onClick={() => handleHasFormInfoChange('no')} className="flex items-center gap-2 px-4 py-1.5 bg-white border border-red-100 text-red-500 rounded-lg text-xs font-black hover:bg-red-50 transition-all shadow-sm">
                  <FileX size={14} /> 切换为无需拆分状态
               </button>
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-gray-100">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-[#f9fafc] text-gray-400 font-bold border-b border-gray-100 uppercase text-[11px] tracking-tight sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-4 text-center w-12">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300" checked={data.length > 0 && selectedRowIds.length === data.length} onChange={() => toggleSelectAll(data)} />
                  </th>
                  <th className="px-4 py-4 text-center w-14">序号</th>
                  <th className="px-4 py-4 w-60"><span className="text-red-500 mr-1">*</span>信息项名称</th>
                  <th className="px-4 py-4 w-32">接入状态</th>
                  <th className="px-4 py-4">关联资源目录 / 字段</th>
                  <th className="px-4 py-4 w-48">备注说明</th>
                  <th className="px-4 py-4 text-center w-56">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.map((row, idx) => (
                  <tr key={row.id} className={`hover:bg-blue-50/5 group transition-colors ${selectedRowIds.includes(row.id) ? 'bg-blue-50/20' : ''}`}>
                    <td className="px-4 py-4 text-center">
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300" checked={selectedRowIds.includes(row.id)} onChange={() => toggleSelectRow(row.id)} />
                    </td>
                    <td className="px-4 py-5 text-center text-gray-400 font-mono text-xs">{idx + 1}</td>
                    <td className="px-4 py-4">
                      {row.isEditing ? (
                        <input className="w-full border border-blue-400 rounded-md px-3 py-1.5 text-sm outline-none" value={row.infoItem} onChange={(e) => updateRowField(data, setData, row.id, 'infoItem', e.target.value)} />
                      ) : <span className="font-bold text-gray-800">{row.infoItem || '--'}</span>}
                    </td>
                    <td className="px-4 py-4">
                      {row.isEditing ? (
                        <select className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-sm bg-white" value={row.isLinked} onChange={(e) => updateRowField(data, setData, row.id, 'isLinked', e.target.value)}>
                          <option value="请选择" disabled>请选择</option>
                          <option value="是">是</option>
                          <option value="否">否</option>
                          <option value="无需接入">无需接入</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${row.isLinked === '是' ? 'bg-green-100 text-green-700' : row.isLinked === '无需接入' ? 'bg-gray-100 text-gray-500' : 'bg-orange-100 text-orange-700'}`}>{row.isLinked}</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="text-[11px] flex-1 truncate">
                          <div className="text-gray-700 font-medium">{row.resourceDir}</div>
                          {row.selectedField && <div className="text-blue-600 font-bold">字段: {row.selectedField}</div>}
                        </div>
                        {row.isEditing && (
                          <button onClick={() => { setIsResourceModalOpen(true); setCurrentRowId(row.id); setIsSmartMode(false); }} className="flex items-center gap-1 px-3 py-1 border border-blue-100 text-blue-600 rounded-md text-xs font-bold hover:bg-blue-50 shadow-sm"><Link2 size={12} /> 关联</button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs italic text-gray-400">{row.remark || '--'}</td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-4">
                        {row.isEditing ? <button onClick={() => saveRow(data, setData, row.id)} className="text-white bg-blue-600 px-4 py-1.5 rounded-md text-xs font-bold"><Check size={14}/>保存</button> : <button onClick={() => updateRowField(data, setData, row.id, 'isEditing', true)} className="text-blue-500 text-xs font-bold">编辑</button>}
                        <button onClick={() => setData(data.filter(r => r.id !== row.id))} className="text-blue-500 hover:text-red-500 text-xs font-bold">删除</button>
                        <button onClick={() => moveRow(data, setData, idx, 'up')} disabled={idx === 0} className="p-1 text-gray-300 hover:text-blue-500 disabled:opacity-20"><ArrowUp size={16}/></button>
                        <button onClick={() => moveRow(data, setData, idx, 'down')} disabled={idx === data.length - 1} className="p-1 text-gray-300 hover:text-blue-500 disabled:opacity-20"><ArrowDown size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-8 mb-4">
            <button onClick={() => addNewField(setData)} className="w-full flex items-center justify-center gap-2 py-5 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/20 transition-all font-bold text-sm shadow-sm">
              <Plus size={18} /> 直接新增一条信息项数据
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderMaterialConfigView = (id: string) => {
    const config = materialsConfigs[id];
    if (!config) return null;
    return (
      <div className="flex-1 p-10 bg-white overflow-auto scrollbar-thin scrollbar-thumb-gray-100">
        <div className="mb-10 border-l-4 border-blue-600 pl-5"><h2 className="text-xl font-black text-gray-800 tracking-tight">{config.name} - 整体要素登记</h2></div>
        <div className="max-w-4xl space-y-10">
          <div className="space-y-4"><label className="text-sm font-black text-gray-700 flex items-center gap-2"><span className="text-red-500 text-lg">*</span>申报材料信息项（字段登记）</label>
            <textarea className="w-full border rounded-2xl p-6 text-sm text-gray-700 leading-relaxed min-h-[220px] bg-white border-gray-200" placeholder="请列出关键字段名称..." value={config.fieldsText} onChange={(e) => setMaterialsConfigs({...materialsConfigs, [id]: {...config, fieldsText: e.target.value}})} />
          </div>
          <div className="grid grid-cols-2 gap-10">
            <div className="space-y-4"><label className="text-sm font-black text-gray-700"><span className="text-red-500 text-lg">*</span> 是否实现接入</label>
              <div className="flex gap-4">{['是', '否'].map(opt => <button key={opt} onClick={() => setMaterialsConfigs({...materialsConfigs, [id]: {...config, isLinked: opt}})} className={`flex-1 py-4 rounded-xl border-2 text-sm font-black ${config.isLinked === opt ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-100 text-gray-400'}`}>{opt}</button>)}</div>
            </div>
            <div className="space-y-4"><label className="text-sm font-black text-gray-700">接入方式</label>
              <input type="text" disabled={config.isLinked === '否'} className="w-full border-2 rounded-xl px-5 py-4 text-sm" value={config.accessMethod} onChange={(e) => setMaterialsConfigs({...materialsConfigs, [id]: {...config, accessMethod: e.target.value}})} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white w-[98%] h-[95%] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
        <div className="h-16 px-8 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3"><div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white"><Settings size={18} /></div><h3 className="text-base font-black text-gray-800">政务事项要素精细化管理看板</h3></div>
          <div className="flex items-center gap-4"><button onClick={() => setIsImportModalOpen(true)} className="px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-black"><FileUp size={18} /> 批量导入</button><div className="w-px h-6 bg-gray-100"></div><button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full"><X size={22} /></button></div>
        </div>
        <div className="flex-1 flex overflow-hidden">
          <div className="w-[280px] border-r border-gray-100 flex flex-col bg-[#fdfdfd] shrink-0">
            <div className="p-5 border-b border-gray-100"><div className="relative"><input type="text" placeholder="快速定位材料..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs" /><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} /></div></div>
            <div className="flex-1 overflow-auto p-4 space-y-6 scrollbar-thin">
              <div><div className="flex items-center gap-2 py-2 px-2 cursor-pointer" onClick={() => setInputExpanded(!inputExpanded)}>{inputExpanded ? <ChevronDown size={14} className="text-blue-500" /> : <ChevronRight size={14} />}<span className="text-[11px] font-black text-gray-800 tracking-wider">申报材料信息【输入】</span></div>
                {inputExpanded && <div className="ml-5 border-l border-gray-100 mt-2 space-y-1">
                  <div onClick={() => setSelectedTreeId('form-info')} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer text-xs ml-3 ${selectedTreeId === 'form-info' ? 'bg-blue-600 text-white font-bold' : 'text-gray-500 hover:bg-gray-100'}`}><Layout size={16} /><span>表单信息 (拆分)</span></div>
                  {/* Fixed Type: explicitly casting Object.values to MaterialConfig[] to avoid unknown property errors */}
                  {(Object.values(materialsConfigs) as MaterialConfig[]).map(mat => <div key={mat.id} onClick={() => setSelectedTreeId(mat.id)} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer text-xs ml-3 ${selectedTreeId === mat.id ? 'bg-blue-600 text-white font-bold' : 'text-gray-500 hover:bg-gray-100'}`}><div className={`w-1.5 h-1.5 rounded-full ${mat.fieldsText ? 'bg-green-500' : 'bg-gray-200'}`}></div><span>{mat.name}</span></div>)}
                </div>}
              </div>
              <div><div className="flex items-center gap-2 py-2 px-2 cursor-pointer" onClick={() => setOutputExpanded(!outputExpanded)}>{outputExpanded ? <ChevronDown size={14} className="text-indigo-500" /> : <ChevronRight size={14} />}<span className="text-[11px] font-black text-gray-800 tracking-wider">办理结果信息【输出】</span></div>
                {outputExpanded && <div className="ml-5 border-l border-gray-100 mt-2 space-y-1"><div onClick={() => setSelectedTreeId('output-doc')} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer text-xs ml-3 ${selectedTreeId === 'output-doc' ? 'bg-indigo-600 text-white font-bold' : 'text-gray-500 hover:bg-gray-100'}`}><FileCheck size={16} /><span>结果证明文档 (拆分)</span></div></div>}
              </div>
            </div>
          </div>
          <div className="flex-1 flex flex-col bg-[#fafbfc] overflow-hidden">
             {selectedTreeId === 'form-info' && renderSplitTableView(formTableData, setFormTableData, '表单信息', true)}
             {selectedTreeId === 'output-doc' && renderSplitTableView(resultTableData, setResultTableData, '结果证明文档', false)}
             {(!['form-info', 'output-doc'].includes(selectedTreeId)) && renderMaterialConfigView(selectedTreeId)}
          </div>
        </div>
      </div>
      {isResourceModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-8 backdrop-blur-md">
          <div className="bg-white w-[1000px] max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            <div className="h-16 px-8 border-b flex items-center justify-between shrink-0"><span className="text-lg font-black text-gray-800 flex items-center gap-2"><Database size={20} className="text-blue-600" />{isSmartMode ? '开始智能匹配' : '事项关联数据'}</span><button onClick={() => setIsResourceModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full"><X size={20} /></button></div>
            <div className="p-8 pb-4 space-y-6 shrink-0 bg-[#fafbfc]/50 border-b"><div className="grid grid-cols-3 gap-8"><div className="space-y-2"><label className="text-[11px] font-black text-gray-500">目录编码</label><input type="text" placeholder="输入编码检索" className="w-full border rounded-xl px-4 py-2.5 text-sm" /></div><div className="space-y-2"><label className="text-[11px] font-black text-gray-500">目录名称</label><input type="text" placeholder="输入目录关键字" className="w-full border rounded-xl px-4 py-2.5 text-sm" /></div><div className="space-y-2"><label className="text-[11px] font-black text-gray-500">信息项</label><input type="text" placeholder="输入字段名" className="w-full border rounded-xl px-4 py-2.5 text-sm" /></div></div><div className="flex justify-end gap-3"><button className="bg-blue-600 text-white px-8 py-2 rounded-xl text-sm font-black">查询</button><button className="bg-white border text-gray-500 px-8 py-2 rounded-xl text-sm font-black">重置</button></div></div>
            <div className="flex-1 overflow-auto px-8 pb-8"><table className="w-full text-sm text-left"><thead className="bg-[#f9fafc] text-gray-400 font-bold border-b text-[11px] sticky top-0"><tr><th className="px-4 py-4 w-12">选择</th><th className="px-4 py-4 w-40">目录编码</th><th className="px-4 py-4 w-64">目录名称</th><th className="px-4 py-4">字段项</th></tr></thead><tbody className="divide-y divide-gray-50">
              {[{ code: '3700000220411', name: '自然人基础信息查询接口', fields: ['姓名', '身份证', '性别', '出生年月'] }].map((res, i) => (
                <tr key={i} className="hover:bg-blue-50/20 cursor-pointer" onClick={() => isSmartMode && handleSmartMatch(res.name, res.fields)}>
                  <td className="px-4 py-6 text-center"><input type="checkbox" className="w-4 h-4 rounded" /></td>
                  <td className="px-4 py-4 font-mono text-[11px] text-blue-500 font-bold">{res.code}</td>
                  <td className="px-4 py-4 text-gray-700 font-black">{res.name}</td>
                  <td className="px-4 py-4"><div className="flex flex-wrap gap-2">{res.fields.map(f => <span key={f} className="px-2.5 py-1.5 rounded-lg text-[10px] font-black border bg-white text-gray-400 border-gray-100 hover:border-blue-200">{f}</span>)}</div></td>
                </tr>))}</tbody></table></div>
            <div className="h-20 px-8 border-t flex items-center justify-center gap-4 bg-[#fafbfc]"><button onClick={() => setIsResourceModalOpen(false)} className="bg-blue-600 text-white px-14 py-2.5 rounded-xl text-sm font-black">确定选择</button><button onClick={() => setIsResourceModalOpen(false)} className="bg-white border text-gray-500 px-14 py-2.5 rounded-xl text-sm font-black">取消</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemSplitModal;
