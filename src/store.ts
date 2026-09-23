import { create } from 'zustand';

export type UpgradeId = 'shovel' | 'worker' | 'drill';

interface UpgradeConfig {
  name: string;
  baseCost: number;
  costMultiplier: number;
  effect: string;
}

interface UpgradeState {
  level: number;
}

interface GameState {
  depth: number;
  dirt: number;
  clickPower: number;
  dps: number;
  upgrades: Record<UpgradeId, UpgradeState>;

  dig: () => void;
  autoMine: () => void;
  buyUpgrade: (id: UpgradeId) => void;
  getUpgradeCost: (id: UpgradeId) => number;
}

export const UPGRADE_CONFIG: Record<UpgradeId, UpgradeConfig> = {
  shovel: {
    name: '더 좋은 삽',
    baseCost: 50,
    costMultiplier: 1.15,
    effect: '클릭 파워 +1',
  },
  worker: {
    name: '인부 고용',
    baseCost: 100,
    costMultiplier: 1.15,
    effect: 'DPS +1',
  },
  drill: {
    name: '드릴 머신',
    baseCost: 1000,
    costMultiplier: 1.15,
    effect: 'DPS +10',
  },
};

export const useGameStore = create<GameState>((set, get) => ({
  depth: 0,
  dirt: 0,
  clickPower: 1,
  dps: 0,
  upgrades: {
    shovel: { level: 0 },
    worker: { level: 0 },
    drill: { level: 0 },
  },

  dig: () =>
    set((state) => ({
      dirt: state.dirt + state.clickPower,
      depth: state.depth + state.clickPower,
    })),

  autoMine: () =>
    set((state) => {
      if (state.dps <= 0) return state;
      return {
        dirt: state.dirt + state.dps,
        depth: state.depth + state.dps,
      };
    }),

  getUpgradeCost: (id) => {
    const state = get();
    const config = UPGRADE_CONFIG[id];
    const level = state.upgrades[id].level;
    return Math.round(config.baseCost * Math.pow(config.costMultiplier, level));
  },

  buyUpgrade: (id) => {
    const state = get();
    const cost = state.getUpgradeCost(id);
    if (state.dirt < cost) return;

    set((state) => {
      const nextLevel = state.upgrades[id].level + 1;
      const statBonus =
        id === 'shovel' ? { clickPower: state.clickPower + 1 } :
        id === 'worker' ? { dps: state.dps + 1 } :
        { dps: state.dps + 10 };

      return {
        dirt: state.dirt - cost,
        upgrades: {
          ...state.upgrades,
          [id]: { level: nextLevel },
        },
        ...statBonus,
      };
    });
  },
}));
