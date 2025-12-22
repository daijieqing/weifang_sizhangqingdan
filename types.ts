
import React from 'react';

export interface ServiceItem {
  id: number;
  mainItem: string;
  subItem: string;
  processItem: string;
  splitProgress: number;
  relateProgress: number;
  exemptRate: number; // 单材料免提交率
  complianceRate: number; // 结果共享合规率
  updateTime: string;
}

export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}
