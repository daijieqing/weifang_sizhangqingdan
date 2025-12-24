
import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Layers, 
  Building2, 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  TrendingUp, 
  ChevronRight, 
  AlertCircle, 
  Filter, 
  X, 
  FileSearch, 
  ArrowDownAZ, 
  ArrowUpAZ,
  Search,
  Database,
  Share2,
  Info,
  HelpCircle,
  MoreHorizontal,
  Layout,
  FileCheck,
  Calendar,
  Activity,
  PieChart,
  Download,
  ExternalLink,
  Tag,
  ClipboardList,
  Zap,
  ChevronDown
} from 'lucide-react';

// --- 类型定义 ---
interface OfficeStat {
  name: string;
  splitProgress: number;
  relateProgress: number;
  exemptRate: number;
  complianceRate: number;
  totalItems: number;
}

interface DeptStat {
  id: string;
  deptName: string;
  totalItems: number;
  // 四大指标平均值
  splitProgress: number; 
  relateProgress: number; 
  exemptRate: number; 
  complianceRate: number;
  // 共享缺位
  missingItems: number;
  offices?: OfficeStat[];
}

// --- 模拟数据 ---
const mockDeptData: DeptStat[] = [
  { 
    id: 'd1', deptName: '市公积金中心', totalItems: 42, 
    splitProgress: 65, relateProgress: 58, exemptRate: 55, complianceRate: 82, 
    missingItems: 5,
    offices: [
      { name: '归集管理处', splitProgress: 80, relateProgress: 70, exemptRate: 75, complianceRate: 90, totalItems: 10 },
      { name: '贷款管理处', splitProgress: 40, relateProgress: 35, exemptRate: 30, complianceRate: 70, totalItems: 20 },
      { name: '客户服务处', splitProgress: 90, relateProgress: 85, exemptRate: 88, complianceRate: 95, totalItems: 12 },
    ]
  },
  { id: 'd2', deptName: '市人社局', totalItems: 85, splitProgress: 52, relateProgress: 45, exemptRate: 42, complianceRate: 62, missingItems: 12 },
  { id: 'd3', deptName: '市自然资源局', totalItems: 36, splitProgress: 30, relateProgress: 25, exemptRate: 20, complianceRate: 45, missingItems: 24 },
  { id: 'd4', deptName: '市医保局', totalItems: 28, splitProgress: 85, relateProgress: 78, exemptRate: 75, complianceRate: 88, missingItems: 3 },
  { id: 'd5', deptName: '市公安局', totalItems: 120, splitProgress: 78, relateProgress: 72, exemptRate: 68, complianceRate: 75, missingItems: 8 },
];

const mockCriticalMatters = [
  { name: '提取公积金支付首付款', currentExemptRate: 80, missing: 1, field: '购房合同电子证明' },
  { name: '灵活就业人员参保登记', currentExemptRate: 90, missing: 1, field: '居住证信息' },
  { name: '建筑起重机械备案', currentExemptRate: 75, missing: 2, field: '制造许可/特种设备证' },
  { name: '医疗机构设置审批', currentExemptRate: 85, missing: 1, field: '执业医师证' },
  { name: '高龄津贴申请', currentExemptRate: 95, missing: 1, field: '人脸建模数据' },
];

const mockFields = [
  { name: '婚姻状况', dept: '市民政局', impact: 12 },
  { name: '不动产登记号', dept: '市自然资源局', impact: 8 },
  { name: '社保缴纳月数', dept: '市人社局', impact: 15 },
  { name: '车辆识别代号', dept: '市公安局', impact: 5 },
  { name: '电子健康档案', dept: '市卫健委', impact: 9 },
];

