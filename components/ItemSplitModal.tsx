
import React, { useState } from 'react';
import { X, Search, Plus, Info, ChevronLeft, ChevronRight, ChevronDown, Link, Edit2, Trash2, ArrowUp, ArrowDown, Check, FileText, AlertCircle, FileCheck, FileX, RotateCcw } from 'lucide-react';

interface TreeNode {
  id: string;
  label: string;
  count?: number;
  badge?: string;
}

interface TableRow {
  id: number;
  infoItem: string;
  isLinked: string;
  resourceDir: string;
  resourceCode?: string;
  selectedField?: string;
  remark: string;
  isEditing?: boolean;
}

interface ResourceItem {
  id: number;
  code: string;
  name: string;
  fields: string[];
}

interface OtherMatterItem {
  id: string;
  name: string;
  count: number;
  details: TableRow[];
}

interface ItemSplitModalProps {
  onClose: () => void;
}

const ItemSplitModal: React.FC<ItemSplitModalProps> = ({ onClose }) => {
  // --- 办理结果相关状态 ---
  const [outputMode, setOutputMode] = useState<'has' | 'none' | null>(null);
  const [outputReason, setOutputReason] = useState('');
  const [outputDocs, setOutputDocs] = useState<TreeNode[]>([]);
  
  // 各种弹窗状态
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [isOtherMattersModalOpen, setIsOtherMattersModalOpen] = useState(false);
  
  const [currentEditingRowId, setCurrentEditingRowId] = useState<number | null>(null);
  const [tempType, setTempType] = useState<'has' | 'none'>('has');
  const [tempValue, setTempValue] = useState('');
  const [editingDocId, setEditingDocId] = useState<string | null>(null);

  // --- 资源关联弹窗数据模拟 ---
  const [resourceList] = useState<ResourceItem[]>([
    { id: 1, code: '3700000220411', name: '自然人基础信息查询接口', fields: ['姓名', '身份证', '性别', '出生年月'] },
    { id: 2, code: '3700000316003', name: '不动产登记信息查询接口', fields: ['身份证', '性别', '出生年月'] },
    { id: 3, code: '3700000120050', name: '个人社保参保证明获取接口', fields: ['身份证', '性别', '出生年月'] },
    { id: 4, code: '3700000990011', name: '不动产登记信息查询接口', fields: ['身份证', '性别', '出生年月'] },
    { id: 5, code: '4700000030907', name: '婚姻登记状态查询接口', fields: ['身份证', '性别', '出生年月'] },
  ]);
  const [selectedResourceId, setSelectedResourceId] = useState<number | null>(1);
  const [selectedFieldName, setSelectedFieldName] = useState<string | null>('姓名');

  // --- 其他事项同名文件清单模拟数据 ---
  const [otherMatters] = useState<OtherMatterItem[]>([
    { id: 'm1', name: '住房公积金提取办理项', count: 5, details: [
      { id: 101, infoItem: '姓名', isLinked: '是', resourceDir: '购房首付款信息接口- 姓名', remark: '--' },
      { id: 102, infoItem: '照片', isLinked: '否', resourceDir: '--', remark: '电子证照中获取' },
      { id: 103, infoItem: '结婚证号', isLinked: '是', resourceDir: '购房首付款信息接口- 结婚证号', remark: '--' },
      { id: 104, infoItem: '身份证号', isLinked: '是', resourceDir: '身份库查询接口', remark: '--' },
    ]},
    { id: 'm2', name: '公积金贷款办理项', count: 2, details: [
      { id: 201, infoItem: '姓名', isLinked: '是', resourceDir: '人员库-姓名', remark: '--' },
      { id: 202, infoItem: '联系电话', isLinked: '是', resourceDir: '人员库-电话', remark: '--' },
    ]},
  ]);
  const [selectedMatterId, setSelectedMatterId] = useState('m1');

  // --- 其他状态 ---
  const [inputDocs, setInputDocs] = useState<TreeNode[]>([
    { id: 'in-1', label: '购房首付款凭证', count: 5 },
    { id: 'in-2', label: '居民户口簿', count: 2 },
    { id: 'in-3', label: '公证书' },
  ]);

  const [inputExpanded, setInputExpanded] = useState(true);
  const [outputExpanded, setOutputExpanded] = useState(true);
  const [selectedTreeId, setSelectedTreeId] = useState('in-1');

  const [tableData, setTableData] = useState<TableRow[]>([
    { id: 1, infoItem: '姓名', isLinked: '是', resourceDir: '自然人基础信息查询接口', resourceCode: '3700000220411', selectedField: '姓名', remark: '--' },
    { id: 2, infoItem: '照片', isLinked: '否', resourceDir: '--', remark: '电子证照中获取' },
    { id: 3, infoItem: '结婚证号', isLinked: '是', resourceDir: '婚姻登记状态查询接口', resourceCode: '4700000030907', selectedField: '婚姻状态', remark: '--' },
  ]);

  // --- 办理结果逻辑 ---
  const handleOpenConfig = (docId?: string) => {
    if (docId) {
      const doc = outputDocs.find(d => d.id === docId);
      if (doc) {
        setTempType('has');
        setTempValue(doc.label);
        setEditingDocId(docId);
      }
    } else if (outputMode === 'none') {
      setTempType('none');
      setTempValue(outputReason);
      setEditingDocId(null);
    } else {
      setTempType(outputMode || 'has');
      setTempValue('');
      setEditingDocId(null);
    }
    setIsConfigModalOpen(true);
  };

  const handleTypeChange = (newType: 'has' | 'none') => {
    if (newType === tempType) return;
    const hasData = (outputMode === 'has' && outputDocs.length > 0) || (outputMode === 'none' && outputReason);
    if (hasData && outputMode !== newType) {
      if (!window.confirm(`切换为“${newType === 'has' ? '有' : '无'}办理结果”将清空原有的数据。是否确认？`)) return;
    }
    setTempType(newType);
    setTempValue('');
  };

  const handleConfirmConfig = () => {
    if (!tempValue.trim()) { alert(`请填写内容`); return; }
    if (tempType === 'none') {
      setOutputMode('none'); setOutputReason(tempValue); setOutputDocs([]);
    } else {
      setOutputMode('has'); setOutputReason('');
      if (editingDocId) setOutputDocs(outputDocs.map(d => d.id === editingDocId ? { ...d, label: tempValue } : d));
      else setOutputDocs([...outputDocs, { id: `out-${Date.now()}`, label: tempValue }]);
    }
    setIsConfigModalOpen(false); setEditingDocId(null);
  };

  // --- 表格操作 ---
  const addRow = () => {
    setTableData([...tableData, { id: Date.now(), infoItem: '', isLinked: '请选择', resourceDir: '--', remark: '', isEditing: true }]);
  };

  const saveRow = (id: number) => {
    setTableData(tableData.map(row => row.id === id ? { ...row, isEditing: false } : row));
  };

  const moveRow = (index: number, direction: 'up' | 'down') => {
    const newData = [...tableData];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newData.length) {
      [newData[index], newData[targetIndex]] = [newData[targetIndex], newData[index]];
      setTableData(newData);
    }
  };

  const openResourceRelate = (rowId: number) => {
    setCurrentEditingRowId(rowId);
    setIsResourceModalOpen(true);
  };

  const handleConfirmResourceRelate = () => {
    if (currentEditingRowId && selectedResourceId && selectedFieldName) {
      const resource = resourceList.find(r => r.id === selectedResourceId);
      if (resource) {
        setTableData(tableData.map(row => 
          row.id === currentEditingRowId 
            ? { ...row, resourceDir: resource.name, resourceCode: resource.code, selectedField: selectedFieldName, isLinked: '是' } 
            : row
        ));
      }
    }
    setIsResourceModalOpen(false);
  };

  // --- 智能复制逻辑 ---
  const handleCopyFromOtherMatter = (mode: 'all' | 'infoOnly', matterId: string) => {
    const matter = otherMatters.find(m => m.id === matterId);
    if (!matter) return;

    const newRows = matter.details.map((d, i) => ({
      id: Date.now() + i,
      infoItem: d.infoItem,
      isLinked: mode === 'all' ? d.isLinked : '请选择',
      resourceDir: mode === 'all' ? d.resourceDir : '--',
      remark: mode === 'all' ? d.remark : '',
      isEditing: false
    }));

    if (window.confirm(`确定要复制 ${mode === 'all' ? '全部关联信息' : '仅信息项'} 吗？这会覆盖当前表格内容。`)) {
      setTableData(newRows);
      setIsOtherMattersModalOpen(false);
    }
  };

  const selectedMatter = otherMatters.find(m => m.id === selectedMatterId);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-[95%] h-[90%] rounded-lg shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* 其他事项同名文件清单弹窗 */}
        {isOtherMattersModalOpen && (
          <div className="absolute inset-0 z-[130] bg-black/40 flex items-center justify-center animate-in fade-in duration-200">
            <div className="bg-white w-[1200px] h-[80%] rounded shadow-2xl flex flex-col overflow-hidden border border-gray-200">
              <div className="h-12 px-6 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
                <span className="font-bold text-gray-800">其他事项同名文件清单</span>
                <button onClick={() => setIsOtherMattersModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 flex overflow-hidden">
                <div className="w-[320px] border-r border-gray-100 flex flex-col bg-white">
                   <div className="p-4 border-b border-gray-50">
                      <div className="relative group">
                        <input type="text" placeholder="搜索事项" className="w-full pl-3 pr-8 py-1.5 border border-gray-300 rounded text-sm focus:border-blue-500 outline-none transition-all" />
                        <Search className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      </div>
                   </div>
                   <div className="flex-1 overflow-auto p-4 space-y-3">
                      {otherMatters.map(m => (
                        <div 
                          key={m.id} 
                          className={`group flex flex-col gap-2 p-3 rounded cursor-pointer transition-all border ${selectedMatterId === m.id ? 'bg-blue-50/50 border-blue-200' : 'hover:bg-gray-50 border-transparent'}`}
                          onClick={() => setSelectedMatterId(m.id)}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`text-sm font-bold ${selectedMatterId === m.id ? 'text-blue-600' : 'text-gray-700'}`}>{m.name}</span>
                            <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 font-bold">{m.count}项</span>
                          </div>
                          <div className="flex items-center gap-4 text-[11px] font-bold text-blue-500">
                             <button className="hover:text-blue-700 underline" onClick={(e) => { e.stopPropagation(); handleCopyFromOtherMatter('all', m.id); }}>复制全部</button>
                             <button className="hover:text-blue-700 underline" onClick={(e) => { e.stopPropagation(); handleCopyFromOtherMatter('infoOnly', m.id); }}>仅复制信息项</button>
                          </div>
                        </div>
                      ))}
                   </div>
                </div>
                <div className="flex-1 bg-white p-8 overflow-auto">
                   <div className="flex items-center gap-2 mb-6">
                      <div className="w-1.5 h-5 bg-blue-600 rounded-full"></div>
                      <span className="font-bold text-gray-800 text-[15px]">{selectedMatter?.name} 信息项预览</span>
                   </div>
                   <div className="bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100 uppercase text-[11px] tracking-wider">
                          <tr>
                            <th className="px-6 py-4 text-center w-20">序号</th>
                            <th className="px-6 py-4 min-w-[120px]"><span className="text-red-500 mr-1">*</span>信息项</th>
                            <th className="px-6 py-4 min-w-[180px]">接入状态</th>
                            <th className="px-6 py-4 min-w-[200px]">关联资源目录</th>
                            <th className="px-6 py-4 min-w-[150px]">备注说明</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {selectedMatter?.details.map((d, i) => (
                            <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                               <td className="px-6 py-4 text-center text-gray-400 font-mono">{i + 1}</td>
                               <td className="px-6 py-4 text-gray-800 font-bold">{d.infoItem}</td>
                               <td className="px-6 py-4">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${d.isLinked === '是' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-500'}`}>{d.isLinked || '--'}</span>
                               </td>
                               <td className="px-6 py-4 text-gray-600 text-xs">{d.resourceDir}</td>
                               <td className="px-6 py-4 text-gray-400 italic text-xs">{d.remark}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 事项关联数据弹窗 */}
        {isResourceModalOpen && (
          <div className="absolute inset-0 z-[120] bg-black/40 flex items-center justify-center animate-in fade-in duration-200 p-8">
            <div className="bg-white w-[900px] max-w-full rounded shadow-2xl flex flex-col overflow-hidden border border-gray-200">
              <div className="h-12 px-6 border-b border-gray-100 flex items-center justify-between shrink-0">
                <span className="font-bold text-gray-800 text-[15px]">事项关联数据</span>
                <button onClick={() => setIsResourceModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-6 bg-[#fdfdfd]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 whitespace-nowrap min-w-[70px] text-right">目录编码:</span>
                    <input type="text" placeholder="请输入" className="flex-1 border border-gray-200 rounded px-3 py-1.5 text-sm focus:border-blue-500 outline-none" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 whitespace-nowrap min-w-[70px] text-right">目录名称:</span>
                    <input type="text" placeholder="请输入" className="flex-1 border border-gray-200 rounded px-3 py-1.5 text-sm focus:border-blue-500 outline-none" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 whitespace-nowrap min-w-[70px] text-right">信息项:</span>
                    <input type="text" placeholder="行政许可" className="flex-1 border border-gray-200 rounded px-3 py-1.5 text-sm focus:border-blue-500 outline-none" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mb-6">
                  <button className="bg-blue-600 text-white px-6 py-1.5 rounded text-sm hover:bg-blue-700 font-medium">查询</button>
                  <button className="bg-white border border-gray-300 text-gray-600 px-6 py-1.5 rounded text-sm hover:bg-gray-50 flex items-center gap-1 font-medium">
                    <RotateCcw size={14} /> 重置
                  </button>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded flex items-center gap-2 px-4 py-2.5 text-sm text-blue-700 mb-6 font-bold">
                  <Info size={16} />
                  <span>请直接点击选择信息项</span>
                </div>
                <div className="border border-gray-100 rounded overflow-hidden">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-100">
                      <tr>
                        <th className="w-12 px-4 py-3 text-center">序号</th>
                        <th className="px-4 py-3">目录编码</th>
                        <th className="px-4 py-3">目录名称</th>
                        <th className="px-4 py-3">信息项</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {resourceList.map((res, idx) => (
                        <tr key={res.id} className="hover:bg-blue-50/30 transition-colors">
                          <td className="px-4 py-4 text-center">
                            <div className="flex items-center gap-2">
                               <input type="checkbox" checked={selectedResourceId === res.id} onChange={() => setSelectedResourceId(res.id)} className="w-4 h-4 rounded text-blue-600" />
                               <span className="text-gray-400">{idx + 1}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-blue-600 font-medium">{res.code}</td>
                          <td className="px-4 py-4 text-gray-700">{res.name}</td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-2">
                              {res.fields.map(field => (
                                <button 
                                  key={field}
                                  onClick={() => {
                                    setSelectedResourceId(res.id);
                                    setSelectedFieldName(field);
                                  }}
                                  className={`px-3 py-1 border rounded text-xs transition-all ${
                                    selectedResourceId === res.id && selectedFieldName === field
                                      ? 'bg-blue-600 border-blue-600 text-white font-bold shadow-md'
                                      : 'bg-white border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-500'
                                  }`}
                                >
                                  {field}
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 flex justify-center gap-3 bg-white shrink-0">
                <button onClick={handleConfirmResourceRelate} className="px-10 py-2 bg-blue-600 text-white rounded text-sm font-bold hover:bg-blue-700 shadow-sm transition-colors">确定</button>
                <button onClick={() => setIsResourceModalOpen(false)} className="px-10 py-2 bg-white border border-gray-300 text-gray-600 rounded text-sm font-bold hover:bg-gray-50 transition-colors">取消</button>
              </div>
            </div>
          </div>
        )}

        {/* 办理结果配置弹窗 */}
        {isConfigModalOpen && (
          <div className="absolute inset-0 z-[110] bg-black/40 flex items-center justify-center animate-in fade-in duration-200">
            <div className="bg-white w-[520px] rounded shadow-xl border border-gray-200 overflow-hidden">
              <div className="h-11 px-6 border-b border-gray-100 flex items-center justify-between">
                <span className="font-bold text-gray-800 text-sm">创建办理结果名称</span>
                <button onClick={() => setIsConfigModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
              </div>
              <div className="p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <label className="text-sm text-gray-600 w-32 text-right"><span className="text-red-500 mr-1">*</span>是否有办理结果:</label>
                  <div className="flex items-center gap-8">
                    <label className="flex items-center gap-2 cursor-pointer group"><input type="radio" name="resType" checked={tempType === 'has'} onChange={() => handleTypeChange('has')} className="w-4 h-4 text-blue-600" /><span className="text-sm text-gray-700">有</span></label>
                    <label className="flex items-center gap-2 cursor-pointer group"><input type="radio" name="resType" checked={tempType === 'none'} onChange={() => handleTypeChange('none')} className="w-4 h-4 text-blue-600" /><span className="text-sm text-gray-700">无</span></label>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <label className="text-sm text-gray-600 w-32 text-right mt-2"><span className="text-red-500 mr-1">*</span>{tempType === 'has' ? '文档名称:' : '情况说明:'}</label>
                  {tempType === 'has' ? (
                    <input autoFocus type="text" placeholder="请输入文档名称" className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 shadow-sm" value={tempValue} onChange={(e) => setTempValue(e.target.value)} />
                  ) : (
                    <textarea autoFocus placeholder="若无办理结果信息，须说明情况" className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 min-h-[100px] resize-none shadow-sm" value={tempValue} onChange={(e) => setTempValue(e.target.value)} />
                  )}
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-center gap-3">
                <button onClick={handleConfirmConfig} className="px-8 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 shadow-sm">确认</button>
                <button onClick={() => setIsConfigModalOpen(false)} className="px-8 py-1.5 bg-white border border-gray-300 text-gray-600 rounded text-sm font-medium hover:bg-gray-50">取消</button>
              </div>
            </div>
          </div>
        )}

        {/* 顶部标题栏 */}
        <div className="h-12 px-4 border-b border-gray-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
            <h3 className="text-base font-bold text-gray-800 tracking-tight uppercase">事项拆分与数据关联管理</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-400 transition-all active:scale-95"><X size={20} /></button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-[300px] border-r border-gray-100 flex flex-col bg-white shrink-0">
            <div className="p-4 border-b border-gray-50">
              <div className="relative group">
                <input type="text" placeholder="查询材料或文档" className="w-full pl-3 pr-8 py-1.5 border border-gray-200 rounded text-sm focus:border-blue-500 outline-none transition-all group-hover:border-blue-300" />
                <Search className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors" size={16} />
              </div>
            </div>
            <div className="flex-1 overflow-auto p-2 scrollbar-thin">
              <div className="mb-4">
                <div className="flex items-center justify-between py-2 px-2 hover:bg-blue-50/50 rounded cursor-pointer group transition-colors">
                  <div className="flex items-center gap-2" onClick={() => setInputExpanded(!inputExpanded)}>
                    {inputExpanded ? <ChevronDown size={14} className="text-blue-500" /> : <ChevronRight size={14} />}
                    <span className="text-sm font-bold text-gray-700">申报材料信息【输入】</span>
                  </div>
                  <Plus size={16} className="text-blue-500 hover:scale-110 cursor-pointer" onClick={() => {const n = window.prompt('材料名称:'); if(n) setInputDocs([...inputDocs,{id:`in-${Date.now()}`,label:n}]);}} />
                </div>
                {inputExpanded && (
                  <div className="ml-4 pl-4 border-l border-dashed border-gray-200 space-y-1 mt-1">
                    {inputDocs.map(doc => (
                      <div key={doc.id} className={`flex items-center justify-between p-2 rounded group cursor-pointer transition-all ${selectedTreeId === doc.id ? 'bg-blue-50 text-blue-600 font-bold border-r-4 border-blue-600 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`} onClick={() => setSelectedTreeId(doc.id)}>
                        <span className="text-sm truncate pr-4">{doc.label} {doc.count ? `(${doc.count})` : ''}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Edit2 size={12} className="text-gray-400 hover:text-blue-500" />
                          <Trash2 size={12} className="text-gray-400 hover:text-red-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="border-t border-gray-50 pt-4">
                <div className="flex items-center justify-between py-2 px-2 hover:bg-blue-50/50 rounded cursor-pointer group transition-colors">
                  <div className="flex items-center gap-2" onClick={() => setOutputExpanded(!outputExpanded)}>
                    {outputExpanded ? <ChevronDown size={14} className="text-blue-500" /> : <ChevronRight size={14} />}
                    <span className="text-sm font-bold text-gray-700">办理结果信息【输出】</span>
                  </div>
                  <Plus size={16} className="text-blue-500 hover:scale-110 cursor-pointer" onClick={() => handleOpenConfig()} />
                </div>
                {outputExpanded && (
                  <div className="ml-4 pl-4 border-l border-dashed border-gray-200 space-y-1 mt-1">
                    {outputMode === 'none' && (
                      <div className="p-3 bg-gray-50 border border-gray-100 rounded group relative animate-in slide-in-from-left-2 shadow-sm">
                        <div className="flex items-center gap-1.5 text-gray-400 text-[10px] mb-1 font-bold">无办理结果说明</div>
                        <p className="text-[11px] text-gray-600 italic leading-relaxed">{outputReason}</p>
                        <button onClick={() => handleOpenConfig()} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-white rounded shadow-sm transition-all"><Edit2 size={11} className="text-blue-500" /></button>
                      </div>
                    )}
                    {outputMode === 'has' && outputDocs.map(doc => (
                      <div key={doc.id} className={`flex items-center justify-between p-2 rounded group cursor-pointer transition-all ${selectedTreeId === doc.id ? 'bg-blue-50 text-blue-600 font-bold border-r-4 border-blue-600 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`} onClick={() => setSelectedTreeId(doc.id)}>
                        <span className="text-sm truncate">{doc.label}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Edit2 size={12} className="text-gray-400 hover:text-blue-500" onClick={(e) => { e.stopPropagation(); handleOpenConfig(doc.id); }} />
                          <Trash2 size={12} className="text-gray-400 hover:text-red-500" onClick={(e) => { e.stopPropagation(); setOutputDocs(outputDocs.filter(d => d.id !== doc.id)); }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col bg-[#f8f9fb] p-6 overflow-hidden">
            <div className="mb-6 bg-[#ebf5ff] border border-[#bae0ff] rounded-lg flex items-center justify-between px-5 py-4 shadow-sm animate-in fade-in duration-500">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-inner">
                  <span className="text-yellow-500 text-xl">💡</span>
                </div>
                <span className="text-sm text-gray-700 leading-relaxed max-w-[500px]">智能识别到该申报材料文件在其他事项中已拆分过，可一键复制已拆分信息项及关联关系至当前表格</span>
              </div>
              <button 
                onClick={() => setIsOtherMattersModalOpen(true)}
                className="bg-white px-5 py-2 border border-blue-200 text-blue-600 rounded-md text-sm font-bold hover:bg-blue-50 transition-all flex items-center gap-1 shadow-sm"
              >
                查看内容
              </button>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl shadow-xl shadow-gray-200/50 overflow-hidden flex flex-col flex-1 border-t-4 border-t-blue-500">
              <div className="overflow-auto flex-1 scrollbar-thin">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="bg-gray-50/80 backdrop-blur-sm text-gray-500 font-bold border-b border-gray-100 sticky top-0 z-10 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="px-6 py-4 text-center w-16">序号</th>
                      <th className="px-6 py-4 min-w-[140px]"><span className="text-red-500 mr-1">*</span>信息项名称</th>
                      <th className="px-6 py-4 min-w-[120px]">接入状态</th>
                      <th className="px-6 py-4 min-w-[240px]">关联资源目录 / 字段</th>
                      <th className="px-6 py-4 min-w-[150px]">备注说明</th>
                      <th className="px-6 py-4 text-center min-w-[280px]">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {tableData.map((row, index) => (
                      <tr key={row.id} className={`${row.isEditing ? "bg-blue-50/30" : "hover:bg-blue-50/10"} transition-colors group`}>
                        <td className="px-6 py-4 text-center text-gray-400 font-mono font-medium">{index + 1}</td>
                        <td className="px-6 py-4">
                          {row.isEditing ? (
                            <input autoFocus type="text" className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none shadow-inner" placeholder="输入名称" defaultValue={row.infoItem} onBlur={(e) => row.infoItem = e.target.value} />
                          ) : <span className="text-gray-800 font-bold text-sm">{row.infoItem || '--'}</span>}
                        </td>
                        <td className="px-6 py-4">
                          {row.isEditing ? (
                            <select className="w-full border border-gray-200 rounded px-3 py-2 bg-white outline-none" defaultValue={row.isLinked} onChange={(e) => row.isLinked = e.target.value}>
                              <option>请选择</option><option>是</option><option>否</option>
                            </select>
                          ) : <span className={`px-2.5 py-1 rounded text-[11px] font-bold ${row.isLinked === '是' ? 'bg-green-100 text-green-700' : 'bg-orange-50 text-orange-600'}`}>{row.isLinked}</span>}
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center justify-between gap-4">
                              <div className="flex flex-col">
                                <span className={`${row.resourceDir === '--' ? 'text-gray-300' : 'text-gray-800 font-medium'} truncate block max-w-[160px]`}>{row.resourceDir}</span>
                                {row.selectedField && <span className="text-[10px] text-blue-500 font-bold">字段：{row.selectedField}</span>}
                              </div>
                              {row.isEditing && (
                                <button onClick={() => openResourceRelate(row.id)} className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 border border-blue-100 rounded text-[11px] font-bold text-blue-600 bg-white hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                                  <Link size={12} /> 关联
                                </button>
                              )}
                           </div>
                        </td>
                        <td className="px-6 py-4">
                          {row.isEditing ? (
                            <input type="text" className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none shadow-inner" placeholder="备注" defaultValue={row.remark} onBlur={(e) => row.remark = e.target.value} />
                          ) : <span className="text-gray-400 italic text-xs">{row.remark || '--'}</span>}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-4 text-blue-500 font-bold text-sm">
                            {row.isEditing ? (
                              <button className="flex items-center gap-1 bg-blue-600 text-white px-4 py-1.5 rounded shadow-lg shadow-blue-100 hover:bg-blue-700 transition-colors" onClick={() => saveRow(row.id)}><Check size={14} /> 保存</button>
                            ) : (
                              <button className="hover:text-blue-800 flex items-center gap-1.5 transition-colors" onClick={() => setTableData(tableData.map(r => r.id === row.id ? {...r, isEditing: true} : r))}><Edit2 size={14} /> 编辑</button>
                            )}
                            <button className="hover:text-red-600 transition-colors" onClick={() => setTableData(tableData.filter(r => r.id !== row.id))}>删除</button>
                            <div className="w-[1px] h-4 bg-gray-200 mx-1"></div>
                            <button disabled={index === 0} onClick={() => moveRow(index, 'up')} className={`p-1 rounded hover:bg-gray-100 transition-all ${index === 0 ? 'text-gray-200 cursor-not-allowed' : 'text-blue-400 hover:text-blue-600 active:scale-90'}`}><ArrowUp size={16} /></button>
                            <button disabled={index === tableData.length - 1} onClick={() => moveRow(index, 'down')} className={`p-1 rounded hover:bg-gray-100 transition-all ${index === tableData.length - 1 ? 'text-gray-200 cursor-not-allowed' : 'text-blue-400 hover:text-blue-600 active:scale-90'}`}><ArrowDown size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-5 bg-white border-t border-gray-100">
                <button onClick={addRow} className="w-full py-5 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 hover:shadow-xl hover:shadow-blue-50 transition-all flex items-center justify-center gap-2 text-sm font-bold group">
                  <Plus size={22} className="group-hover:rotate-90 transition-transform duration-300" /> 直接新增一条信息项数据
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemSplitModal;
