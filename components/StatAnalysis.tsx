
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
  Tag
} from 'lucide-react';

// --- 类型定义 ---
interface OfficeStat {
  name: string;
  exemptItems: number;
  totalItems: number;
}

interface DeptStat {
  id: string;
  deptName: string;
  totalItems: number;
  exemptItems: number; 
  partialExemptItems: number; 
  totalMaterials: number;
  exemptMaterials: number; 
  sharingCompliant: number; 
  missingFields: number;
  offices?: OfficeStat[];
}

// --- 模拟数据 ---
const mockDeptData: DeptStat[] = [
  { 
    id: 'd1', deptName: '市公积金中心', totalItems: 42, exemptItems: 12, partialExemptItems: 25, totalMaterials: 156, exemptMaterials: 98, sharingCompliant: 38, missingFields: 5,
    offices: [
      { name: '归集管理处', exemptItems: 5, totalItems: 10 },
      { name: '贷款管理处', exemptItems: 4, totalItems: 20 },
      { name: '客户服务处', exemptItems: 3, totalItems: 12 },
    ]
  },
  { id: 'd2', deptName: '市人社局', totalItems: 85, exemptItems: 18, partialExemptItems: 42, totalMaterials: 320, exemptMaterials: 145, sharingCompliant: 62, missingFields: 12 },
  { id: 'd3', deptName: '市自然资源局', totalItems: 36, exemptItems: 5, partialExemptItems: 10, totalMaterials: 188, exemptMaterials: 42, sharingCompliant: 20, missingFields: 24 },
  { id: 'd4', deptName: '市医保局', totalItems: 28, exemptItems: 15, partialExemptItems: 8, totalMaterials: 92, exemptMaterials: 78, sharingCompliant: 25, missingFields: 3 },
  { id: 'd5', deptName: '市公安局', totalItems: 120, exemptItems: 45, partialExemptItems: 60, totalMaterials: 450, exemptMaterials: 310, sharingCompliant: 110, missingFields: 8 },
];

const mockCriticalMatters = [
  { name: '提取公积金支付首付款', currentExemptRate: 80, missing: 1, field: '购房合同电子证明' },
  { name: '灵活就业人员参保登记', currentExemptRate: 90, missing: 1, field: '居住证信息' },
  { name: '建筑起重机械备案', currentExemptRate: 75, missing: 2, field: '制造许可/特种设备证' },
  { name: '医疗机构设置审批', currentExemptRate: 85, missing: 1, field: '执业医师证' },
  { name: '高龄津贴申请', currentExemptRate: 95, missing: 1, field: '人脸建模数据' },
];

