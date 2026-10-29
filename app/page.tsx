"use client";

import { useEffect, useMemo, useState } from "react";

type ViewMode = "side" | "front" | "top";
type AlignMode = "center" | "rear" | "front";

type Vehicle = {
  id: string;
  maker: string;
  name: string;
  length: number;
  width: number;
  height: number;
  images: Record<ViewMode, string>;
};

function createVehicle(
  id: string,
  maker: string,
  name: string,
  length: number,
  width: number,
  height: number,
): Vehicle {
  const base = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/cars/catalog/${id}`;
  return {
    id,
    maker,
    name,
    length,
    width,
    height,
    images: {
      side: `${base}-side.png`,
      front: `${base}-front.png`,
      top: `${base}-top.png`,
    },
  };
}

const VEHICLES: Vehicle[] = [
  createVehicle("mini-crossover", "MINI", "ミニ クロスオーバー クーパーD", 4105, 1790, 1550),
  createVehicle("range-rover-evoque", "LAND ROVER", "レンジローバー イヴォーク", 4355, 1900, 1635),
  createVehicle("jeep-compass", "JEEP", "コンパス", 4400, 1810, 1640),
  createVehicle("volvo-xc40", "VOLVO", "XC40", 4425, 1875, 1660),
  createVehicle("vw-tiguan", "VOLKSWAGEN", "ティグアン", 4500, 1840, 1675),
  createVehicle("citroen-c5-aircross", "CITROËN", "C5 エアクロス", 4500, 1850, 1710),
  createVehicle("bmw-2-gran-tourer", "BMW", "2シリーズ グランツアラー", 4565, 1800, 1645),
  createVehicle("toyota-fj-cruiser", "TOYOTA", "ランドクルーザーFJ VX", 4575, 1855, 1960),
  createVehicle("toyota-rav4", "TOYOTA", "RAV4", 4600, 1855, 1680),
  createVehicle("peugeot-5008", "PEUGEOT", "5008", 4640, 1840, 1650),
  createVehicle("vw-vanagon", "VOLKSWAGEN", "ヴァナゴン", 4655, 1840, 1965),
  createVehicle("jeep-cherokee", "JEEP", "チェロキー", 4665, 1905, 1740),
  createVehicle("toyota-voxy", "TOYOTA", "ヴォクシー", 4695, 1730, 1925),
  createVehicle("toyota-estima", "TOYOTA", "エスティマ", 4815, 1820, 1760),
  createVehicle("honda-odyssey", "HONDA", "オデッセイ", 4830, 1800, 1715),
  createVehicle("toyota-landcruiser250-vx", "TOYOTA", "ランドクルーザー250 VX", 4925, 1980, 1925),
  createVehicle("toyota-alphard", "TOYOTA", "アルファード", 4995, 1850, 1945),
];

const COLOR = { a: "#ff6b35", b: "#136f63" };

function format(value: number) {
  return new Intl.NumberFormat("ja-JP").format(value);
}

function readPreset(id: string) {
  return VEHICLES.find((vehicle) => vehicle.id === id) ?? VEHICLES[0];
}

function VehicleEditor({
  slot,
  vehicle,
  onVehicle,
}: {
  slot: "A" | "B";
  vehicle: Vehicle;
  onVehicle: (vehicle: Vehicle) => void;
}) {
  const color = slot === "A" ? COLOR.a : COLOR.b;
  return (
    <section className="vehicle-editor" style={{ "--slot-color": color } as React.CSSProperties}>
      <div className="editor-heading">
        <span className="slot-badge">{slot}</span>
        <div>
          <p>{vehicle.maker}</p>
          <h2>{vehicle.name}</h2>
        </div>
      </div>

      <label className="select-label">
        <span>車種を選択</span>
        <select value={vehicle.id} onChange={(event) => onVehicle(readPreset(event.target.value))}>
          {VEHICLES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.maker} {item.name}
            </option>
          ))}
        </select>
      </label>
    </section>
  );
}

function Difference({ label, a, b }: { label: string; a: number; b: number }) {
  const difference = a - b;
  return (
    <div className="difference-item">
      <span>{label}</span>
      <strong>{difference === 0 ? "同じ" : `${difference > 0 ? "A" : "B"} が ${format(Math.abs(difference))} mm 大きい`}</strong>
    </div>
  );
}

export default function Home() {
  const [a, setA] = useState<Vehicle>(VEHICLES[0]);
  const [b, setB] = useState<Vehicle>(VEHICLES[1]);
  const [view, setView] = useState<ViewMode>("side");
  const [alignment, setAlignment] = useState<AlignMode>("center");
  const [bTransparency, setBTransparency] = useState(38);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const restoreTimer = window.setTimeout(() => {
      try {
        const saved = localStorage.getItem("kuraberu-garage-v2");
        if (saved) {
          const state = JSON.parse(saved) as { a?: Vehicle; b?: Vehicle; view?: ViewMode; alignment?: AlignMode; bTransparency?: number };
          if (state.a) setA(readPreset(state.a.id));
          if (state.b) setB(readPreset(state.b.id));
          if (state.view) setView(state.view);
          if (state.alignment && ["center", "rear", "front"].includes(state.alignment)) setAlignment(state.alignment);
          if (typeof state.bTransparency === "number") setBTransparency(Math.min(90, Math.max(0, state.bTransparency)));
        }
      } catch {
        // A malformed local preference should never block the comparison tool.
      }
      setHydrated(true);
    }, 0);

    return () => window.clearTimeout(restoreTimer);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem("kuraberu-garage-v2", JSON.stringify({ a, b, view, alignment, bTransparency }));
  }, [a, b, view, alignment, bTransparency, hydrated]);

  const axis = useMemo(() => {
    if (view === "front") return { x: "width" as const, y: "height" as const, xLabel: "全幅", yLabel: "全高" };
    if (view === "top") return { x: "length" as const, y: "width" as const, xLabel: "全長", yLabel: "全幅" };
    return { x: "length" as const, y: "height" as const, xLabel: "全長", yLabel: "全高" };
  }, [view]);

  const maxX = Math.max(a[axis.x], b[axis.x]);
  const maxY = Math.max(a[axis.y], b[axis.y]);
  const canvasWidth = maxX * 1.18;
  const canvasHeight = maxY * 1.28;
  const marginX = (canvasWidth - maxX) / 2;
  const marginY = (canvasHeight - maxY) / 2;
  const tagSize = Math.min(maxX, maxY) * 0.09;

  const vehicleGeometry = (vehicle: Vehicle) => {
    const width = vehicle[axis.x];
    const height = vehicle[axis.y];
    const x = view === "front" || alignment === "center"
      ? (canvasWidth - width) / 2
      : alignment === "rear"
        ? marginX
        : canvasWidth - marginX - width;
    const y = view === "top"
      ? (canvasHeight - height) / 2
      : canvasHeight - marginY - height;
    return { x, y, width, height };
  };

  const renderVehicle = (vehicle: Vehicle, slot: "a" | "b") => {
    const geometry = vehicleGeometry(vehicle);
    const opacity = slot === "b" ? (100 - bTransparency) / 100 : 1;
    const tagX = geometry.x + geometry.width - tagSize * 1.18;
    const tagY = geometry.y + tagSize * 0.18;
    return (
      <g className={`scale-car scale-car-${slot}`}>
        <rect
          {...geometry}
          fill={`${COLOR[slot]}12`}
          stroke={COLOR[slot]}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          rx={tagSize * 0.08}
        />
        <image
          href={vehicle.images[view]}
          {...geometry}
          preserveAspectRatio="none"
          opacity={opacity}
          className="scale-car-image"
        />
        <rect x={tagX} y={tagY} width={tagSize} height={tagSize} rx={tagSize * 0.2} fill="rgba(23,33,31,.86)" />
        <text
          x={tagX + tagSize / 2}
          y={tagY + tagSize * 0.68}
          textAnchor="middle"
          fill="#fff"
          fontSize={tagSize * 0.48}
          fontWeight="800"
        >
          {slot.toUpperCase()}
        </text>
      </g>
    );
  };

  const swap = () => {
    setA(b);
    setB(a);
  };

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="くらべるガレージ ホーム">
          <span className="brand-mark">KG</span>
          <span>くらべるガレージ</span>
        </a>
        <span className="prototype-pill">VERSION 1</span>
      </header>

      <div id="top" className="page-shell">
        <section className="hero">
          <div>
            <p className="eyebrow">CAR SIZE COMPARATOR</p>
            <h1>数字だけでは、<br />わからない大きさを。</h1>
          </div>
          <p className="hero-copy">気になる2台を選ぶだけ。全長・全幅・全高の違いを、同じ縮尺で直感的に見比べられます。</p>
        </section>

        <section className="editors" aria-label="比較する車の設定">
          <VehicleEditor slot="A" vehicle={a} onVehicle={setA} />
          <button className="swap" onClick={swap} aria-label="車Aと車Bを入れ替える">⇄</button>
          <VehicleEditor slot="B" vehicle={b} onVehicle={setB} />
        </section>

        <section className="spec-table" aria-label="寸法一覧">
          <div className="spec-row spec-head"><span>車種</span><span>全長</span><span>全幅</span><span>全高</span></div>
          {[{ slot: "A", vehicle: a }, { slot: "B", vehicle: b }].map(({ slot, vehicle }) => (
            <div className="spec-row" key={slot}>
              <span><b className={`mini-slot slot-${slot.toLowerCase()}`}>{slot}</b>{vehicle.name}</span>
              <span data-label="全長">{format(vehicle.length)} mm</span>
              <span data-label="全幅">{format(vehicle.width)} mm</span>
              <span data-label="全高">{format(vehicle.height)} mm</span>
            </div>
          ))}
        </section>

        <section className="difference-section">
          <div>
            <p className="eyebrow">DIFFERENCE</p>
            <h2>サイズ差</h2>
          </div>
          <div className="difference-grid">
            <Difference label="全長" a={a.length} b={b.length} />
            <Difference label="全幅" a={a.width} b={b.width} />
            <Difference label="全高" a={a.height} b={b.height} />
          </div>
        </section>

        <section className="comparison-section">
          <div className="comparison-heading">
            <div>
              <p className="eyebrow">SCALE VIEW</p>
            </div>
            <div className="comparison-controls">
              <div className="control-group">
                <span>表示方向</span>
                <div className="view-tabs" role="tablist" aria-label="比較方向">
                  {(["side", "front", "top"] as ViewMode[]).map((mode) => (
                    <button
                      key={mode}
                      role="tab"
                      aria-selected={view === mode}
                      className={view === mode ? "active" : ""}
                      onClick={() => setView(mode)}
                    >
                      {mode === "side" ? "側面" : mode === "front" ? "正面" : "上面"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="control-group">
                <span>車体の基準</span>
                <div className="alignment-toggle" role="radiogroup" aria-label="車体の揃え位置">
                  {(["rear", "center", "front"] as AlignMode[]).map((mode) => (
                    <button
                      key={mode}
                      role="radio"
                      aria-checked={alignment === mode}
                      className={alignment === mode ? "active" : ""}
                      onClick={() => setAlignment(mode)}
                    >
                      {mode === "rear" ? "後端" : mode === "center" ? "中央" : "前端"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="control-group opacity-group">
                <label htmlFor="b-transparency">Bの透過度 <output>{bTransparency}%</output></label>
                <input
                  id="b-transparency"
                  type="range"
                  min="0"
                  max="90"
                  step="1"
                  value={bTransparency}
                  onChange={(event) => setBTransparency(Number(event.target.value))}
                />
              </div>
            </div>
          </div>

          <div className={`scale-stage ${view}`}>
            <div className="axis-label axis-y">{axis.yLabel}</div>
            <div className="axis-label axis-x">{axis.xLabel}</div>
            <svg
              className="scale-canvas"
              viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
              preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label={`${a.name}と${b.name}の実寸比率による${view === "side" ? "側面" : view === "front" ? "正面" : "上面"}比較`}
          >
              {view !== "top" && (
                <line
                  x1={marginX * 0.7}
                  y1={canvasHeight - marginY}
                  x2={canvasWidth - marginX * 0.7}
                  y2={canvasHeight - marginY}
                  stroke="rgba(23,33,31,.38)"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
              )}
              {renderVehicle(b, "b")}
              {renderVehicle(a, "a")}
            </svg>
          </div>

          <div className="scale-legend">
            <div><i style={{ background: COLOR.a }} />A — {a.name} <strong>{format(a[axis.x])} × {format(a[axis.y])} mm</strong></div>
            <div><i style={{ background: COLOR.b }} />B — {b.name} <strong>{format(b[axis.x])} × {format(b[axis.y])} mm</strong></div>
          </div>
          <p className="accuracy-note">縦横とも同一の実寸縮尺で描画しています。画像は透明余白を除き、車体の端を実寸の外形寸法へ合わせています。側面・上面とも前方は右です。</p>
        </section>

        <footer>
          <p>寸法は各車種の代表的な公表値を参考にした比較用データです。年式・グレード・仕様により異なるため、購入・駐車等の判断では必ずメーカー公式情報をご確認ください。車両画像は縮尺比較用の生成画像で、実車写真ではありません。</p>
          <p>本サイトは非公式の比較ツールで、各自動車メーカーとは関係ありません。車名・商標はそれぞれの権利者に帰属します。選択状態はこの端末のブラウザー内にのみ保存されます。</p>
        </footer>
      </div>
    </main>
  );
}
