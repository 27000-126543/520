import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { useGameStore } from '../store/useGameStore';
import { ArcaneCard } from '../components/ui/ArcaneCard';
import { ArcaneButton } from '../components/ui/ArcaneButton';
import { SkillRadarChart } from '../components/game/SkillRadarChart';
import { LoadingScreen } from '../components/ui/LoadingScreen';
import { reportAPI } from '../lib/api';
import ReactECharts from 'echarts-for-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area
} from 'recharts';
import {
  FileBarChart, Download, TrendingUp, Map, Activity,
  DollarSign, Target, Users, Calendar, Coins,
  BarChart3, PieChart, Sparkles
} from 'lucide-react';

export const ReportsPage = () => {
  const { organization, isAuthenticated } = useAuthStore();
  const {
    weeklyReport, executions, spies, isLoading,
    loadWeeklyReport, loadSpies
  } = useGameStore();

  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadWeeklyReport();
      loadSpies();
    }
  }, [isAuthenticated]);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const response = await reportAPI.exportPDF();
      if (response.success && response.data) {
        const blob = new Blob([response.data.report], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `情报周报_${new Date().toLocaleDateString('zh-CN')}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('导出PDF失败:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const getHeatmapOption = () => {
    if (!weeklyReport) return {};

    const regions = weeklyReport.regionHeatmap.map(r => r.region);
    const data = weeklyReport.regionHeatmap.map((r, i) => [i, 0, r.missionCount]);

    return {
      tooltip: {
        position: 'top',
        formatter: (params: any) => {
          const region = weeklyReport.regionHeatmap[params.data[0]];
          return `
            <div style="padding: 8px;">
              <strong>${region.region}</strong><br/>
              任务数量: ${region.missionCount}<br/>
              成功率: ${region.successRate}%
            </div>
          `;
        },
        backgroundColor: 'rgba(26, 20, 15, 0.95)',
        borderColor: 'rgba(212, 175, 55, 0.3)',
        borderWidth: 1,
        textStyle: { color: '#d4af37' }
      },
      grid: {
        left: '10%',
        right: '10%',
        top: '15%',
        bottom: '20%'
      },
      xAxis: {
        type: 'category',
        data: regions,
        axisLine: { lineStyle: { color: 'rgba(212, 175, 55, 0.3)' } },
        axisLabel: { color: '#d4af37', fontSize: 11, rotate: 30 },
        splitArea: { show: false }
      },
      yAxis: {
        type: 'category',
        data: ['任务密度'],
        axisLine: { lineStyle: { color: 'rgba(212, 175, 55, 0.3)' } },
        axisLabel: { color: '#d4af37', fontSize: 11 },
        splitArea: { show: false }
      },
      visualMap: {
        min: 0,
        max: Math.max(...weeklyReport.regionHeatmap.map(r => r.missionCount)),
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '0%',
        inRange: {
          color: ['#1a140f', '#8b4513', '#d4af37', '#ffd700']
        },
        textStyle: { color: '#d4af37' }
      },
      series: [{
        name: '任务密度',
        type: 'heatmap',
        data: data,
        label: {
          show: true,
          color: '#d4af37',
          fontSize: 12,
          formatter: (params: any) => params.data[2]
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(212, 175, 55, 0.5)'
          }
        }
      }]
    };
  };

  const getSuccessRateData = () => {
    if (!weeklyReport) return [];
    return weeklyReport.successRateTrend.map(item => ({
      date: item.date.slice(5),
      成功率: item.rate
    }));
  };

  const getPriceTrendData = () => {
    if (!weeklyReport) return [];
    const rarityMap: Record<string, string> = {
      'common': '普通',
      'rare': '稀有',
      'epic': '史诗',
      'legendary': '传说'
    };
    return weeklyReport.priceTrend.map(item => ({
      rarity: rarityMap[item.rarity] || item.rarity,
      平均价格: item.average,
      交易量: item.prices.length
    }));
  };

  const getSpySkillData = () => {
    if (spies.length === 0) return [];
    const avgSkills = spies.reduce((acc, spy) => {
      acc.stealth += spy.skills.stealth;
      acc.disguise += spy.skills.disguise;
      acc.decryption += spy.skills.decryption;
      acc.stamina += spy.stats.stamina;
      acc.concealment += spy.stats.concealment;
      return acc;
    }, { stealth: 0, disguise: 0, decryption: 0, stamina: 0, concealment: 0 });

    return [
      { skill: '隐匿', value: Math.round(avgSkills.stealth / spies.length), fullMark: 100 },
      { skill: '伪装', value: Math.round(avgSkills.disguise / spies.length), fullMark: 100 },
      { skill: '破解', value: Math.round(avgSkills.decryption / spies.length), fullMark: 100 },
      { skill: '体力', value: Math.round(avgSkills.stamina / spies.length), fullMark: 100 },
      { skill: '隐匿值', value: Math.round(avgSkills.concealment / spies.length), fullMark: 100 },
    ];
  };

  const completedMissions = executions.filter(e => e.status === 'completed').length;
  const avgSuccessRate = executions.length > 0
    ? Math.round(executions.reduce((sum, e) => sum + e.currentSuccessRate, 0) / executions.length)
    : 0;

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="space-y-6 animate-fade-in" ref={reportRef}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold gold-text mb-1">
            情报产业报告
          </h1>
          <p className="text-arcane-400">分析情报产业趋势，做出明智决策</p>
        </div>
        <ArcaneButton onClick={handleExportPDF} loading={isExporting}>
          <Download className="w-4 h-4 mr-2" />
          导出PDF
        </ArcaneButton>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <motion.div whileHover={{ y: -5 }} className="arcane-card p-5 bg-gradient-to-br from-gold-900/20 to-transparent">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-gold-500/20 flex items-center justify-center">
              <Target className="w-6 h-6 text-gold-500" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-arcane-400 text-sm mb-1">本周任务数</p>
          <p className="font-display text-3xl font-bold text-gold-400">
            {weeklyReport?.totalMissions || completedMissions}
          </p>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="arcane-card p-5 bg-gradient-to-br from-green-900/20 to-transparent">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Activity className="w-6 h-6 text-green-500" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-arcane-400 text-sm mb-1">平均成功率</p>
          <p className="font-display text-3xl font-bold text-green-400">
            {weeklyReport ? Math.round(weeklyReport.successRateTrend.reduce((sum, t) => sum + t.rate, 0) / weeklyReport.successRateTrend.length) : avgSuccessRate}%
          </p>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="arcane-card p-5 bg-gradient-to-br from-blue-900/20 to-transparent">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-500" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-arcane-400 text-sm mb-1">交易总额</p>
          <p className="font-display text-3xl font-bold text-blue-400">
            {weeklyReport?.totalVolume || 0}
          </p>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="arcane-card p-5 bg-gradient-to-br from-purple-900/20 to-transparent">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-500" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-arcane-400 text-sm mb-1">活跃组织</p>
          <p className="font-display text-3xl font-bold text-purple-400">
            {weeklyReport?.topOrganizations.length || 0}
          </p>
        </motion.div>
      </div>

      <ArcaneCard className="p-6 bg-gradient-to-br from-arcane-900/80 to-arcane-950/80">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-gold-400 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gold-500" />
              周报概览
            </h2>
            {weeklyReport && (
              <p className="text-arcane-400 text-sm mt-1">
                {new Date(weeklyReport.weekStart).toLocaleDateString('zh-CN')} - {new Date(weeklyReport.weekEnd).toLocaleDateString('zh-CN')}
              </p>
            )}
          </div>
          {organization && (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-arcane-400">我的组织</p>
                <p className="font-medium text-gold-400">{organization.name}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-arcane-900" />
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="p-4 bg-arcane-800/30 rounded-lg text-center">
            <Coins className="w-8 h-8 mx-auto mb-2 text-gold-500" />
            <p className="font-display text-2xl font-bold text-gold-400">{organization?.intelPoints || 0}</p>
            <p className="text-sm text-arcane-400">情报积分</p>
          </div>
          <div className="p-4 bg-arcane-800/30 rounded-lg text-center">
            <Target className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="font-display text-2xl font-bold text-green-400">{completedMissions}</p>
            <p className="text-sm text-arcane-400">完成任务</p>
          </div>
          <div className="p-4 bg-arcane-800/30 rounded-lg text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <p className="font-display text-2xl font-bold text-blue-400">{spies.length}</p>
            <p className="text-sm text-arcane-400">间谍数量</p>
          </div>
        </div>
      </ArcaneCard>

      <div className="grid grid-cols-2 gap-6">
        <ArcaneCard className="p-6">
          <h2 className="font-display text-xl font-bold text-gold-400 mb-4 flex items-center gap-2">
            <Map className="w-5 h-5 text-blue-500" />
            区域任务密度热力图
          </h2>
          {weeklyReport ? (
            <ReactECharts
              option={getHeatmapOption()}
              style={{ height: '300px' }}
              theme="dark"
            />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-arcane-400">
              暂无数据
            </div>
          )}
        </ArcaneCard>

        <ArcaneCard className="p-6">
          <h2 className="font-display text-xl font-bold text-gold-400 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            成功率曲线图
          </h2>
          {weeklyReport ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={getSuccessRateData()}>
                <defs>
                  <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(212, 175, 55, 0.1)" />
                <XAxis
                  dataKey="date"
                  stroke="#d4af37"
                  tick={{ fill: '#d4af37', fontSize: 11 }}
                />
                <YAxis
                  stroke="#d4af37"
                  tick={{ fill: '#d4af37', fontSize: 11 }}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(26, 20, 15, 0.95)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    borderRadius: '8px',
                    color: '#d4af37'
                  }}
                />
                <Legend wrapperStyle={{ color: '#d4af37' }} />
                <Area
                  type="monotone"
                  dataKey="成功率"
                  stroke="#d4af37"
                  strokeWidth={2}
                  fill="url(#successGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-arcane-400">
              暂无数据
            </div>
          )}
        </ArcaneCard>

        <ArcaneCard className="p-6">
          <h2 className="font-display text-xl font-bold text-gold-400 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-500" />
            交易价格走势图
          </h2>
          {weeklyReport ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getPriceTrendData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(212, 175, 55, 0.1)" />
                <XAxis
                  dataKey="rarity"
                  stroke="#d4af37"
                  tick={{ fill: '#d4af37', fontSize: 11 }}
                />
                <YAxis
                  stroke="#d4af37"
                  tick={{ fill: '#d4af37', fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(26, 20, 15, 0.95)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    borderRadius: '8px',
                    color: '#d4af37'
                  }}
                />
                <Legend wrapperStyle={{ color: '#d4af37' }} />
                <Line
                  type="monotone"
                  dataKey="平均价格"
                  stroke="#d4af37"
                  strokeWidth={2}
                  dot={{ fill: '#d4af37', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="交易量"
                  stroke="#a855f7"
                  strokeWidth={2}
                  dot={{ fill: '#a855f7', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-arcane-400">
              暂无数据
            </div>
          )}
        </ArcaneCard>

        <ArcaneCard className="p-6">
          <h2 className="font-display text-xl font-bold text-gold-400 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-purple-500" />
            间谍技能雷达图
          </h2>
          <div className="flex justify-center items-center h-[300px]">
            {spies.length > 0 ? (
              <SkillRadarChart
                data={getSpySkillData()}
                size={280}
                color="#d4af37"
              />
            ) : (
              <div className="text-arcane-400">
                暂无间谍数据
              </div>
            )}
          </div>
        </ArcaneCard>
      </div>

      {weeklyReport && weeklyReport.topOrganizations.length > 0 && (
        <ArcaneCard className="p-6">
          <h2 className="font-display text-xl font-bold text-gold-400 mb-4 flex items-center gap-2">
            <FileBarChart className="w-5 h-5 text-gold-500" />
            本周排行榜 TOP 5
          </h2>
          <div className="grid grid-cols-5 gap-4">
            {weeklyReport.topOrganizations.slice(0, 5).map((org, index) => (
              <motion.div
                key={org.orgId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg text-center ${
                  index === 0 ? 'bg-gold-500/20 border border-gold-500/30' :
                  index === 1 ? 'bg-gray-400/20 border border-gray-400/30' :
                  index === 2 ? 'bg-amber-600/20 border border-amber-600/30' :
                  'bg-arcane-800/30'
                }`}
              >
                <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center text-xl font-bold ${
                  index === 0 ? 'bg-gold-500 text-arcane-900' :
                  index === 1 ? 'bg-gray-400 text-arcane-900' :
                  index === 2 ? 'bg-amber-600 text-arcane-900' :
                  'bg-arcane-700 text-arcane-300'
                }`}>
                  {index + 1}
                </div>
                <p className="font-medium text-gold-300 truncate">{org.orgName}</p>
                <p className="font-mono text-lg font-bold text-gold-400">{org.points}</p>
              </motion.div>
            ))}
          </div>
        </ArcaneCard>
      )}
    </div>
  );
};