// Added missing mockFields data used on line 428
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
    // 1. 事项输出内容详情 (结果共享台账下钻)
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
               办理结果输出字段明细 (参考四张清单管理详情)
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

    // 2. 临界免办列表
    if (type === 'critical_list') {
      return (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700 font-bold">
            以下事项仅差 1-2 个材料字段即可实现“零材料免申报”，是数字化攻坚的重点事项。
          </div>
          <div className="grid grid-cols-1 gap-3">
             {mockCriticalMatters.map((m, i) => (
               <div key={i} className="bg-white border border-gray-100 rounded-xl p-5 flex items-center justify-between hover:border-blue-400 cursor-pointer shadow-sm transition-all" onClick={() => onSubDrillDown?.(m.name, 'input_detail', m)}>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-black text-gray-800">{m.name}</span>
                    <span className="text-[10px] text-orange-500 font-bold italic">瓶颈：{m.field} (缺位)</span>
                  </div>
                  <div className="flex items-center gap-6">
                     <div className="text-right">
                        <div className="text-[10px] text-gray-400 font-bold">当前免办进度</div>
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

    // 3. 事项输入关联详情 (从临界列表再次下钻)
    if (type === 'input_detail') {
      return (
        <div className="space-y-6">
           <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex items-start gap-4">
             <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shrink-0"><Layout size={20} /></div>
             <div>
               <h4 className="text-lg font-black text-gray-800">{title}</h4>
               <p className="text-xs text-gray-400 mt-1 font-bold">输入端材料字段关联详情</p>
             </div>
           </div>
           <div className="space-y-4">
              {['申报表', '证明文件'].map((m, idx) => (
                <div key={idx} className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                   <div className="bg-gray-50 px-5 py-3 border-b border-gray-100 flex justify-between items-center">
                      <span className="text-xs font-black text-gray-700">{m}</span>
                      <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded font-bold">包含 4 个字段</span>
                   </div>
                   <table className="w-full text-[11px] text-left">
                      <thead className="bg-white text-gray-400 font-bold border-b border-gray-50">
                        <tr><th className="px-5 py-3">信息项</th><th className="px-5 py-3">接入状态</th><th className="px-5 py-3">关联资源</th></tr>
                      </thead>
                      <tbody>
                        {[1,2].map(j => (
                           <tr key={j} className="border-b border-gray-50">
                              <td className="px-5 py-3 font-bold">字段名称-{j}</td>
                              <td className="px-5 py-3"><span className="text-green-600">已接入</span></td>
                              <td className="px-5 py-3 text-gray-400">共享交换平台接口-{j}</td>
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

    // 4. 单位下全量事项列表
    if (type === 'unit_items') {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
             <span className="text-sm font-black text-gray-500">该单位下共 42 项服务事项</span>
             <div className="flex gap-2">
               <span className="flex items-center gap-1.5 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">零材料免提交</span>
               <span className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-100">部分免提交</span>
             </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
             <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 text-gray-500 font-bold uppercase border-b border-gray-100">
                   <tr>
                     <th className="px-6 py-4">事项名称</th>
                     <th className="px-6 py-4">办理项</th>
                     <th className="px-6 py-4">免提交类型</th>
                     <th className="px-6 py-4 text-center">当前进度</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                   {[1,2,3,4,5,6,7,8].map(i => (
                     <tr key={i} className="hover:bg-blue-50/20 transition-colors">
                        <td className="px-6 py-4 font-bold text-gray-800">演示政务事项名称-{i}</td>
                        <td className="px-6 py-4 text-gray-500">业务办理项-{i}</td>
                        <td className="px-6 py-4">
                          {i % 3 === 0 ? (
                            <span className="bg-green-50 text-green-600 px-2 py-1 rounded text-[10px] font-black border border-green-100">零材料免提交</span>
                          ) : (
                            <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-[10px] font-black border border-blue-100">部分免提交</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="w-24 h-1.5 bg-gray-100 rounded-full mx-auto overflow-hidden">
                             <div className="h-full bg-blue-500" style={{ width: `${80 + i*2}%` }}></div>
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
}> = ({ label, value, description, icon, color, onClick }) => (
  <div 
    onClick={onClick}
    className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300"
  >
    <div className={`absolute -right-4 -top-4 w-24 h-24 opacity-[0.05] rounded-full group-hover:scale-110 transition-transform ${color.replace('text-', 'bg-')}`}></div>
    <div className="relative z-10 flex flex-col h-full justify-between">
      <div className="flex items-start justify-between mb-6">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color.replace('text-', 'bg-').replace('600', '100')} ${color}`}>
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

const StatAnalysis: React.FC = () => {
  const [selectedDeptId, setSelectedDeptId] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [detailModal, setDetailModal] = useState<{ isOpen: boolean; title: string; type: string; data?: any }>({ isOpen: false, title: '', type: '' });

  const totals = useMemo(() => {
    return mockDeptData.reduce((acc, curr) => ({
      depts: acc.depts + 1,
      items: acc.items + curr.totalItems,
      mats: acc.mats + curr.totalMaterials,
      exemptMats: acc.exemptMats + curr.exemptMaterials,
      exemptItems: acc.exemptItems + curr.exemptItems,
      partialExempt: acc.partialExempt + curr.partialExemptItems,
      sharing: acc.sharing + curr.sharingCompliant
    }), { depts: 0, items: 0, mats: 0, exemptMats: 0, exemptItems: 0, partialExempt: 0, sharing: 0 });
  }, []);

  const rankingData = useMemo(() => {
    if (selectedDeptId === 'all') {
      return [...mockDeptData].sort((a, b) => {
        const rateA = a.exemptItems / (a.totalItems || 1);
        const rateB = b.exemptItems / (b.totalItems || 1);
        return sortOrder === 'desc' ? rateB - rateA : rateA - rateB;
      }).map(d => ({ name: d.deptName, rate: (d.exemptItems / (d.totalItems || 1)) * 100 }));
    } else {
      const dept = mockDeptData.find(d => d.id === selectedDeptId);
      if (!dept || !dept.offices) return [];
      return [...dept.offices].sort((a, b) => {
        const rateA = a.exemptItems / (a.totalItems || 1);
        const rateB = b.exemptItems / (b.totalItems || 1);
        return sortOrder === 'desc' ? rateB - rateA : rateA - rateB;
      }).map(o => ({ name: o.name, rate: (o.exemptItems / (o.totalItems || 1)) * 100 }));
    }
  }, [selectedDeptId, sortOrder]);

  const openDrillDown = (title: string, type: string, data?: any) => {
    setDetailModal({ isOpen: true, title, type, data });
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-20 animate-in fade-in duration-700">
      {/* 头部标题与筛选 */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
            <BarChart3 className="text-blue-600" size={28} />
            政务服务事项-数据关联统计分析报告
          </h2>
          <p className="text-gray-400 text-sm mt-1 font-medium">以数据关联为核心，赋能事项免申报判定与共享合规监管，助推政务服务提质增效。</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
            <Building2 size={16} className="text-gray-400 mr-2" />
            <select 
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="bg-transparent text-sm font-bold text-gray-800 outline-none cursor-pointer"
            >
              <option value="all">全部部门</option>
              {mockDeptData.map(d => <option key={d.id} value={d.id}>{d.deptName}</option>)}
            </select>
          </div>
          <button className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
             <Download size={18} /> 下载报告
          </button>
        </div>
      </div>

      {/* 第一部分：核心指标卡片 (匹配图示) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FeatureCard 
          label="事项全量免提交率" value="30.5%" color="text-blue-600" icon={<ShieldCheck size={24} />} 
          description="事项下所有输入材料字段均已实现数据接入，申请人无需提交任何材料。"
          onClick={() => openDrillDown('全量免申报事项明细', 'unit_items')}
        />
        <FeatureCard 
          label="单材料免提交率" value="55.8%" color="text-emerald-600" icon={<FileText size={24} />} 
          description="在所有事项的输入材料中，完全由数据支撑、无需纸质件上传的比例。"
          onClick={() => openDrillDown('免提交材料明细', 'unit_items')}
        />
        <FeatureCard 
          label="结果共享合规率" value="82.0%" color="text-indigo-600" icon={<Share2 size={24} />} 
          description="事项办结后产生的输出文件，已全量关联至资源目录并实现回流。"
          onClick={() => openDrillDown('结果共享合规明细', 'item_detail')}
        />
        <FeatureCard 
          label="共享缺位事项数" value="56" color="text-orange-600" icon={<AlertCircle size={24} />} 
          description="应共享但未关联资源目录的事项，属于数据回流不完全的治理重点。"
          onClick={() => openDrillDown('共享缺位事项明细', 'item_detail')}
        />
      </section>

      {/* 第二部分：转化链路与效能排名 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* 输入端免办转化链路分析 */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <h3 className="text-xl font-black text-gray-800 flex items-center gap-3 mb-10">
             <TrendingUp className="text-blue-600" size={24} />
             输入端免办转化链路分析
          </h3>
          <div className="space-y-2">
            {[
              { label: '涉及部门数', value: totals.depts, width: 'w-full', color: 'bg-gray-50' },
              { label: '政务服务事项', value: totals.items, width: 'w-[92%]', color: 'bg-blue-50/50' },
              { label: '拆分输入材料', value: totals.mats, width: 'w-[82%]', color: 'bg-blue-100/40' },
              { label: '免提交材料数', value: totals.exemptMats, width: 'w-[68%]', color: 'bg-blue-200/40' },
              { label: '零材料免申报项', value: totals.exemptItems, width: 'w-[28%]', color: 'bg-blue-600 text-white shadow-lg shadow-blue-100' },
            ].map((step, i) => (
              <div key={i} className="flex items-center group cursor-pointer" onClick={() => openDrillDown(step.label, 'unit_items')}>
                 <div className="w-32 shrink-0 text-xs font-bold text-gray-400 group-hover:text-blue-600">{step.label}</div>
                 <div className={`h-11 ${step.width} ${step.color} rounded-r-lg flex items-center px-4 border-l-4 border-blue-500/20 group-hover:scale-[1.01] origin-left`}>
                    <span className="font-black text-sm">{step.value}</span>
                 </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 pt-10 border-t border-gray-50">
            <div>
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                <AlertCircle size={14} className="text-orange-500" /> 阻塞免办的关键字段
              </h4>
              <div className="space-y-2.5">
                {mockFields.map((f, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl hover:bg-blue-50 cursor-pointer group" onClick={() => openDrillDown(`${f.name} 影响事项`, 'unit_items')}>
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-gray-700">{f.name}</span>
                      <span className="text-[10px] text-gray-400 font-medium">{f.dept}</span>
                    </div>
                    <span className="text-xs font-black text-orange-600">涉及 {f.impact} 项</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
               <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <MoreHorizontal size={14} className="text-emerald-500" /> 临界免办能力透视
                  </h4>
                  <button onClick={() => openDrillDown('临界免办能力清单', 'critical_list')} className="text-[10px] text-blue-600 font-black hover:underline flex items-center gap-0.5">查看更多 <ChevronRight size={12} /></button>
               </div>
               <div className="bg-emerald-50/20 border border-emerald-100/50 rounded-2xl p-4 space-y-4">
                  {mockCriticalMatters.slice(0, 3).map((m, idx) => (
                    <div key={idx} className="flex flex-col gap-2 p-3 bg-white rounded-xl border border-emerald-100/50 hover:shadow-md cursor-pointer transition-shadow" onClick={() => openDrillDown(m.name, 'input_detail')}>
                      <div className="flex justify-between items-center text-[11px] font-black">
                        <span className="text-gray-700 truncate max-w-[140px]">{m.name}</span>
                        <span className="text-emerald-600">{m.currentExemptRate}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${m.currentExemptRate}%` }}></div>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>

        {/* 效能排行 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-gray-800 flex items-center gap-2">
              <CheckCircle2 className="text-indigo-500" size={20} />
              {selectedDeptId === 'all' ? '部门免办效能排行' : '科室免办效能排行'}
            </h3>
            <button onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')} className="p-2 text-gray-400">
              {sortOrder === 'desc' ? <ArrowDownAZ size={16} /> : <ArrowUpAZ size={16} />}
            </button>
          </div>
          <div className="space-y-4">
            {rankingData.map((item, idx) => (
              <div key={idx} className="p-4 bg-gray-50/50 hover:bg-white border border-transparent hover:border-gray-200 rounded-2xl cursor-pointer transition-all group" onClick={() => openDrillDown(`${item.name} 服务事项清单`, 'unit_items')}>
                <div className="flex justify-between items-center mb-2.5 text-sm font-black">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] ${idx < 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>{idx + 1}</span>
                    <span className="text-gray-700">{item.name}</span>
                  </div>
                  <span className="text-blue-600">{item.rate.toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 group-hover:bg-blue-500 transition-all" style={{ width: `${item.rate}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 第三部分：结果共享回流专题 */}
      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden border-t-4 border-t-indigo-600">
        <div className="grid grid-cols-1 lg:grid-cols-3">
          {/* 左侧：共享指标概览 (匹配现有文件风格) */}
          <div className="lg:col-span-1 p-8 border-b lg:border-b-0 lg:border-r border-gray-100 bg-indigo-50/10">
            <h3 className="text-xl font-black text-gray-800 flex items-center gap-3 mb-8">
               <Share2 className="text-indigo-600" size={24} />
               结果共享回流成效
            </h3>
            
            <div className="space-y-10">
               <div className="flex flex-col items-center py-6 relative">
                  <div className="relative w-44 h-44 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="88" cy="88" r="80" stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
                      <circle cx="88" cy="88" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-indigo-600" strokeDasharray={502} strokeDashoffset={502 * (1 - totals.sharing / (totals.items || 1))} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <span className="text-3xl font-black text-gray-800 tracking-tight">{((totals.sharing / (totals.items || 1)) * 100).toFixed(1)}%</span>
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
                    <p className="text-xl font-black text-red-500">56</p>
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
                       <span className="text-indigo-600 font-black text-xs">{(dept.sharingCompliant/(dept.totalItems||1)*100).toFixed(0)}%</span>
                    </div>
                  ))}
               </div>
            </div>
          </div>

          {/* 右侧：应汇未汇台账 */}
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
                  <p className="text-[11px] text-blue-700/70 leading-relaxed font-medium">建议优先治理 <strong>"整个目录未发布"</strong> 的高频证照类事项，预计可提升整体回流率 <strong>15%</strong>。</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 全局下钻弹出层 */}
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