// --- 子组件：下钻详情模态框 ---
const DetailModal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; type: string; data?: any; onSubDrillDown?: (title: string, type: string, data: any) => void }> = ({ isOpen, onClose, title, type, data, onSubDrillDown }) => {
  if (!isOpen) return null;

  const renderContent = () => {
    if (type === 'item_detail') {
      return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex items-start gap-5 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/40 rounded-full -mr-16 -mt-16"></div>
             <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-100">
               <Share2 size={24} />
             </div>
             <div className="flex-1">
               <h4 className="text-xl font-black text-gray-800 mb-2">{title}</h4>
               <div className="flex flex-wrap gap-6 text-xs text-gray-500 font-medium">
                  <span className="flex items-center gap-1.5"><Building2 size={14}/> 责任单位: {data?.dept || '政务部门'}</span>
                  <span className="flex items-center gap-1.5"><Tag size={14}/> 合规状态: <span className="text-red-500 font-bold">{data?.reason || '待治理'}</span></span>
               </div>
             </div>
          </div>
          <div className="space-y-4">
             <h5 className="text-sm font-black text-gray-800 flex items-center gap-2">
               <Database size={16} className="text-indigo-600" />
               办理结果输出字段明细
             </h5>
             <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-xs text-left">
                   <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-widest border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4">结果信息项</th>
                        <th className="px-6 py-4">是否回流接入</th>
                        <th className="px-6 py-4">关联目录/接口名称</th>
                        <th className="px-6 py-4">备注说明</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50">
                      {['办理结果证明', '电子执照', '审批决定书'].map((f, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-bold text-gray-700">{f}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black ${i === 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                              {i === 0 ? '已接入' : '未接入'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-500 font-mono">{i === 0 ? 'RES_API_SYNC_2025' : '--'}</td>
                          <td className="px-6 py-4 text-gray-400 italic">系统回流同步中...</td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        </div>
      );
    }
    if (type === 'critical_list') {
      return (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700 font-bold">
            这些事项已完成大部分拆分，仅需补齐关键关联即可实现免办。
          </div>
          <div className="grid grid-cols-1 gap-3">
             {mockCriticalMatters.map((m, i) => (
               <div key={i} className="bg-white border border-gray-100 rounded-xl p-5 flex items-center justify-between hover:border-blue-400 cursor-pointer shadow-sm transition-all" onClick={() => onSubDrillDown?.(m.name, 'input_detail', m)}>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-black text-gray-800">{m.name}</span>
                    <span className="text-[10px] text-orange-500 font-bold italic">缺位：{m.field}</span>
                  </div>
                  <div className="flex items-center gap-6">
                     <div className="text-right">
                        <div className="text-[10px] text-gray-400 font-bold">目前进度</div>
                        <div className="text-sm font-black text-blue-600">{m.currentExemptRate}%</div>
                     </div>
                     <ChevronRight size={18} className="text-gray-300" />
                  </div>
               </div>
             ))}
          </div>
        </div>
      );
    }
    if (type === 'input_detail') {
      return (
        <div className="space-y-6">
           <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex items-start gap-4">
             <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shrink-0"><Layout size={20} /></div>
             <div>
               <h4 className="text-lg font-black text-gray-800">{title}</h4>
               <p className="text-xs text-gray-400 mt-1 font-bold">表单字段与材料要素接入详情</p>
             </div>
           </div>
           <div className="space-y-4">
              {['申报表单 (字段组)', '必需材料要素'].map((m, idx) => (
                <div key={idx} className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                   <div className="bg-gray-50 px-5 py-3 border-b border-gray-100 flex justify-between items-center">
                      <span className="text-xs font-black text-gray-700">{m}</span>
                   </div>
                   <table className="w-full text-[11px] text-left">
                      <thead className="bg-white text-gray-400 font-bold border-b border-gray-50">
                        <tr><th className="px-5 py-3">名称</th><th className="px-5 py-3">接入状态</th><th className="px-5 py-3">关联资源</th></tr>
                      </thead>
                      <tbody>
                        {[1,2].map(j => (
                           <tr key={j} className="border-b border-gray-50">
                              <td className="px-5 py-3 font-bold">要素-{j}</td>
                              <td className="px-5 py-3"><span className="text-green-600 font-bold">已接入</span></td>
                              <td className="px-5 py-3 text-gray-400 italic">资源目录_V2.0_{j}</td>
                           </tr>
                        ))}
                      </tbody>
                   </table>
                </div>
              ))}
           </div>
        </div>
      );
    }
    if (type === 'unit_items') {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
             <span className="text-sm font-black text-gray-500">事项清单列表</span>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
             <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 text-gray-500 font-bold uppercase border-b border-gray-100">
                   <tr>
                     <th className="px-6 py-4">事项办理项</th>
                     <th className="px-6 py-4">免填报/免提交状态</th>
                     <th className="px-6 py-4 text-center">整体进度</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                   {[1,2,3,4,5,6,7,8].map(i => (
                     <tr key={i} className="hover:bg-blue-50/20 transition-colors">
                        <td className="px-6 py-4 font-bold text-gray-800">政务服务演示事项-{i}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {i % 2 === 0 && <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[10px] font-black border border-emerald-100">免填报</span>}
                            {i % 3 === 0 && <span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded text-[10px] font-black border border-orange-100">免提交</span>}
                            {i % 2 !== 0 && i % 3 !== 0 && <span className="text-gray-400 text-[10px]">待治理</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="w-24 h-1.5 bg-gray-100 rounded-full mx-auto overflow-hidden">
                             <div className="h-full bg-blue-500" style={{ width: `${60 + i*4}%` }}></div>
                          </div>
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-[950px] h-full bg-[#f8f9fb] shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
        <div className="h-16 px-8 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
          <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
            <FileSearch className="text-blue-600" size={20} />
            {title}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

// --- 指标卡片 (匹配图示风格) ---
const FeatureCard: React.FC<{ 
  label: string; 
  value: string; 
  description: string; 
  icon: React.ReactNode; 
  color: string; 
  onClick?: () => void;
}> = ({ label, value, description, icon, color, onClick }) => {
  const getIconBgColor = (textCol: string) => {
    if (textCol.includes('blue')) return 'bg-blue-100 text-blue-600';
    if (textCol.includes('orange')) return 'bg-orange-100 text-orange-600';
    if (textCol.includes('emerald')) return 'bg-emerald-100 text-emerald-600';
    if (textCol.includes('indigo')) return 'bg-indigo-100 text-indigo-600';
    if (textCol.includes('red')) return 'bg-red-100 text-red-600';
    return 'bg-gray-100 text-gray-600';
  };

  const getOverlayColor = (textCol: string) => {
    if (textCol.includes('blue')) return 'bg-blue-500';
    if (textCol.includes('orange')) return 'bg-orange-500';
    if (textCol.includes('emerald')) return 'bg-emerald-500';
    if (textCol.includes('indigo')) return 'bg-indigo-500';
    if (textCol.includes('red')) return 'bg-red-500';
    return 'bg-gray-500';
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300 min-h-[220px]"
    >
      <div className={`absolute -right-4 -top-4 w-24 h-24 opacity-[0.05] rounded-full group-hover:scale-110 transition-transform ${getOverlayColor(color)}`}></div>
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex items-start justify-between mb-6">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${getIconBgColor(color)}`}>
            {icon}
          </div>
        </div>
        <div>
          <h4 className="text-gray-400 text-xs font-bold mb-2">{label}</h4>
          <div className="text-[28px] font-black text-gray-800 leading-none mb-4">{value}</div>
          <p className="text-[11px] text-gray-400 leading-relaxed font-medium italic">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

const StatAnalysis: React.FC = () => {
  const [selectedDeptId, setSelectedDeptId] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('2025');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [detailModal, setDetailModal] = useState<{ isOpen: boolean; title: string; type: string; data?: any }>({ isOpen: false, title: '', type: '' });
  const [isDownloading, setIsDownloading] = useState(false);

  // 聚合计算五大指标
  const totals = useMemo(() => {
    const filteredData = selectedDeptId === 'all' ? mockDeptData : mockDeptData.filter(d => d.id === selectedDeptId);
    const count = filteredData.length;
    
    const initialSums = { split: 0, relate: 0, exempt: 0, compliance: 0, missing: 0 };
    const sums = filteredData.reduce((acc, curr) => ({
      split: acc.split + curr.splitProgress,
      relate: acc.relate + curr.relateProgress,
      exempt: acc.exempt + curr.exemptRate,
      compliance: acc.compliance + curr.complianceRate,
      missing: acc.missing + curr.missingItems
    }), initialSums);

    return { ...sums, count };
  }, [selectedDeptId]);

  const avgMetrics = {
    split: (totals.split / (totals.count || 1)).toFixed(1),
    relate: (totals.relate / (totals.count || 1)).toFixed(1),
    exempt: (totals.exempt / (totals.count || 1)).toFixed(1),
    compliance: (totals.compliance / (totals.count || 1)).toFixed(1),
    missing: totals.missing
  };

  const rankingData = useMemo(() => {
    if (selectedDeptId === 'all') {
      return [...mockDeptData].sort((a, b) => {
        const scoreA = (a.exemptRate + a.relateProgress) / 2;
        const scoreB = (b.exemptRate + b.relateProgress) / 2;
        return sortOrder === 'desc' ? scoreB - scoreA : scoreA - scoreB;
      }).map(d => ({ name: d.deptName, rate: (d.exemptRate + d.relateProgress) / 2 }));
    } else {
      const dept = mockDeptData.find(d => d.id === selectedDeptId);
      if (!dept || !dept.offices) return [];
      return [...dept.offices].sort((a, b) => {
        const scoreA = (a.exemptRate + a.relateProgress) / 2;
        const scoreB = (b.exemptRate + b.relateProgress) / 2;
        return sortOrder === 'desc' ? scoreB - scoreA : scoreA - scoreB;
      }).map(o => ({ name: o.name, rate: (o.exemptRate + o.relateProgress) / 2 }));
    }
  }, [selectedDeptId, sortOrder]);

  const openDrillDown = (title: string, type: string, data?: any) => {
    setDetailModal({ isOpen: true, title, type, data });
  };

  const handleDownloadReport = () => {
    setIsDownloading(true);
    // 模拟下载过程
    setTimeout(() => {
      setIsDownloading(false);
      alert('报告生成成功，正在下载中...');
    }, 1500);
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-20 animate-in fade-in duration-700">
      {/* 头部标题与筛选 */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
            <BarChart3 className="text-blue-600" size={28} />
            事项要素关联与免办成效分析报告
          </h2>
          <p className="text-gray-400 text-sm mt-1 font-medium italic">以“四张清单”拆分为基础，动态监控表单免填报、材料免提交及结果共享合规情况。</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* 年份选择 */}
          <div className="flex items-center bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm hover:border-blue-300 transition-colors">
            <Calendar size={16} className="text-gray-400 mr-2" />
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-transparent text-sm font-bold text-gray-800 outline-none cursor-pointer pr-2"
            >
              <option value="2025">2025 年度</option>
              <option value="2024">2024 年度</option>
              <option value="2023">2023 年度</option>
            </select>
          </div>

          {/* 部门选择 */}
          <div className="flex items-center bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm hover:border-blue-300 transition-colors">
            <Building2 size={16} className="text-gray-400 mr-2" />
            <select 
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="bg-transparent text-sm font-bold text-gray-800 outline-none cursor-pointer"
            >
              <option value="all">全市各部门平均</option>
              {mockDeptData.map(d => <option key={d.id} value={d.id}>{d.deptName}</option>)}
            </select>
          </div>

          {/* 下载按钮 */}
          <button 
            onClick={handleDownloadReport}
            disabled={isDownloading}
            className={`flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 ${isDownloading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isDownloading ? (
              <Activity size={18} className="animate-spin" />
            ) : (
              <Download size={18} />
            )}
            {isDownloading ? '正在生成...' : '下载分析报告'}
          </button>
        </div>
      </div>

      {/* 第一部分：五大指标卡片 */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <FeatureCard 
          label="拆分关联进度" value={`${avgMetrics.split}%`} color="text-blue-600" icon={<Activity size={24} />} 
          description="已填写的输入输出文件信息占全部输入输出文件比例。"
          onClick={() => openDrillDown('拆分进度明细', 'unit_items')}
        />
        <FeatureCard 
          label="单材料免提交率" value={`${avgMetrics.relate}%`} color="text-orange-600" icon={<FileText size={24} />} 
          description="申报材料文件中有接入的数量占全部申报材料文件数比例。"
          onClick={() => openDrillDown('材料接入明细', 'unit_items')}
        />
        <FeatureCard 
          label="表单免填报率" value={`${avgMetrics.exempt}%`} color="text-emerald-600" icon={<Zap size={24} />} 
          description="表单中已关联资源目录的字段占总字段的比例，实现自动填充。"
          onClick={() => openDrillDown('免填报字段明细', 'unit_items')}
        />
        <FeatureCard 
          label="结果共享合规率" value={`${avgMetrics.compliance}%`} color="text-indigo-600" icon={<Share2 size={24} />} 
          description="办理结果信息项关联数据目录的数量占信息项总数的比例。"
          onClick={() => openDrillDown('共享合规明细', 'item_detail')}
        />
        <FeatureCard 
          label="共享缺位事项数" value={avgMetrics.missing.toString()} color="text-red-500" icon={<AlertCircle size={24} />} 
          description="应共享但未关联资源目录的事项，数据回流治理的重点。"
          onClick={() => openDrillDown('共享缺位台账', 'item_detail')}
        />
      </section>

      {/* 第二部分：输入端分析与转化排行 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
          <h3 className="text-xl font-black text-gray-800 flex items-center gap-3 mb-10">
             <TrendingUp className="text-blue-600" size={24} />
             “免填办”转化链路透视（输入端）
          </h3>
          <div className="space-y-3">
            {[
              { label: '纳管政务事项', value: '311 项', width: 'w-full', color: 'bg-gray-50' },
              { label: '已完成精细拆分', value: '258 项', width: 'w-[85%]', color: 'bg-blue-50/50' },
              { label: '表单字段全关联', value: '182 项', width: 'w-[65%]', color: 'bg-emerald-50 text-emerald-700', icon: <Zap size={14} className="mr-1 inline"/>, sub: '实现“免填报”' },
              { label: '材料要素全接入', value: '145 项', width: 'w-[48%]', color: 'bg-orange-50 text-orange-700', icon: <FileCheck size={14} className="mr-1 inline"/>, sub: '实现“免提交”' },
              { label: '双重免办(零材料)', value: '92 项', width: 'w-[32%]', color: 'bg-blue-600 text-white shadow-lg shadow-blue-100', sub: '极致化服务' },
            ].map((step, i) => (
              <div key={i} className="flex items-center group cursor-pointer" onClick={() => openDrillDown(step.label, 'unit_items')}>
                 <div className="w-32 shrink-0 text-xs font-bold text-gray-400 group-hover:text-blue-600 leading-tight">{step.label}</div>
                 <div className={`h-12 ${step.width} ${step.color} rounded-r-2xl flex items-center justify-between px-6 border-l-4 border-blue-500/20 group-hover:scale-[1.01] transition-all origin-left`}>
                    <span className="font-black text-sm">{step.value}</span>
                    {step.sub && <span className="text-[10px] font-black opacity-80 italic">{step.sub}</span>}
                 </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 pt-10 border-t border-gray-50">
            <div>
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                <AlertCircle size={14} className="text-red-400" /> 影响“表单免填报”的关键字段瓶颈
              </h4>
              <div className="space-y-2.5">
                {mockFields.map((f, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl hover:bg-blue-50 cursor-pointer group transition-colors" onClick={() => openDrillDown(f.name, 'unit_items')}>
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-gray-700">{f.name}</span>
                      <span className="text-[10px] text-gray-400 font-medium">{f.dept}</span>
                    </div>
                    <span className="text-[10px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-full">阻塞 {f.impact} 项</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
               <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Zap size={14} className="text-blue-500" /> 临界转化攻坚事项 (差一步零材料)
                  </h4>
               </div>
               <div className="bg-blue-50/20 border border-blue-100/50 rounded-2xl p-4 space-y-4">
                  {mockCriticalMatters.slice(0, 3).map((m, idx) => (
                    <div key={idx} className="flex flex-col gap-2 p-3 bg-white rounded-xl border border-blue-100 hover:shadow-md cursor-pointer transition-all" onClick={() => openDrillDown(m.name, 'input_detail')}>
                      <div className="flex justify-between items-center text-[11px] font-black">
                        <span className="text-gray-700 truncate max-w-[140px]">{m.name}</span>
                        <span className="text-blue-600">{m.currentExemptRate}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: `${m.currentExemptRate}%` }}></div>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-gray-800 flex items-center gap-2">
              <CheckCircle2 className="text-blue-600" size={20} />
              部门/科室“免办”综合效能排行
            </h3>
            <button onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')} className="p-2 text-gray-400">
              {sortOrder === 'desc' ? <ArrowDownAZ size={16} /> : <ArrowUpAZ size={16} />}
            </button>
          </div>
          <div className="space-y-4">
            {rankingData.map((item, idx) => (
              <div key={idx} className="p-4 bg-gray-50/50 hover:bg-white border border-transparent hover:border-gray-200 rounded-2xl cursor-pointer transition-all group" onClick={() => openDrillDown(item.name, 'unit_items')}>
                <div className="flex justify-between items-center mb-2.5 text-sm font-black">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] ${idx < 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>{idx + 1}</span>
                    <span className="text-gray-700">{item.name}</span>
                  </div>
                  <span className="text-blue-600 font-mono italic">{item.rate.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 group-hover:bg-blue-500 transition-all" style={{ width: `${item.rate}%` }}></div>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-8 text-[10px] text-gray-400 italic font-bold">排行算法：基于(表单免填报率 + 材料免提交率)之和的均值进行计算，客观反映各部门数据赋能业务的深度。</p>
        </div>
      </div>

      {/* 第三部分：结果共享回流专题 */}
      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden border-t-4 border-t-indigo-600">
        <div className="grid grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-1 p-8 border-b lg:border-b-0 lg:border-r border-gray-100 bg-indigo-50/10">
            <h3 className="text-xl font-black text-gray-800 flex items-center gap-3 mb-8">
               <Share2 className="text-indigo-600" size={24} />
               结果共享回流成效 (输出端)
            </h3>
            <div className="space-y-10">
               <div className="flex flex-col items-center py-6 relative">
                  <div className="relative w-44 h-44 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="88" cy="88" r="80" stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
                      <circle cx="88" cy="88" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-indigo-600" strokeDasharray={502} strokeDashoffset={502 * (1 - parseFloat(avgMetrics.compliance)/100)} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <span className="text-3xl font-black text-gray-800 tracking-tight">{avgMetrics.compliance}%</span>
                       <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">共享合规率</span>
                    </div>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-2xl border border-blue-100 shadow-sm text-center">
                    <p className="text-[10px] text-gray-400 font-black mb-1">已合规事项</p>
                    <p className="text-xl font-black text-blue-600">255</p>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-red-100 shadow-sm text-center">
                    <p className="text-[10px] text-gray-400 font-black mb-1">应汇未汇</p>
                    <p className="text-xl font-black text-red-500">{avgMetrics.missing}</p>
                  </div>
               </div>
               <div className="space-y-3 pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">共享效能部门榜</h4>
                    <button className="text-indigo-600 text-[10px] font-black hover:underline" onClick={() => openDrillDown('共享排行', 'unit_items')}>更多</button>
                  </div>
                  {mockDeptData.slice(0, 3).map((dept, i) => (
                    <div key={i} className="flex items-center justify-between py-2.5 px-4 bg-white rounded-xl border border-gray-50 shadow-sm">
                       <span className="text-xs font-bold text-gray-700">{dept.deptName}</span>
                       <span className="text-indigo-600 font-black text-xs">{dept.complianceRate.toFixed(0)}%</span>
                    </div>
                  ))}
               </div>
            </div>
          </div>
          <div className="lg:col-span-2 p-8 flex flex-col">
            <h3 className="text-lg font-black text-gray-800 flex items-center gap-3 mb-8 tracking-tight">
               <Database size={22} className="text-indigo-600" />
               结果共享“应汇未汇”明细台账
            </h3>
            <div className="flex-1 overflow-x-auto rounded-2xl border border-gray-100 bg-[#fafbfc]/30 p-2">
               <table className="w-full text-sm text-left">
                  <thead className="text-gray-400 font-bold uppercase text-[10px] tracking-widest bg-white/50">
                    <tr><th className="px-6 py-4">事项名称</th><th className="px-6 py-4">责任单位</th><th className="px-6 py-4">合规缺失主因</th><th className="px-6 py-4 text-center">操作</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {[
                      { item: '建筑施工许可核发', dept: '市住建局', reason: '部分输出字段缺失' },
                      { item: '特种设备作业人员考核', dept: '市监管局', reason: '整个目录未发布' },
                      { item: '医疗机构设置审批', dept: '市卫健委', reason: '部分输出字段缺失' },
                      { item: '不动产登记证换发', dept: '市规资局', reason: '整个目录未发布' },
                    ].map((row, idx) => (
                      <tr key={idx} className="bg-white hover:bg-indigo-50/30 transition-all group">
                        <td className="px-6 py-4">
                           <div className="font-bold text-gray-800 group-hover:text-indigo-600">{row.item}</div>
                           <div className="text-[10px] text-gray-400 mt-0.5 font-mono">GOV-REG-{2025+idx}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 font-medium text-xs">{row.dept}</td>
                        <td className="px-6 py-4">
                           <span className={`px-3 py-1 rounded-lg text-[10px] font-black border ${row.reason.includes('整个') ? 'bg-red-50 text-red-600 border-red-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>{row.reason}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                           <button onClick={() => openDrillDown(row.item, 'item_detail', row)} className="text-blue-600 hover:underline font-black text-xs">查看详情</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
            <div className="mt-8 p-6 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-start gap-4">
               <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md shrink-0"><Share2 className="text-blue-600" size={20} /></div>
               <div className="flex-1">
                  <h4 className="text-xs font-black text-blue-900 mb-1 flex items-center gap-2">共享治理决策建议</h4>
                  <p className="text-[11px] text-blue-700/70 leading-relaxed font-medium">建议优先治理 <strong>"整个目录未发布"</strong> 的高频证照类事项，通过自动化关联工具补齐输出项，预计可提升整体回流合规率 <strong>12%</strong>。</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      <DetailModal 
        isOpen={detailModal.isOpen} 
        onClose={() => setDetailModal(prev => ({ ...prev, isOpen: false }))}
        title={detailModal.title}
        type={detailModal.type}
        data={detailModal.data}
        onSubDrillDown={(t, ty, d) => openDrillDown(t, ty, d)}
      />
    </div>
  );
};

export default StatAnalysis;
