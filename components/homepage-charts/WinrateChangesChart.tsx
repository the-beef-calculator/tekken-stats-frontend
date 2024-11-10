import React, { useState, useEffect, useMemo } from 'react';
import { useAtom } from 'jotai';
import { Bar, BarChart, LabelList, XAxis, YAxis, Tooltip, Cell, ReferenceLine } from 'recharts';
import { winrateChangesAtom } from '@/atoms/tekkenStatsAtoms';
import { ChartCard } from '../shared/ChartCard';
import { CustomYAxisTick } from '../shared/CustomYAxisTick';
import { CustomTooltip } from '../shared/CustomTooltip';
import { ChartProps } from '@/atoms/tekkenStatsAtoms';

export const WinrateChangesChart: React.FC<Omit<ChartProps, 'rank' | 'onRankChange'>> = (props) => {
  const [isInitialRender, setIsInitialRender] = useState(true);
  const [rank, setRank] = useState("highRank");
  const [winrateChanges] = useAtom(winrateChangesAtom);

  useEffect(() => {
    if (isInitialRender) setIsInitialRender(false);
  }, []);

  const { data, domain } = useMemo(() => {
    const rankData = winrateChanges[rank as keyof typeof winrateChanges] || [];
    
    const chartData = [...rankData]
      .map(entry => ({
        ...entry,
        change: entry.trend === 'decrease' ? -entry.change : entry.change
      }))
      .sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
    
    const changes = chartData.map(d => d.change);
    const maxAbsChange = Math.ceil(Math.max(...changes.map(Math.abs)));
    const domainPadding = maxAbsChange * 0.1;
    
    return {
      data: chartData,
      domain: [-maxAbsChange - domainPadding, maxAbsChange + domainPadding] as [number, number]
    };
  }, [winrateChanges, rank]);

  const getBarColor = (change: number) => {
    return change >= 0
      ? 'hsl(142.1 76.2% 36.3%)' // Tailwind success color
      : 'hsl(0 84.2% 60.2%)'     // Tailwind destructive color
  };

  return (
    <ChartCard {...props} rank={rank} onRankChange={setRank}>
      <BarChart
        width={400}
        height={200}
        data={data}
        layout="vertical"
        margin={{ left: 100, right: 58, top: 8, bottom: 8 }}
      >
        <YAxis
          dataKey="characterId"
          type="category"
          axisLine={false}
          tickLine={false}
          tick={<CustomYAxisTick />}
          width={60}
        />
        <XAxis
          type="number"
          domain={domain}
          tickFormatter={(value) => `${value > 0 ? '+' : ''}${value.toFixed(1)}%`}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine x={0} stroke="hsl(var(--muted-foreground))" strokeWidth={1} />
        <Bar
          dataKey="change"
          radius={[0, 4, 4, 0]}
          isAnimationActive={true}
          animationBegin={isInitialRender ? 900 : 100}
          animationDuration={1000}
          animationEasing="ease"
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={getBarColor(entry.change)}
            />
          ))}
          <LabelList
            dataKey="change"
            position="right"
            formatter={(value: number) => `${value > 0 ? '+' : ''}${value.toFixed(2)}%`}
          />
        </Bar>
      </BarChart>
    </ChartCard>
  );
};