import { useState } from 'react';
import { useAtom } from 'jotai';
import { AnimatedCard } from '@/components/AnimatedCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList, ResponsiveContainer, Cell } from 'recharts';
import { 
  rankColorsAtom, 
  rankDistributionAtom,
  currentModeAtom,
  gameVersionsAtom 
} from '@/atoms/tekkenStatsAtoms';
import type { DistributionMode, GameVersion } from '@/atoms/tekkenStatsAtoms';

export const RankDistributionChart: React.FC = () => {
  const [rankDistribution] = useAtom(rankDistributionAtom);
  const [rankColors] = useAtom(rankColorsAtom);
  const [gameVersions] = useAtom(gameVersionsAtom);
  const [selectedVersion, setSelectedVersion] = useState<GameVersion>('10801');
  const [selectedMode, setSelectedMode] = useState<DistributionMode>('overall');

  // Only proceed if we have data for the selected version
  const distributionData = rankDistribution[selectedVersion]?.[selectedMode] || [];

  const chartData = distributionData.map((rank) => {
    const colorEntry = rankColors.find((rc) => rc.rank === rank.rank);
    return {
      rank: rank.rank,
      percentage: Number(rank.percentage.toFixed(2)), // Ensure consistent decimal places
      fill: colorEntry?.color || '#3182ce',
    };
  });

  const getVersionLabel = (version: string) => {
    switch (version) {
      case '10801':
        return 'Tekken 8 (Latest)';
      case '10701':
        return 'Tekken 8 (Previous)';
      default:
        return `Version ${version}`;
    }
  };

  return (
    <AnimatedCard delay={1}>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold">Rank Distribution</CardTitle>
              <CardDescription>Showing rank distribution among players</CardDescription>
            </div>
            <div className="flex gap-4">
            <Select value={selectedVersion} onValueChange={(v) => setSelectedVersion(v as GameVersion)}>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Select game version" />
  </SelectTrigger>
  <SelectContent>
    {[...gameVersions] // Create a copy to avoid mutating original array
      .sort((b, a) => parseInt(a) - parseInt(b)) // Sort in ascending order
      .map((version) => (
        <SelectItem key={version} value={version}>
          {getVersionLabel(version)}
        </SelectItem>
      ))}
  </SelectContent>
</Select>
              <Select value={selectedMode} onValueChange={(v) => setSelectedMode(v as DistributionMode)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overall">Overall</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!distributionData.length ? (
            <div className="flex justify-center items-center h-[400px]">
              <p className="text-gray-500">No data available for this version</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="rank"
                  tickLine={true}
                  axisLine={false}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={117}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'transparent' }} 
                  formatter={(value: number) => `${value.toFixed(2)}%`}
                />
                <Bar
                  dataKey="percentage"
                  radius={[8, 8, 0, 0]}
                  isAnimationActive={true}
                  animationBegin={100}
                  animationDuration={1000}
                  animationEasing="ease"
                >
                  <LabelList 
                    dataKey="percentage" 
                    position="top" 
                    formatter={(value: number) => `${value.toFixed(2)}%`} 
                  />
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </AnimatedCard>
  );
};