
import React, { useState } from 'react';
import { X, Search, Plus, Info, ChevronDown, ChevronRight, Link, Edit2, Trash2, ArrowUp, ArrowDown, Check, Zap, RotateCcw, FileText, CheckCircle, Database, Settings, Layout, FileCheck, Share2, Save, Link2, Download, FileUp, UploadCloud, FileType, Trash } from 'lucide-react';

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
  const [isSmartMode, setIsSmartMode] = useState(false); // 是否为“全表智能匹配”模式
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

  // --- 视图渲染 ---

  const renderSplitTableView = (data: TableRow[], setData: React.Dispatch<React.SetStateAction<TableRow[]>>, title: string) => (
    <div className="flex flex-col flex-1 overflow-hidden p-6 bg-white animate-in fade-in duration-300">
      
      {/* 智能匹配引导横条 */}
      <div className="w-full bg-[#f0f7ff] border border-[#d1e9ff] rounded-md p-3 mb-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white">
            <Zap size={16} />
          </div>
          <div className="text-sm">
            <span className="font-bold text-blue-900 mr-2">智能匹配助手</span>
            <span className="text-blue-700 text-xs">选择某个数据资源目录，系统将自动把该目录下包含的信息项与当前列表中的同名项进行关联。</span>
          </div>
        </div>
        <button 
          onClick={() => { setIsResourceModalOpen(true); setIsSmartMode(true); }}
          className="px-4 py-1.5 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm shadow-blue-100"
        >
           <Link2 size={14} /> 开始智能匹配
        </button>
      </div>

      {/* 批量操作工具栏 */}
      <div className={`flex items-center gap-4 mb-4 p-2 bg-gray-50 rounded-lg border border-gray-100 transition-all ${selectedRowIds.length > 0 ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
        <span className="text-xs font-bold text-gray-500 ml-2">已选 {selectedRowIds.length} 项:</span>
        <div className="flex items-center gap-2">
           <span className="text-[11px] text-gray-400">批量设置接入状态:</span>
           <button onClick={() => handleBatchUpdateStatus(data, setData, '是')} className="px-3 py-1 bg-white border border-gray-200 rounded text-[11px] hover:border-blue-500 hover:text-blue-600 font-bold transition-colors">是</button>
           <button onClick={() => handleBatchUpdateStatus(data, setData, '否')} className="px-3 py-1 bg-white border border-gray-200 rounded text-[11px] hover:border-blue-500 hover:text-blue-600 font-bold transition-colors">否</button>
           <button onClick={() => handleBatchUpdateStatus(data, setData, '无需接入')} className="px-3 py-1 bg-white border border-gray-200 rounded text-[11px] hover:border-blue-500 hover:text-blue-600 font-bold transition-colors">无需接入</button>
        </div>
        <div className="w-px h-4 bg-gray-200 mx-2"></div>
        <button onClick={() => handleBatchEdit(data, setData)} className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-200 rounded text-[11px] hover:border-blue-500 hover:text-blue-600 font-bold transition-colors">
          <Edit2 size={12}/> 批量编辑
        </button>
        <button onClick={() => handleBatchDelete(data, setData)} className="flex items-center gap-1 px-3 py-1 bg-white border border-red-100 text-red-500 rounded text-[11px] hover:bg-red-50 font-bold transition-colors">
          <Trash2 size={12}/> 批量删除
        </button>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-[#f9fafc] text-gray-400 font-bold border-b border-gray-100 uppercase text-[11px] tracking-tight">
              <tr>
                <th className="px-4 py-4 text-center w-12">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-gray-300"
                    checked={data.length > 0 && selectedRowIds.length === data.length}
                    onChange={() => toggleSelectAll(data)}
                  />
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
                <tr key={row.id} className={`hover:bg-blue-50/5 group transition-colors ${selectedRowIds.includes(row.id) ? 'bg-blue-50/30' : ''}`}>
                  <td className="px-4 py-4 text-center">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-gray-300"
                      checked={selectedRowIds.includes(row.id)}
                      onChange={() => toggleSelectRow(row.id)}
                    />
                  </td>
                  <td className="px-4 py-5 text-center text-gray-400 font-mono text-xs">{idx + 1}</td>
                  <td className="px-4 py-4">
                    {row.isEditing ? (
                      <input 
                        className="w-full border border-blue-400 rounded-md px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none shadow-sm"
                        value={row.infoItem}
                        onChange={(e) => updateRowField(data, setData, row.id, 'infoItem', e.target.value)}
                        placeholder="输入名称"
                      />
                    ) : <span className="font-bold text-gray-800">{row.infoItem || '--'}</span>}
                  </td>
                  <td className="px-4 py-4">
                    {row.isEditing ? (
                      <select 
                        className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-sm outline-none focus:border-blue-500"
                        value={row.isLinked}
                        onChange={(e) => updateRowField(data, setData, row.id, 'isLinked', e.target.value)}
                      >
                        <option value="请选择" disabled>请选择</option>
                        <option value="是">是</option>
                        <option value="否">否</option>
                        <option value="无需接入">无需接入</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        row.isLinked === '是' ? 'bg-green-100 text-green-700' : 
                        row.isLinked === '无需接入' ? 'bg-gray-100 text-gray-500' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {row.isLinked}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="text-[11px] flex-1">
                        <div className="text-gray-700 font-medium truncate max-w-[200px]">{row.resourceDir === '--' ? '--' : row.resourceDir}</div>
                        {row.selectedField && <div className="text-blue-600 font-bold">字段: {row.selectedField}</div>}
                      </div>
                      {row.isEditing && (
                        <button 
                          onClick={() => { setIsResourceModalOpen(true); setCurrentRowId(row.id); setIsSmartMode(false); }}
                          className="flex items-center gap-1 px-3 py-1 border border-blue-100 text-blue-600 rounded-md text-xs font-bold hover:bg-blue-50"
                        >
                          <Link2 size={12} /> 关联
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {row.isEditing ? (
                      <input 
                        className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm outline-none focus:border-blue-500"
                        value={row.remark}
                        onChange={(e) => updateRowField(data, setData, row.id, 'remark', e.target.value)}
                        placeholder="备注"
                      />
                    ) : <span className="text-gray-400 text-xs italic">{row.remark || '--'}</span>}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-4">
                      {row.isEditing ? (
                         <button onClick={() => saveRow(data, setData, row.id)} className="flex items-center gap-1 text-white bg-blue-600 px-4 py-1.5 rounded-md text-xs font-bold hover:bg-blue-700 shadow-sm"><Check size={14}/>保存</button>
                      ) : (
                         <button onClick={() => updateRowField(data, setData, row.id, 'isEditing', true)} className="text-blue-500 hover:text-blue-700 text-xs font-bold">编辑</button>
                      )}
                      <button onClick={() => {
                        setData(data.filter(r => r.id !== row.id));
                        setSelectedRowIds(prev => prev.filter(i => i !== row.id));
                      }} className="text-blue-500 hover:text-red-500 text-xs font-bold">删除</button>
                      <div className="w-px h-3 bg-gray-100"></div>
                      <button onClick={() => moveRow(data, setData, idx, 'up')} disabled={idx === 0} className="p-1 text-gray-300 hover:text-blue-500 disabled:opacity-20"><ArrowUp size={16}/></button>
                      <button onClick={() => moveRow(data, setData, idx, 'down')} disabled={idx === data.length - 1} className="p-1 text-gray-300 hover:text-blue-500 disabled:opacity-20"><ArrowDown size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* 底部新增行入口 */}
        <div className="mt-8 mb-4">
          <button 
            onClick={() => addNewField(setData)}
            className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-gray-100 rounded-xl text-gray-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/10 transition-all font-bold text-sm"
          >
            <Plus size={18} /> 直接新增一条信息项数据
          </button>
        </div>
      </div>
    </div>
  );

  const renderMaterialConfigView = (id: string) => {
    const config = materialsConfigs[id];
    if (!config) return null;

    const updateConfig = (key: keyof MaterialConfig, value: string) => {
      let newConfig = { ...config, [key]: value };
      if (key === 'isLinked' && value === '否') {
        newConfig.accessMethod = '';
      }
      setMaterialsConfigs({ ...materialsConfigs, [id]: newConfig });
    };

    return (
      <div className="flex-1 p-10 bg-white overflow-auto animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="mb-10 border-l-4 border-blue-600 pl-5">
          <h2 className="text-xl font-black text-gray-800 tracking-tight">{config.name} - 整体要素登记</h2>
        </div>
        <div className="max-w-4xl space-y-10">
          <div className="space-y-4">
            <label className="text-sm font-black text-gray-700 flex items-center gap-2">
              <span className="text-red-500 text-lg">*</span>
              <FileText size={18} className="text-blue-600" />
              申报材料信息项（字段登记）
            </label>
            <textarea 
              className={`w-full border rounded-2xl p-6 text-sm text-gray-700 leading-relaxed focus:border-blue-500 outline-none transition-all min-h-[220px] shadow-sm ${config.fieldsText ? 'border-gray-200 bg-white' : 'border-orange-200 bg-orange-50/20'}`}
              placeholder="请列出该材料包含的所有关键字段名称，如：姓名、身份证号、出生日期..."
              value={config.fieldsText}
              onChange={(e) => updateConfig('fieldsText', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <label className="text-sm font-black text-gray-700"><span className="text-red-500 text-lg">*</span> 是否实现接入</label>
              <div className="flex gap-4">
                {['是', '否'].map(opt => (
                  <button 
                    key={opt}
                    onClick={() => updateConfig('isLinked', opt)}
                    className={`flex-1 py-4 rounded-xl border-2 text-sm font-black transition-all ${config.isLinked === opt ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-100' : 'bg-white border-gray-100 text-gray-400'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <label className={`text-sm font-black flex items-center gap-2 ${config.isLinked === '是' ? 'text-gray-700' : 'text-gray-300'}`}>
                接入方式
              </label>
              <input 
                type="text" 
                disabled={config.isLinked === '否'}
                className="w-full border-2 rounded-xl px-5 py-4 text-sm outline-none transition-all focus:border-blue-500"
                value={config.accessMethod}
                onChange={(e) => updateConfig('accessMethod', e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <label className="text-sm font-black text-gray-700 flex items-center gap-2">
              备注说明
              <span className="text-[10px] text-gray-400 font-normal"></span>
            </label>
            <textarea 
              className="w-full border-2 border-gray-100 rounded-2xl p-6 text-sm text-gray-700 leading-relaxed focus:border-blue-500 outline-none transition-all min-h-[160px] shadow-sm bg-white"
              placeholder="请输入备注信息..."
              value={config.remark}
              onChange={(e) => updateConfig('remark', e.target.value)}
            />
          </div>
        </div>
      </div>
    );
  };

  const handleSidebarClick = (id: string) => {
    setSelectedTreeId(id);
    setSelectedRowIds([]); // 切换视图时清空选中
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white w-[98%] h-[95%] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 ring-1 ring-black/5">
        
        {/* Header */}
        <div className="h-16 px-8 border-b border-gray-100 flex items-center justify-between bg-white shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <Settings size={18} />
            </div>
            <h3 className="text-base font-black text-gray-800 tracking-tight">政务事项要素精细化管理看板</h3>
          </div>
          <div className="flex items-center gap-4">
             <button 
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-black shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
             >
                <FileUp size={18} /> 批量导入
             </button>
             <div className="w-px h-6 bg-gray-100"></div>
             <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400">
                <X size={22} />
             </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-[280px] border-r border-gray-100 flex flex-col bg-[#fdfdfd] shrink-0">
            <div className="p-5 border-b border-gray-100 bg-white">
              <div className="relative group">
                <input type="text" placeholder="快速定位材料..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs focus:bg-white focus:border-blue-500 outline-none transition-all" />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
              </div>
            </div>
            
            <div className="flex-1 overflow-auto p-4 space-y-6">
              <div>
                <div className="flex items-center justify-between py-2 px-2 hover:bg-gray-100 rounded-lg cursor-pointer" onClick={() => setInputExpanded(!inputExpanded)}>
                  <div className="flex items-center gap-2">
                    {inputExpanded ? <ChevronDown size={14} className="text-blue-500" /> : <ChevronRight size={14} />}
                    <span className="text-[11px] font-black text-gray-800 tracking-wider">申报材料信息【输入】</span>
                  </div>
                </div>
                {inputExpanded && (
                  <div className="ml-5 border-l border-gray-100 mt-2 space-y-1">
                    <div onClick={() => handleSidebarClick('form-info')} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer text-xs ml-3 transition-all ${selectedTreeId === 'form-info' ? 'bg-blue-600 text-white font-bold shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}>
                      <Layout size={16} /> <span>表单信息 (拆分)</span>
                    </div>
                    {Object.values(materialsConfigs).map((mat: MaterialConfig) => (
                      <div key={mat.id} onClick={() => handleSidebarClick(mat.id)} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer text-xs ml-3 transition-all ${selectedTreeId === mat.id ? 'bg-blue-600 text-white font-bold shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${mat.fieldsText ? (selectedTreeId === mat.id ? 'bg-white' : 'bg-green-500') : 'bg-gray-200'}`}></div>
                        <span className="truncate max-w-[140px]">{mat.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center justify-between py-2 px-2 hover:bg-gray-100 rounded-lg cursor-pointer" onClick={() => setOutputExpanded(!outputExpanded)}>
                  <div className="flex items-center gap-2">
                    {outputExpanded ? <ChevronDown size={14} className="text-indigo-500" /> : <ChevronRight size={14} />}
                    <span className="text-[11px] font-black text-gray-800 tracking-wider">办理结果信息【输出】</span>
                  </div>
                </div>
                {outputExpanded && (
                  <div className="ml-5 border-l border-gray-100 mt-2 space-y-1">
                    <div onClick={() => handleSidebarClick('output-doc')} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer text-xs ml-3 transition-all ${selectedTreeId === 'output-doc' ? 'bg-indigo-600 text-white font-bold shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}>
                      <FileCheck size={16} /> <span>结果证明文档 (拆分)</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col bg-[#fafbfc] overflow-hidden relative">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 opacity-20"></div>
             {selectedTreeId === 'form-info' && renderSplitTableView(formTableData, setFormTableData, '表单信息')}
             {selectedTreeId === 'output-doc' && renderSplitTableView(resultTableData, setResultTableData, '结果证明文档')}
             {(!['form-info', 'output-doc'].includes(selectedTreeId)) && renderMaterialConfigView(selectedTreeId)}
          </div>
        </div>
      </div>

      {/* 批量导入中心对话框 */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[300] bg-black/60 flex items-center justify-center p-8 backdrop-blur-md animate-in zoom-in duration-200">
           <div className="bg-white w-[540px] rounded-3xl shadow-2xl overflow-hidden border border-gray-200 ring-1 ring-black/5">
              <div className="h-16 px-8 border-b border-gray-100 flex items-center justify-between">
                <span className="text-lg font-black text-gray-800 flex items-center gap-2">
                  <FileUp size={20} className="text-blue-600" />
                  批量导入要素信息
                </span>
                <button onClick={() => setIsImportModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                  <X size={20} />
                </button>
              </div>
              <div className="p-10 space-y-8">
                 <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 flex flex-col items-center gap-4 group cursor-pointer hover:bg-blue-100 transition-colors">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                       <Download size={24} />
                    </div>
                    <div className="text-center">
                       <p className="text-sm font-black text-blue-900">第一步：下载标准导入模板</p>
                       <p className="text-[11px] text-blue-600 font-bold mt-1">请先下载 Excel 模版，按规范填写后上传。</p>
                    </div>
                 </div>

                 <div className="border-2 border-dashed border-gray-200 rounded-3xl p-10 flex flex-col items-center gap-6 bg-gray-50/50 hover:bg-white hover:border-blue-400 hover:shadow-inner transition-all group relative">
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all">
                       <UploadCloud size={32} />
                    </div>
                    <div className="text-center">
                       <p className="text-sm font-black text-gray-800">第二步：点击或拖拽文件到此处</p>
                       <p className="text-[11px] text-gray-400 font-bold mt-1 italic">支持 .xls, .xlsx 格式文件，单文件最大 10MB</p>
                    </div>
                 </div>
              </div>
              <div className="h-20 px-8 border-t border-gray-100 flex items-center justify-center gap-4 bg-[#fafbfc]">
                 <button className="bg-blue-600 text-white px-12 py-2.5 rounded-xl text-sm font-black shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95">开始上传导入</button>
                 <button onClick={() => setIsImportModalOpen(false)} className="bg-white border border-gray-200 text-gray-500 px-12 py-2.5 rounded-xl text-sm font-black hover:bg-gray-50 transition-all">取消</button>
              </div>
           </div>
        </div>
      )}

      {/* 事项关联数据弹窗 (原有关联逻辑保留) */}
      {isResourceModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-8 backdrop-blur-md animate-in zoom-in duration-200">
          <div className="bg-white w-[1000px] max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 ring-1 ring-black/5">
            <div className="h-16 px-8 border-b border-gray-100 flex items-center justify-between shrink-0">
              <span className="text-lg font-black text-gray-800 flex items-center gap-2">
                <Database size={20} className="text-blue-600" />
                {isSmartMode ? '选择资源目录开始智能匹配' : '事项关联数据'}
              </span>
              <button onClick={() => setIsResourceModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                <X size={20} />
              </button>
            </div>
            <div className="p-8 pb-4 space-y-6 shrink-0 bg-[#fafbfc]/50 border-b border-gray-50">
              <div className="grid grid-cols-3 gap-8">
                 <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">目录编码</label>
                    <input type="text" placeholder="输入编码检索" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 outline-none bg-white shadow-sm" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">目录名称</label>
                    <input type="text" placeholder="输入目录关键字" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 outline-none bg-white shadow-sm" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">信息项</label>
                    <input type="text" placeholder="输入字段名" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 outline-none bg-white shadow-sm" />
                 </div>
              </div>
              <div className="flex justify-end gap-3">
                 <button className="bg-blue-600 text-white px-8 py-2 rounded-xl text-sm font-black shadow-lg shadow-blue-100 hover:bg-blue-700">查询</button>
                 <button className="bg-white border border-gray-200 text-gray-500 px-8 py-2 rounded-xl text-sm font-black hover:bg-gray-50 transition-all">重置</button>
              </div>
            </div>
            <div className="px-8 py-4 bg-white shrink-0">
               <div className="flex gap-1 items-center">
                  {[1,2,3,4,5,6,7].map(i => (
                    <div key={i} className="w-8 h-4 rounded-sm bg-blue-100/50"></div>
                  ))}
                  <span className="text-[10px] text-blue-400 font-bold ml-3 italic">
                    {isSmartMode ? "选择下方的目录，系统将自动扫描全表进行同名项关联匹配" : "请选择一个资源目录下的字段进行精准关联"}
                  </span>
               </div>
            </div>
            <div className="flex-1 overflow-auto px-8 pb-8">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-[#f9fafc] text-gray-400 font-bold border-b border-gray-100 uppercase text-[11px] sticky top-0">
                  <tr>
                    <th className="px-4 py-4 w-12 text-center">选择</th>
                    <th className="px-4 py-4 w-40">目录编码</th>
                    <th className="px-4 py-4 w-64">目录名称</th>
                    <th className="px-4 py-4">信息项 (包含字段)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[
                    { code: '3700000220411', name: '自然人基础信息查询接口', fields: ['姓名', '身份证', '性别', '出生年月'] },
                    { code: '3700000316003', name: '不动产登记信息查询接口', fields: ['身份证', '性别', '出生年月'] },
                    { code: '3700000120050', name: '个人社保参保证明获取接口', fields: ['身份证', '性别', '出生年月'] },
                    { code: '3700000990011', name: '不动产登记信息查询接口', fields: ['身份证', '性别', '出生年月'] },
                    { code: '4700000030907', name: '婚姻登记状态查询接口', fields: ['身份证', '性别', '出生年月'] },
                  ].map((res, i) => (
                    <tr 
                      key={i} 
                      className={`hover:bg-blue-50/20 transition-all cursor-pointer group ${i === 0 ? 'bg-blue-50/10' : ''}`}
                      onClick={() => {
                        if (isSmartMode) {
                           handleSmartMatch(res.name, res.fields);
                        }
                      }}
                    >
                      <td className="px-4 py-6 text-center">
                        <input type="checkbox" defaultChecked={i === 0} className="w-4 h-4 rounded border-gray-300 text-blue-600" />
                      </td>
                      <td className="px-4 py-4 font-mono text-[11px] text-blue-500 font-bold">{res.code}</td>
                      <td className="px-4 py-4 text-gray-700 font-black group-hover:text-blue-600">{res.name}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          {res.fields.map(f => (
                            <span 
                              key={f} 
                              onClick={(e) => {
                                if (!isSmartMode) {
                                  e.stopPropagation();
                                  if (currentRowId !== null) {
                                    const setter = selectedTreeId === 'form-info' ? setFormTableData : setResultTableData;
                                    const data = selectedTreeId === 'form-info' ? formTableData : resultTableData;
                                    updateRowField(data, setter, currentRowId, 'resourceDir', res.name);
                                    updateRowField(data, setter, currentRowId, 'selectedField', f);
                                    updateRowField(data, setter, currentRowId, 'isLinked', '是');
                                    setIsResourceModalOpen(false);
                                  }
                                }
                              }}
                              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black border transition-all ${f === '姓名' && i === 0 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-400 border-gray-100 hover:border-blue-200'}`}
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="h-20 px-8 border-t border-gray-100 flex items-center justify-center gap-4 shrink-0 bg-[#fafbfc]">
               <button onClick={() => setIsResourceModalOpen(false)} className="bg-blue-600 text-white px-14 py-2.5 rounded-xl text-sm font-black shadow-xl hover:bg-blue-700">确定</button>
               <button onClick={() => setIsResourceModalOpen(false)} className="bg-white border border-gray-300 text-gray-500 px-14 py-2.5 rounded-xl text-sm font-black">取消</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemSplitModal;
