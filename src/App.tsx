import { useEffect } from 'react';
import { useGameStore, UPGRADE_CONFIG, UpgradeId } from './store';
import { DigScene } from './components/DigScene';

function formatNumber(n: number): string {
  return Math.floor(n).toLocaleString();
}

function App() {
  const depth = useGameStore((s) => s.depth);
  const dirt = useGameStore((s) => s.dirt);
  const clickPower = useGameStore((s) => s.clickPower);
  const dps = useGameStore((s) => s.dps);
  const upgrades = useGameStore((s) => s.upgrades);
  const autoMine = useGameStore((s) => s.autoMine);
  const buyUpgrade = useGameStore((s) => s.buyUpgrade);
  const getUpgradeCost = useGameStore((s) => s.getUpgradeCost);

  useEffect(() => {
    const interval = setInterval(() => {
      autoMine();
    }, 1000);
    return () => clearInterval(interval);
  }, [autoMine]);

  const upgradeIds = Object.keys(UPGRADE_CONFIG) as UpgradeId[];

  return (
    <div className="flex h-screen w-screen flex-col bg-stone-900 text-stone-100 sm:flex-row">
      {/* 왼쪽: 게임 플레이 영역 (3D 씬 + HUD 오버레이) */}
      <div className="relative min-h-[55vh] flex-1 border-b border-stone-700 sm:min-h-0 sm:border-b-0 sm:border-r">
        <div className="absolute inset-0">
          <DigScene />
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col items-center gap-1 p-8 text-center">
          <p className="text-lg text-stone-300 drop-shadow">깊이</p>
          <p className="text-5xl font-bold text-amber-400 drop-shadow">
            {formatNumber(depth)} m
          </p>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-1 p-8 text-center">
          <p className="text-lg text-stone-300 drop-shadow">보유한 흙</p>
          <p className="text-4xl font-bold text-stone-100 drop-shadow">
            {formatNumber(dirt)} 🟫
          </p>
          <p className="mt-1 text-sm text-stone-400 drop-shadow">
            클릭당 +{clickPower} · 초당 +{dps} · 광석을 클릭해서 땅을 파세요
          </p>
        </div>
      </div>

      {/* 오른쪽: 상점/업그레이드 영역 */}
      <div className="flex w-full flex-col gap-4 overflow-y-auto p-6 sm:w-96 sm:flex-shrink-0">
        <h2 className="text-xl font-bold text-stone-200">업그레이드</h2>

        {upgradeIds.map((id) => {
          const config = UPGRADE_CONFIG[id];
          const level = upgrades[id].level;
          const cost = getUpgradeCost(id);
          const canAfford = dirt >= cost;

          return (
            <div
              key={id}
              className="flex flex-col gap-2 rounded-lg bg-stone-800 p-4 shadow"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-100">{config.name}</span>
                <span className="text-sm text-stone-400">Lv. {level}</span>
              </div>
              <p className="text-sm text-stone-400">{config.effect}</p>
              <button
                onClick={() => buyUpgrade(id)}
                disabled={!canAfford}
                className={`mt-1 rounded-md py-2 text-sm font-semibold transition-colors ${
                  canAfford
                    ? 'bg-amber-600 text-white hover:bg-amber-500'
                    : 'cursor-not-allowed bg-stone-700 text-stone-500'
                }`}
              >
                구매 ({formatNumber(cost)} 흙)
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
