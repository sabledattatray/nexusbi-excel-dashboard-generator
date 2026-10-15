import React from 'react';
import { ArrowUpRight, BarChart3, ChevronRight, Download, FileSpreadsheet, LayoutDashboard, Layers3, RefreshCw, Settings2, Table2, TrendingUp, Upload, PanelLeft, CircleCheck, ChartNoAxesCombined, FolderOpen } from 'lucide-react';
import { DatasetConfig } from '../types/dataset';
interface NavbarProps {
 config: DatasetConfig; onOpenCustomizer: () => void; onOpenUploadModal: () => void; onDownloadExcel: () => void; isDownloading: boolean; onRegenerateData: () => void;
 activeTab: 'dashboard' | 'excel-preview' | 'pivot' | 'transactions' | 'regions' | 'products' | 'customers';
 setActiveTab: (tab: NavbarProps['activeTab']) => void; isCustomDataActive?: boolean;
}
export const Navbar: React.FC<NavbarProps> = ({ config, onOpenCustomizer, onOpenUploadModal, onDownloadExcel, isDownloading, onRegenerateData, activeTab, setActiveTab, isCustomDataActive }) => {
 const views: { id: NavbarProps['activeTab']; label: string; icon: typeof LayoutDashboard }[] = [
  { id:'dashboard', label:'Overview', icon: LayoutDashboard }, { id:'excel-preview', label:'Excel view', icon: FileSpreadsheet },
  { id:'pivot', label:'Grouped analysis', icon: Layers3 }, { id:'transactions', label:'Source records', icon: Table2 },
  { id:'regions', label:'Time trends', icon: TrendingUp }, { id:'products', label:'Category analysis', icon: BarChart3 },
  { id:'customers', label:'Field verification', icon: CircleCheck },
 ];
 return <>
  <aside className="workspace-sidebar">
   <a href="#main-content" className="brand-lockup"><span className="brand-symbol"><ChartNoAxesCombined size={23}/></span><span>Nexus<span className="brand-bi">BI</span><small>ANALYTICS WORKSPACE</small></span></a>
   <div className="sidebar-workspace"><span className="workspace-avatar">N</span><div><strong>Your workspace</strong><small>Excel intelligence</small></div><ChevronRight size={15}/></div>
   <div className="sidebar-label">WORKSPACE</div>
   <nav aria-label="Workspace navigation" className="sidebar-nav">{views.map(({id,label,icon:Icon}) => <button key={id} aria-current={activeTab===id ? 'page' : undefined} className={activeTab===id ? 'nav-item active' : 'nav-item'} onClick={() => setActiveTab(id)}><Icon size={18}/><span>{label}</span>{activeTab===id && <span className="nav-active-dot"/>}</button>)}</nav>
   <div className="sidebar-label sidebar-tools-label">TOOLS</div>
   <button className="nav-item" onClick={onOpenUploadModal}><Upload size={18}/>Import a dataset<ArrowUpRight size={14} className="ml-auto"/></button>
   <button className="nav-item" onClick={onOpenCustomizer}><Settings2 size={18}/>Report settings</button>
   <div className="sidebar-bottom"><div className="sidebar-note"><FolderOpen size={22}/><strong>From spreadsheet<br/>to the bigger picture.</strong><p>Explore your data. Find the story. Take it to Excel.</p><button onClick={onOpenUploadModal}>Add your data <span>+</span></button></div><div className="sidebar-signature"><span className="workspace-avatar">DS</span><div><strong>Built by Datta Sable</strong><small>Independent analytics tools</small></div></div></div>
  </aside>
  <header className="workspace-topbar"><div className="breadcrumb"><PanelLeft size={17}/><span>Workspace</span><ChevronRight size={13}/><strong>{views.find(v=>v.id===activeTab)?.label}</strong></div><div className="topbar-actions"><span className="local-status"><i/>{isCustomDataActive ? 'Source data loaded' : 'Sample workspace'}</span><button className="icon-button" aria-label="Report settings" onClick={onOpenCustomizer}><Settings2 size={18}/></button></div></header>
  <nav className="mobile-navigation" aria-label="Mobile workspace navigation">{views.map(v=><button key={v.id} onClick={()=>setActiveTab(v.id)} aria-current={activeTab===v.id?'page':undefined}>{v.label}</button>)}</nav>
  <div className="workspace-toolbar"><div className="dataset-breadcrumb"><FileSpreadsheet size={17}/><span>{config.companyName}</span><span className="dataset-mode">{isCustomDataActive ? 'Imported dataset' : 'Demo dataset'}</span></div><div className="toolbar-actions">{!isCustomDataActive && <button className="text-button" onClick={onRegenerateData}><RefreshCw size={15}/>Refresh sample</button>}<button className="secondary-button" onClick={onOpenUploadModal}><Upload size={15}/>Import data</button><button className="primary-button" onClick={onDownloadExcel} disabled={isDownloading}><Download size={15}/>{isDownloading?'Preparing workbook…':'Export workbook'}</button></div></div>
 </>;
};
