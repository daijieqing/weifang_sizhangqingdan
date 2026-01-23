import React, { useState, useRef } from 'react';
import { 
  RefreshCw, ListFilter, Settings, Info, X, FileText, ChevronDown, ChevronUp, 
  CheckCircle2, AlertCircle, Layout, Calendar, Layers, FileCheck, PieChart, 
  Activity, Share2, Target, BarChart3, FileOutput, Database, Link2, 
  ClipboardList, FileSignature, FileSearch, Inbox, Send 
} from 'lucide-react';
import { ServiceItem } from '../types.ts';
import ItemSplitModal from './ItemSplitModal.tsx';

const Tooltip: React.FC<{ content: string; children: React.ReactNode }> = ({ content, children }) => {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        x: rect.left + rect.width / 2,
        y: rect.top
      });
    }
  };

  return (
    <div 
      ref={triggerRef}
      className="relative inline-block" 
      onMouseEnter={() => {
        updatePosition();
        setVisible(true);
      }} 
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div 
          className="fixed z-[9999] px-3 py-2 bg-gray-900 text-white text-xs rounded shadow-2xl pointer-events-none max-w-[240px] leading-relaxed -translate-x-1/2 -translate-y-full mb-2 animate-in fade-in slide-in-from-bottom-1 duration-200"
          style={{ left: coords.x, top: coords.y - 8 }}
        >
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

const ProgressBar: React.FC<{ percent: number; color?: 'blue' | 'emerald' | 'indigo' | 'orange'; size?: 'xs' | 'sm' | 'md' }> = ({ percent, color = 'blue', size = 'sm' }) => {
  let colorClass = "bg-blue-500";
  let textClass = "text-blue-600";
  
  if (color === 'emerald') {
    colorClass = "bg-emerald-500";
    textClass = "text-emerald-600";
  } else if (color === 'indigo') {
    colorClass = "bg-indigo-500";
    textClass = "text-indigo-600";
  } else if (color === 'orange') {
    colorClass = "bg-orange-500";
    textClass = "text-orange-600";
  }
  
  if (percent === 100) {
    colorClass = "bg-green-500";
    textClass = "text-green-600";
  }

  const height = size === 'xs' ? 'h-1' : size === 'sm' ? 'h-1.5' : 'h-2';

  return (
    <div className={`flex flex-col gap-0.5 w-full ${size !== 'md' ? 'max-w-[80px]' : ''} group/progress`}>
      <div className="flex items-center justify-between px-0.5">
        <span className={`text-[9px] font-black italic tracking-tighter ${textClass}`}>{percent}%</span>
      </div>
      <div className={`w-full ${height} bg-gray-100 rounded-full overflow-hidden shadow-inner border border-gray-50`}>
        <div 
          className={`h-full ${colorClass} transition-all duration-700 ease-out rounded-full relative overflow-hidden`}
          style={{ width: `${percent}%` }}
        >
           <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover/progress:translate-x-full transition-transform duration-1000 ease-in-out"></div>
        </div>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{ label: string; value: number; color: 'blue' | 'emerald' | 'indigo' | 'orange' }> = ({ label, value, color }) => {
  return (
    <div className="flex-1 min-w-[140px] bg-[#f8fbff]/50 border border-blue-50/50 rounded-xl p-4 flex flex-col gap-3">
      <span className="text-[11px] font-bold text-gray-500">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-black italic ${color === 'blue' ? 'text-blue-600' : color === 'orange' ? 'text-orange-600' : color === 'emerald' ? 'text-emerald-600' : 'text-indigo-600'}`}>{value}%</span>
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-700 ${color === 'blue' ? 'bg-blue-500' : color === 'orange' ? 'bg-orange-500' : color === 'emerald' ? 'bg-emerald-500' : 'bg-indigo-500'}`}
            style={{ width: `${value}%` }}
          />
        </div>
      </div>
    </div>
  );
};

const DetailsDrawer: React.FC<{ item: ServiceItem | null; isOpen: boolean; onClose: () => void }> = ({ item, isOpen, onClose }) => {
  const [expandedIndices, setExpandedIndices] = useState<string[]>(['form-info', 'materials-list', 'output-info']);

  if (!item) return null;

  const toggleSection = (id: string) => {
    setExpandedIndices(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const mockDetails = {
    input: {
      formInfo: [
        { name: '申请人姓名', linked: '是', resource: '自然人基础信息查询接口', field: '姓名', remark: '--' },
        { name: '证件号码', linked: '是', resource: '自然人基础信息查询接口', field: '公民身份号码', remark: '--' },
        { name: '婚姻状态', linked: '是', resource: '婚姻登记状态查询接口', field: '婚姻状态', remark: '--' },
        { name: '联系电话', linked: '否', resource: '--', field: '--', remark: '暂无对应数据元' },
      ],
      materials: [
        { id: 'm1', name: '居民户口簿', fields: '户主姓名、首页地址、出生日期、身份证号', linked: '是', access: '电子证照回流', remark: '--' },
        { id: 'm2', name: '身份证', fields: '姓名、性别、民族、有效期', linked: '是', access: '省身份证库实时接入', remark: '读取正反面信息' },
        { id: 'm3', name: '个人收入证明', fields: '月收入额、公司抬头', linked: '否', access: '--', remark: '需要申请人自行上传' },
      ]
    },
    output: {
      resultInfo: [
        { name: '准予许可决定书', linked: '是', resource: '审批结果公示库', field: '结果文件', remark: '已实现自动共享' },
        { name: '电子证照凭证', linked: '是', resource: '省电子证照库', field: '证照流水号', remark: '--' },
      ]
    }
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div className={`fixed top-0 right-0 h-full w-[1100px] max-w-[95vw] bg-[#f8fafc] shadow-2xl z-[1001] transition-transform duration-300 ease-out transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
        {/* Header */}
        <div className="h-16 px-8 border-b border-gray-100 flex items-center justify-between bg-white shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-100">
                <FileSearch size={18} />
             </div>
             <h3 className="text-base font-black text-gray-800 tracking-tight">政务服务事项拆分关联详情看板</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
            <X size={22} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Top Hero Section */}
          <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50/50 rounded-full -mr-24 -mt-24 pointer-events-none"></div>
            <div className="relative z-10 space-y-8">
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xl shadow-blue-100">
                  <Layout size={28} />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-black text-gray-800 leading-tight mb-4">{item.processItem}</h2>
                  <div className="flex flex-wrap gap-x-10 gap-y-3">
                    <div className="flex items-center gap-2">
                       <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">事项主项</span>
                       <span className="text-sm font-bold text-gray-700">{item.mainItem}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">更新时间</span>
                       <span className="text-sm font-mono text-gray-500 font-bold">{item.updateTime}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard label="字段拆分进度" value={item.splitProgress} color="blue" />
                <MetricCard label="单材料免提交率" value={item.relateProgress} color="orange" />
                <MetricCard label="表单免填报率" value={item.exemptRate} color="emerald" />
                <MetricCard label="结果共享合规率" value={item.complianceRate} color="indigo" />
              </div>
            </div>
          </div>

          {/* 1. 申报表单信息 (输入端) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                <h4 className="text-base font-black text-gray-800 flex items-center gap-2">
                   <Inbox size={18} className="text-blue-600"/> 申报表单信息【输入端】
                </h4>
              </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
              <div onClick={() => toggleSection('form-info')} className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Layout size={18} className="text-blue-500" />
                  <span className="text-sm font-black text-gray-800">表单字段拆分与数据关联详情</span>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded">共 {mockDetails.input.formInfo.length} 个字段</span>
                </div>
                {expandedIndices.includes('form-info') ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </div>
              {expandedIndices.includes('form-info') && (
                <div className="p-0 bg-white border-t border-gray-50">
                  <table className="w-full text-xs text-left">
                     <thead className="bg-[#f9fafc] text-gray-400 font-bold uppercase text-[10px] tracking-widest border-b border-gray-50">
                        <tr>
                          <th className="px-6 py-4 w-16 text-center">序号</th>
                          <th className="px-6 py-4">信息项名称</th>
                          <th className="px-6 py-4">接入状态</th>
                          <th className="px-6 py-4">关联资源目录 / 字段</th>
                          <th className="px-6 py-4">备注</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                        {mockDetails.input.formInfo.map((row, i) => (
                          <tr key={i} className="hover:bg-blue-50/10">
                            <td className="px-6 py-4 text-center text-gray-400 font-mono">{i+1}</td>
                            <td className="px-6 py-4 font-black text-gray-800">{row.name}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black ${row.linked === '是' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{row.linked}</span>
                            </td>
                            <td className="px-6 py-4 font-bold text-gray-700">
                              <div className="max-w-[350px] truncate">{row.resource}</div>
                              {row.field !== '--' && <div className="text-blue-500 text-[10px] mt-0.5">关联字段: {row.field}</div>}
                            </td>
                            <td className="px-6 py-4 text-gray-400 italic">{row.remark}</td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* 2. 申报材料信息 (输入端) */}
          <div className="space-y-4">
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
              <div onClick={() => toggleSection('materials-list')} className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-orange-500" />
                  <span className="text-sm font-black text-gray-800">申报材料要素（精细化拆分）</span>
                  <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-[10px] font-bold rounded">共 {mockDetails.input.materials.length} 份材料</span>
                </div>
                {expandedIndices.includes('materials-list') ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </div>
              {expandedIndices.includes('materials-list') && (
                <div className="p-0 bg-white border-t border-gray-50">
                  <table className="w-full text-xs text-left">
                     <thead className="bg-[#fcfaf9] text-gray-400 font-bold uppercase text-[10px] tracking-widest border-b border-gray-50">
                        <tr>
                          <th className="px-6 py-4 w-16 text-center">序号</th>
                          <th className="px-6 py-4">材料名称</th>
                          <th className="px-6 py-4 w-64">拆分要素点</th>
                          <th className="px-6 py-4">接入状态</th>
                          <th className="px-6 py-4">获取方式</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                        {mockDetails.input.materials.map((row, i) => (
                          <tr key={i} className="hover:bg-orange-50/10">
                            <td className="px-6 py-4 text-center text-gray-400 font-mono">{i+1}</td>
                            <td className="px-6 py-4 font-black text-gray-800">{row.name}</td>
                            <td className="px-6 py-4">
                              <div className="text-[10px] text-gray-500 leading-relaxed font-medium">
                                {row.fields}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black ${row.linked === '是' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{row.linked}</span>
                            </td>
                            <td className="px-6 py-4">
                               <div className="text-gray-700 font-bold">{row.access || '--'}</div>
                               <div className="text-[10px] text-gray-400 mt-0.5">{row.remark}</div>
                            </td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* 3. 办理结果信息 (输出端) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
                <h4 className="text-base font-black text-gray-800 flex items-center gap-2">
                   <Send size={18} className="text-indigo-600"/> 办理结果信息【输出端】
                </h4>
              </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
              <div onClick={() => toggleSection('output-info')} className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Database size={18} className="text-indigo-500" />
                  <span className="text-sm font-black text-gray-800">办理结果证明（数据共享回流）</span>
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded">共 {mockDetails.output.resultInfo.length} 项结果</span>
                </div>
                {expandedIndices.includes('output-info') ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </div>
              {expandedIndices.includes('output-info') && (
                <div className="p-0 bg-white border-t border-gray-50">
                  <table className="w-full text-xs text-left">
                     <thead className="bg-[#f9f9fc] text-gray-400 font-bold uppercase text-[10px] tracking-widest border-b border-gray-50">
                        <tr>
                          <th className="px-6 py-4 w-16 text-center">序号</th>
                          <th className="px-6 py-4">结果名称</th>
                          <th className="px-6 py-4">是否合规共享</th>
                          <th className="px-6 py-4">关联汇聚库 / 字段</th>
                          <th className="px-6 py-4">共享状态说明</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                        {mockDetails.output.resultInfo.map((row, i) => (
                          <tr key={i} className="hover:bg-indigo-50/10">
                            <td className="px-6 py-4 text-center text-gray-400 font-mono">{i+1}</td>
                            <td className="px-6 py-4 font-black text-gray-800">{row.name}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black ${row.linked === '是' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{row.linked}</span>
                            </td>
                            <td className="px-6 py-4 font-bold text-gray-700">
                              <div className="max-w-[350px] truncate">{row.resource}</div>
                              <div className="text-indigo-500 text-[10px] mt-0.5">目标字段: {row.field}</div>
                            </td>
                            <td className="px-6 py-4 text-gray-400 italic font-medium">{row.remark || '--'}</td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
          
          <div className="h-20"></div> {/* Bottom spacer */}
        </div>
      </div>
    </>
  );
};

const ItemManagement: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ServiceItem | null>(null);
  const [data] = useState<ServiceItem[]>([
    { id: 1, mainItem: '住房公积金贷款', subItem: '购买新建自住住房公积金贷款', processItem: '购买新建自住住房公积金贷款', splitProgress: 10, relateProgress: 10, exemptRate: 55.8, complianceRate: 82.0, updateTime: '2025-11-02' },
    { id: 2, mainItem: '住房公积金贷款', subItem: '购买再交易自住住房公积金贷款', processItem: '购买再交易自住住房公积金贷款', splitProgress: 100, relateProgress: 100, exemptRate: 100, complianceRate: 100, updateTime: '2025-11-02' },
    { id: 3, mainItem: '住房公积金贷款', subItem: '提前部分偿还住房公积金贷款', processItem: '提前部分偿还住房公积金贷款', splitProgress: 80, relateProgress: 80, exemptRate: 45.0, complianceRate: 75.5, updateTime: '2025-11-02' },
    { id: 4, mainItem: '住房公积金贷款', subItem: '提前还清住房公积金贷款', processItem: '提前还清住房公积金贷款', splitProgress: 80, relateProgress: 80, exemptRate: 62.3, complianceRate: 88.0, updateTime: '2025-11-02' },
    { id: 5, mainItem: '住房公积金贷款', subItem: '开具住房公积金个人住房贷款全部还...', processItem: '开具住房公积金个人住房贷款全部还...', splitProgress: 60, relateProgress: 60, exemptRate: 25.0, complianceRate: 40.0, updateTime: '2025-11-02' },
  ]);

  const handleViewDetails = (item: ServiceItem) => {
    setSelectedItem(item);
    setIsDrawerOpen(true);
  };

  const handleOpenSplitModal = (item: ServiceItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-800">政务服务事项管理</h2>
      <section className="bg-white p-6 rounded shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex items-center gap-2">
            <label className="text-sm whitespace-nowrap w-24 text-gray-600">事项主项</label>
            <input type="text" placeholder="请输入" className="flex-1 border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:border-blue-500 text-sm" />
          </div>
          <div className="flex justify-end items-center gap-4 col-span-full">
            <button className="px-6 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50 flex items-center gap-1 font-medium transition-colors">查询</button>
            <button className="px-6 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 font-medium transition-colors">重置</button>
          </div>
        </div>
      </section>

      <section className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-[#fafafa] text-gray-500 font-bold border-b border-gray-100 uppercase tracking-tight text-[11px]">
              <tr>
                <th className="px-4 py-4">序号</th>
                <th className="px-4 py-4">事项主项</th>
                <th className="px-4 py-4">办理项</th>
                <th className="px-4 py-4 text-center">拆分关联进度</th>
                <th className="px-4 py-4 text-center">表单免填报率</th>
                <th className="px-4 py-4 font-bold">更新时间</th>
                <th className="px-4 py-4 font-bold">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.map((item, idx) => (
                <tr key={item.id} className="hover:bg-blue-50/10 transition-colors">
                  <td className="px-4 py-4 text-gray-400 font-mono">{idx + 1}</td>
                  <td className="px-4 py-4 text-gray-800 font-medium">{item.mainItem}</td>
                  <td className="px-4 py-4 text-gray-800">{item.processItem}</td>
                  <td className="px-4 py-4 text-center min-w-[120px]"><ProgressBar percent={item.splitProgress} color="blue" /></td>
                  <td className="px-4 py-4 text-center min-w-[120px]"><ProgressBar percent={item.exemptRate} color="emerald" /></td>
                  <td className="px-4 py-4 text-gray-500">{item.updateTime}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-4 font-bold text-blue-600">
                      <button className="hover:text-blue-800 hover:underline transition-colors" onClick={() => handleViewDetails(item)}>查看</button>
                      <button className="hover:text-blue-800 hover:underline transition-colors" onClick={() => handleOpenSplitModal(item)}>拆分</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {isModalOpen && <ItemSplitModal onClose={() => setIsModalOpen(false)} />}
      <DetailsDrawer item={selectedItem} isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  );
};

export default ItemManagement;