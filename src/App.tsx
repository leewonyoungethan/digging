import { useEffect, useState } from 'react';
import { useGameStore, UPGRADE_CONFIG, UpgradeId } from './store';

function formatNumber(n: number): string {
  return Math.floor(n).toLocaleString();
}

function App() {
  const depth = useGameStore((s) => s.depth);
  const dirt = useGameStore((s) => s.dirt);
  const clickPower = useGameStore((s) => s.clickPower);
  const dps = useGameStore((s) => s.dps);
  const upgrades = useGameStore((s) => s.upgrades);
  const dig = useGameStore((s) => s.dig);
  const autoMine = useGameStore((s) => s.autoMine);
  const buyUpgrade = useGameStore((s) => s.buyUpgrade);
  const getUpgradeCost = useGameStore((s) => s.getUpgradeCost);

  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      autoMine();
    }, 1000);
    return () => clearInterval(interval);
  }, [autoMine]);

  const handleDig = () => {
    dig();
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 100);
  };

  const upgradeIds = Object.keys(UPGRADE_CONFIG) as UpgradeId[];

  return (
    <div className="flex h-screen w-screen bg-stone-900 text-stone-100">
      {/* 왼쪽: 게임 플레이 영역 */}
      <div className="flex flex-1 flex-col items-center justify-center gap-8 border-r border-stone-700 p-8">
        <div className="text-center">
          <p className="text-lg text-stone-400">깊이</p>
          <p className="text-5xl font-bold text-amber-400">{formatNumber(depth)} m</p>
        </div>

        <div className="text-center">
          <p className="text-lg text-stone-400">보유한 흙</p>
          <p className="text-4xl font-bold text-stone-100">{formatNumber(dirt)} 🟫</p>
          <p className="mt-1 text-sm text-stone-500">
            클릭당 +{clickPower} · 초당 +{dps}
          </p>
        </div>

        <button
          onClick={handleDig}
          className={`h-48 w-48 rounded-full bg-amber-700 text-2xl font-bold text-white shadow-lg transition-transform duration-100 active:bg-amber-800 ${
            isPressed ? 'scale-90' : 'scale-100'
          }`}
        >
          땅 파기
        </button>
      </div>

      {/* 오른쪽: 상점/업그레이드 영역 */}
      <div className="flex w-96 flex-col gap-4 p-6">
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
