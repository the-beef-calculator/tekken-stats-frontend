import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { SimpleChartCard } from '../shared/SimpleChartCard';
import { Battle, characterIdMap, characterIconMap } from '../../app/state/types/tekkenTypes';
import Image from 'next/image';

interface CharacterDistributionChartProps {
  battles: Battle[];
  selectedCharacterId: number;
  playerName: string;
}

interface DistributionData {
  characterName: string;
  characterId: number;
  totalMatches: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: DistributionData;
    value: number;
    name: string;
    dataKey: string;
  }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const iconPath = characterIconMap[data.characterName];

    return (
      <div className="bg-background border border-border p-2 rounded-md">
        <div className="flex items-center gap-2 mb-1">
          {iconPath && (
            <Image
              src={iconPath}
              alt={data.characterName}
              width={24}
              height={24}
              style={{ objectFit: 'contain' }}
            />
          )}
          <p className="font-bold">{data.characterName}</p>
        </div>
        <p>Total Matches: {data.totalMatches}</p>
      </div>
    );
  }
  return null;
};

const CustomXAxisTick: React.FC<any> = ({ x, y, payload }) => {
  const iconPath = characterIconMap[payload.value];
  if (!iconPath) return null;

  return (
    <g transform={`translate(${x},${y})`}>
      <foreignObject x="-16" y="0" width="32" height="32">
        <Image
          src={iconPath}
          alt={payload.value}
          width={32}
          height={32}
          style={{ objectFit: 'contain' }}
        />
      </foreignObject>
    </g>
  );
};

const CharacterDistributionChart: React.FC<CharacterDistributionChartProps> = ({
  battles,
  selectedCharacterId,
  playerName
}) => {
  // Filter battles for selected character
  const characterBattles = battles.filter(battle => {
    const isPlayer1 = battle.player1Name === playerName;
    return isPlayer1 
      ? battle.player1CharacterId === selectedCharacterId
      : battle.player2CharacterId === selectedCharacterId;
  });

  // Calculate total matches against each character
  const distributionData = characterBattles.reduce<Record<string, DistributionData>>((acc, battle) => {
    const isPlayer1 = battle.player1Name === playerName;
    const opponentCharId = isPlayer1 ? battle.player2CharacterId : battle.player1CharacterId;
    const characterName = characterIdMap[opponentCharId] || `Character ${opponentCharId}`;

    if (!acc[characterName]) {
      acc[characterName] = {
        characterName,
        characterId: opponentCharId,
        totalMatches: 0
      };
    }

    acc[characterName].totalMatches++;
    return acc;
  }, {});

  // Convert to array and sort by total matches
  const chartData = Object.values(distributionData)
    .sort((a: DistributionData, b: DistributionData) => b.totalMatches - a.totalMatches);

  if (chartData.length === 0) {
    return (
      <SimpleChartCard
        title="Character Matchup Distribution"
        description="No matchup data available for this character"
      >
        <div className="h-full flex items-center justify-center">
          <p className="text-muted-foreground">No matches found</p>
        </div>
      </SimpleChartCard>
    );
  }

  return (
    <SimpleChartCard
      title="Character Matchup Distribution"
      description="Total matches played against different characters"
    >
      <div className="w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 40
            }}
          >
            <XAxis 
              dataKey="characterName"
              height={40}
              tick={<CustomXAxisTick />}
              interval={0}
            />
            <YAxis 
              hide
            />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={false}
            />
            <Bar 
              dataKey="totalMatches" 
              name="Total Matches"
              radius={[8, 8, 0, 0]}
              fill="white"
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </SimpleChartCard>
  );
};

export default CharacterDistributionChart;