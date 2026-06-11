import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

interface SkillRadarChartProps {
  data: {
    skill: string;
    value: number;
    fullMark: number;
  }[];
  size?: number;
  color?: string;
}

export const SkillRadarChart = ({ data, size = 200, color = '#d4af37' }: SkillRadarChartProps) => {
  return (
    <div style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="rgba(212, 175, 55, 0.2)" />
          <PolarAngleAxis 
            dataKey="skill" 
            tick={{ fill: '#d4af37', fontSize: 11, fontFamily: 'JetBrains Mono' }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]} 
            tick={{ fill: '#8b7355', fontSize: 10 }}
            axisLine={false}
          />
          <Radar
            name="技能"
            dataKey="value"
            stroke={color}
            fill={color}
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
