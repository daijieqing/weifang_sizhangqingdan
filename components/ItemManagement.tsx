
import React, { useState, useRef } from 'react';
import { RefreshCw, ListFilter, Settings, Info, X, FileText, ChevronDown, ChevronUp, CheckCircle2, AlertCircle, Layout, Calendar, Layers, FileCheck, PieChart, Activity, Share2, Target, BarChart3, FileOutput } from 'lucide-react';
import { ServiceItem } from '../types';
import ItemSplitModal from './ItemSplitModal';

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
      <span className="text-xs font-bold text-gray-500">{label}</span>
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
  const [expandedIndices, setExpandedIndices] = useState<number[]>([0]);

  if (!item) return null;

  const toggleSection = (idx: number) => {
    setExpandedIndices(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const mockSplitDetails = {
    inputs: [
      { 
        name: '购房首付款凭证', 
        count: 42, 
        relateProgress: 53,
        items: [
          { name: '姓名', linked: '是', resource: '购房首付款信息接口 - 姓名', remark: '--' },
          { name: '照片', linked: '否', resource: '--', remark: '电子证照中获取' },
          { name: '结婚证号', linked: '是', resource: '购房首付款信息接口 - 结婚证号', remark: '--' },
          { name: '身份证号', linked: '是', resource: '--', remark: '--' }
        ]
      },
      { 
        name: '居民户口簿', 
        count: 15, 
        relateProgress: 100,
        items: []
      }
    ],
    output: {
      hasResult: false,
      reason: '直接展示无办理结果的原因。'
    }
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div className={`fixed top-0 right-0 h-full w-[1100px] max-w-[95vw] bg-[#f4f7f9] shadow-2xl z-[1001] transition-transform duration-300 ease-out transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
        {/* Header */}
        <div className="h-14 px-8 border-b border-gray-200 flex items-center justify-between bg-white shrink-0 shadow-sm z-10">
          <h3 className="text-base font-bold text-gray-800 tracking-wide">事项拆分关联详情</h3>
          <button onClick={onClose} className="px-5 py-1.5 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-all font-semibold active:scale-95 shadow-sm">
            关闭
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin">
          {/* Main Info Card - Matches Screenshot */}
          <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-xl shadow-gray-200/40 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/30 rounded-full -mr-24 -mt-24 transition-transform group-hover:scale-110 duration-700"></div>
            <div className="flex flex-col gap-8 relative z-10">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200 shrink-0 transform transition-transform group-hover:rotate-3">
                  <Layout size={32} />
                </div>
                <div className="space-y-3 flex-1">
                  <h2 className="text-2xl font-extrabold text-gray-800 leading-tight">{item.processItem}</h2>
                  <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
                    <div className="flex items-center gap-2">
                      <Layers size={14} className="text-gray-400" />
                      <span className="text-[13px] text-gray-400 font-medium">事项主项:</span>
                      <span className="text-[13px] text-gray-700 font-bold">{item.mainItem}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileCheck size={14} className="text-gray-400" />
                      <span className="text-[13px] text-gray-400 font-medium">事项子项:</span>
                      <span className="text-[13px] text-gray-700 font-bold">{item.subItem}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400" />
                      <span className="text-[13px] text-gray-400 font-medium">更新时间:</span>
                      <span className="text-[13px] text-gray-700 font-bold font-mono">{item.updateTime} 12:00:00</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Metrics Row */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Activity size={18} className="text-blue-500" />
                  <span className="text-xs font-black text-gray-800 tracking-tight">业务指标监控</span>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <MetricCard label="拆分进度" value={item.splitProgress} color="blue" />
                  <MetricCard label="关联进度" value={item.relateProgress} color="orange" />
                  <MetricCard label="单材料免提交率" value={item.exemptRate} color="emerald" />
                  <MetricCard label="结果共享合规率" value={item.complianceRate} color="indigo" />
                </div>
              </div>
            </div>
          </div>

          {/* Input Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full shadow-sm shadow-blue-200"></div>
              <h4 className="text-base font-extrabold text-gray-800">申报材料信息【输入】</h4>
            </div>
            
            <div className="space-y-4">
              {mockSplitDetails.inputs.map((material, idx) => (
                <div key={idx} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
                  <div 
                    onClick={() => toggleSection(idx)}
                    className="flex items-center justify-between px-7 py-5 cursor-pointer bg-white hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-8">
                      <div className="flex items-center gap-4 min-w-[180px]">
                        <span className="w-7 h-7 flex items-center justify-center bg-gray-100 text-gray-500 rounded-lg text-xs font-black">{idx + 1}</span>
                        <span className="text-sm font-black text-gray-800 tracking-tight">{material.name}</span>
                      </div>
                      <div className="flex items-center gap-8 text-[11px] font-bold">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">信息项:</span>
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">{material.count}个</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">关联进度:</span>
                          <span className={`px-2 py-0.5 rounded-full ${material.relateProgress === 100 ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                            {material.relateProgress}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-black text-blue-500 hover:text-blue-700 transition-colors">
                      {expandedIndices.includes(idx) ? (
                        <>收起 <ChevronUp size={14} /></>
                      ) : (
                        <>展开 <ChevronDown size={14} /></>
                      )}
                    </div>
                  </div>
                  
                  {expandedIndices.includes(idx) && (
                    <div className="p-8 border-t border-gray-50 bg-[#fafbfc]">
                      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-sm text-left border-collapse">
                          <thead className="bg-[#f8f9fb] text-gray-500 font-bold border-b border-gray-100 uppercase text-[11px] tracking-widest">
                            <tr>
                              <th className="px-6 py-5 text-center w-24">序号</th>
                              <th className="px-6 py-5">信息项</th>
                              <th className="px-6 py-5">是否实现信息数据接入</th>
                              <th className="px-6 py-5">关联资源目录</th>
                              <th className="px-6 py-5">备注说明</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {material.items.length > 0 ? material.items.map((info, infoIdx) => (
                              <tr key={infoIdx} className="hover:bg-blue-50/20 transition-all group duration-200">
                                <td className="px-6 py-5 text-center text-gray-400 font-mono font-bold">{infoIdx + 1}</td>
                                <td className="px-6 py-5 text-gray-800 font-black">{info.name}</td>
                                <td className="px-6 py-5 text-center">
                                  <span className={`px-3 py-1.5 rounded-lg text-[11px] font-black ${info.linked === '是' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                    {info.linked}
                                  </span>
                                </td>
                                <td className="px-6 py-5 text-gray-700 font-bold">{info.resource}</td>
                                <td className="px-6 py-5 text-gray-400 text-[11px] italic font-medium">{info.remark}</td>
                              </tr>
                            )) : (
                              <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-400 italic">暂无拆分信息项</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Output Section - Matches Screenshot */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-indigo-600 rounded-full shadow-sm shadow-indigo-200"></div>
              <h4 className="text-base font-extrabold text-gray-800">办理结果信息【输出】</h4>
            </div>

            <div className="bg-white border border-gray-100 rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-md relative group overflow-hidden">
               <div className="absolute inset-0 bg-gray-50/30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
               <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100 shadow-inner">
                  <AlertCircle size={40} className="text-gray-300" />
               </div>
               <h5 className="text-lg font-black text-gray-800 mb-4">无办理结果反馈</h5>
               <div className="bg-[#f8f9fb] border border-gray-100 rounded-xl px-6 py-4 max-w-[400px]">
                  <p className="text-[13px] text-gray-500 leading-relaxed font-medium italic">
                    <span className="text-gray-400 block mb-1 font-bold not-italic">原因说明：</span>
                    {mockSplitDetails.output.reason}
                  </p>
               </div>
            </div>
          </div>
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

      {/* Filter Section */}
      <section className="bg-white p-6 rounded shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex items-center gap-2">
            <label className="text-sm whitespace-nowrap w-24 text-gray-600">事项主项</label>
            <input type="text" placeholder="请输入" className="flex-1 border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:border-blue-500 text-sm" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm whitespace-nowrap w-24 text-gray-600">事项子项</label>
            <input type="text" placeholder="请输入" className="flex-1 border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:border-blue-500 text-sm" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm whitespace-nowrap w-24 text-gray-600">事项办理项</label>
            <input type="text" placeholder="请输入" className="flex-1 border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:border-blue-500 text-sm" />
          </div>
          <div className="flex justify-end items-center gap-4 col-span-full">
            <button className="px-6 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50 flex items-center gap-1 font-medium transition-colors">查询</button>
            <button className="px-6 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 font-medium transition-colors">重置</button>
          </div>
        </div>
      </section>

      {/* Table Section */}
      <section className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button className="px-4 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50 font-medium transition-colors">批量导入</button>
            <button className="px-4 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50 font-medium transition-colors">导出数据</button>
          </div>
          <div className="flex items-center gap-4 text-gray-400">
            <RefreshCw size={18} className="cursor-pointer hover:text-blue-500 transition-colors" />
            <ListFilter size={18} className="cursor-pointer hover:text-blue-500 transition-colors" />
            <Settings size={18} className="cursor-pointer hover:text-blue-500 transition-colors" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-[#fafafa] text-gray-500 font-bold border-b border-gray-100 uppercase tracking-tight text-[11px]">
              <tr>
                <th className="px-4 py-4 font-bold">序号</th>
                <th className="px-4 py-4 font-bold">事项主项</th>
                <th className="px-4 py-4 font-bold">子项</th>
                <th className="px-4 py-4 font-bold">办理项</th>
                <th className="px-4 py-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    拆分进度
                    <Tooltip content="拆分进度根据输入输出文件中已进行拆分的文件数占总文件数的比例">
                      <Info size={14} className="text-gray-400 cursor-help" />
                    </Tooltip>
                  </div>
                </th>
                <th className="px-4 py-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    关联进度
                    <Tooltip content="关联进度按照信息项中已关联+有理由不关联的信息项/总信息项计算">
                      <Info size={14} className="text-gray-400 cursor-help" />
                    </Tooltip>
                  </div>
                </th>
                <th className="px-4 py-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    单材料免提交率
                    <Tooltip content="在所有事项的输入材料中，完全由数据支撑、无需纸质件上传的比例。">
                      <FileText size={14} className="text-emerald-500 cursor-help" />
                    </Tooltip>
                  </div>
                </th>
                <th className="px-4 py-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    结果共享合规率
                    <Tooltip content="事项办结后产生的输出文件，已全量关联至资源目录并实现回流。">
                      <Share2 size={14} className="text-indigo-500 cursor-help" />
                    </Tooltip>
                  </div>
                </th>
                <th className="px-4 py-4 font-bold">更新时间</th>
                <th className="px-4 py-4 font-bold">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.map((item, idx) => (
                <tr key={item.id} className="hover:bg-blue-50/10 transition-colors">
                  <td className="px-4 py-4 text-gray-400 font-mono">{idx + 1}</td>
                  <td className="px-4 py-4 text-gray-800 font-medium">{item.mainItem}</td>
                  <td className="px-4 py-4 text-gray-800">{item.subItem}</td>
                  <td className="px-4 py-4 text-gray-800">{item.processItem}</td>
                  <td className="px-4 py-4 text-center min-w-[120px]"><ProgressBar percent={item.splitProgress} color="blue" /></td>
                  <td className="px-4 py-4 text-center min-w-[120px]"><ProgressBar percent={item.relateProgress} color="orange" /></td>
                  <td className="px-4 py-4 text-center min-w-[120px]"><ProgressBar percent={item.exemptRate} color="emerald" /></td>
                  <td className="px-4 py-4 text-center min-w-[120px]"><ProgressBar percent={item.complianceRate} color="indigo" /></td>
                  <td className="px-4 py-4 text-gray-500">{item.updateTime}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-4 font-bold text-blue-600">
                      <button className="hover:text-blue-800 hover:underline transition-colors" onClick={() => handleViewDetails(item)}>查看</button>
                      <button className="hover:text-blue-800 hover:underline transition-colors" onClick={() => handleOpenSplitModal(item)}>拆分</button>
                      <button className="hover:text-blue-800 hover:underline transition-colors" onClick={() => handleOpenSplitModal(item)}>关联数据</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {isModalOpen && <ItemSplitModal onClose={() => setIsModalOpen(false)} />}
      <DetailsDrawer 
        item={selectedItem} 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
    </div>
  );
};

export default ItemManagement;
