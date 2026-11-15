"use client";

import React, { useMemo, useState } from "react";

export interface CutPiece {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  orientation: "tegak" | "miring";
}

export interface RemnantPiece {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  position: string;
  fullStripW?: number;
  fullStripH?: number;
}

export interface RemnantGroup {
  key: string;
  w: number;
  h: number;
  countPerPlano: number;
  position: string;
  areaPerPieceCm2: number;
  totalAreaPerPlanoCm2: number;
  usable: boolean;
  fullStripW?: number;
  fullStripH?: number;
}

export interface LayoutSolution {
  name: string;
  total: number;
  pieces: CutPiece[];
  remnants: RemnantPiece[];
  remnantGroups: RemnantGroup[];
  usedAreaCm2: number;
  totalAreaCm2: number;
  wasteAreaCm2: number;
  usableRemnantAreaCm2: number;
  efficiencyPercent: number;
  tegakCount: number;
  miringCount: number;
}

interface CuttingLayoutVisualizerProps {
  planoLength: number; // Panjang Plano (cm)
  planoWidth: number;  // Lebar Plano (cm)
  cutLength: number;   // Panjang Potongan Jadi (cm)
  cutWidth: number;    // Lebar Potongan Jadi (cm)
  totalPlanoSheets?: number; // Opsional: total lembar plano produksi untuk estimasi lembar sisa bahan
  onLayoutCalculated?: (solution: LayoutSolution) => void;
}

const round2 = (n: number): number => Math.round(n * 100) / 100;

const fmtDim = (n: number): string => {
  const r = round2(n);
  return Number.isInteger(r) ? String(r) : r.toLocaleString("id-ID", { maximumFractionDigits: 2 });
};

const MIN_USABLE_REMNANT_CM = 5; // Sisa bahan dengan lebar & panjang >= 5 cm layak disimpan di gudang

export default function CuttingLayoutVisualizer({
  planoLength,
  planoWidth,
  cutLength,
  cutWidth,
  totalPlanoSheets,
  onLayoutCalculated,
}: CuttingLayoutVisualizerProps) {
  // Mode selector: 'best' (Kombinasi Optimal), 'tegak' (Searah Plano), 'miring' (Putar 90°)
  const [selectedMode, setSelectedMode] = useState<"best" | "tegak" | "miring">("best");

  // Calculate layout solutions + exact remnant (sisa bahan) dimensions
  const solutions = useMemo(() => {
    // Orientasi kanvas plano standar landscape: sisi terpanjang horizontal (X), sisi terpendek vertikal (Y)
    const rawPW = Math.max(1, planoWidth || 1);
    const rawPL = Math.max(1, planoLength || 1);
    const sheetW = round2(Math.max(rawPL, rawPW));
    const sheetH = round2(Math.min(rawPL, rawPW));

    const rawCW = Math.max(0.1, cutWidth || 0.1);
    const rawCL = Math.max(0.1, cutLength || 0.1);
    const cLong = round2(Math.max(rawCL, rawCW));
    const cShort = round2(Math.min(rawCL, rawCW));

    const totalArea = round2(sheetW * sheetH);

    const buildSolution = (
      name: string,
      pieces: CutPiece[],
      remnants: RemnantPiece[]
    ): LayoutSolution => {
      const usedArea = pieces.reduce((sum, p) => sum + p.w * p.h, 0);
      const wasteArea = Math.max(0, totalArea - usedArea);
      const efficiency =
        totalArea > 0 ? Math.min(100, Math.round((usedArea / totalArea) * 1000) / 10) : 0;
      const tegakCount = pieces.filter((p) => p.orientation === "tegak").length;
      const miringCount = pieces.filter((p) => p.orientation === "miring").length;

      // Kelompokkan potongan sisa bahan yang memiliki dimensi & posisi serupa
      const groupMap = new Map<string, RemnantGroup>();
      for (const rem of remnants) {
        if (rem.w <= 0.01 || rem.h <= 0.01) continue;
        const key = `${rem.position}-${rem.w}x${rem.h}`;
        const minSide = Math.min(rem.w, rem.h);
        const usable = minSide >= MIN_USABLE_REMNANT_CM;
        const area = round2(rem.w * rem.h);
        const existing = groupMap.get(key);
        if (existing) {
          existing.countPerPlano += 1;
          existing.totalAreaPerPlanoCm2 = round2(existing.totalAreaPerPlanoCm2 + area);
        } else {
          groupMap.set(key, {
            key,
            w: rem.w,
            h: rem.h,
            countPerPlano: 1,
            position: rem.position,
            areaPerPieceCm2: area,
            totalAreaPerPlanoCm2: area,
            usable,
            fullStripW: rem.fullStripW,
            fullStripH: rem.fullStripH,
          });
        }
      }

      const remnantGroups = Array.from(groupMap.values());
      const usableRemnantAreaCm2 = round2(
        remnantGroups
          .filter((g) => g.usable)
          .reduce((sum, g) => sum + g.totalAreaPerPlanoCm2, 0)
      );

      return {
        name,
        total: pieces.length,
        pieces,
        remnants,
        remnantGroups,
        usedAreaCm2: round2(usedArea),
        totalAreaCm2: totalArea,
        wasteAreaCm2: round2(wasteArea),
        usableRemnantAreaCm2,
        efficiencyPercent: efficiency,
        tegakCount,
        miringCount,
      };
    };

    // Helper untuk grid murni (Searah maupun Putar 90°)
    // Potongan ditempatkan rapat di kiri-bawah sehingga sisa bahan utuh berada di bagian Atas & Kanan
    const buildPureGrid = (
      label: string,
      pw: number,
      ph: number,
      orientation: "tegak" | "miring"
    ): LayoutSolution => {
      const cols = Math.floor(sheetW / pw);
      const rows = Math.floor(sheetH / ph);

      if (cols <= 0 || rows <= 0) {
        return buildSolution(
          label,
          [],
          [{ id: 1, x: 0, y: 0, w: sheetW, h: sheetH, position: "Plano Utuh (Potongan Melebihi Plano)" }]
        );
      }

      const usedW = round2(cols * pw);
      const usedH = round2(rows * ph);
      const remTopH = round2(sheetH - usedH);
      const remRightW = round2(sheetW - usedW);
      const yStart = remTopH;

      const pieces: CutPiece[] = [];
      const remnants: RemnantPiece[] = [];
      let pId = 1;
      let rId = 1;

      if (remTopH > 0.01) {
        remnants.push({
          id: rId++,
          x: 0,
          y: 0,
          w: sheetW,
          h: remTopH,
          position: "Sisa Atas",
        });
      }

      for (let r = 0; r < rows; r++) {
        const rowY = round2(yStart + r * ph);
        for (let c = 0; c < cols; c++) {
          pieces.push({
            id: pId++,
            x: round2(c * pw),
            y: rowY,
            w: pw,
            h: ph,
            orientation,
          });
        }
        if (remRightW > 0.01) {
          remnants.push({
            id: rId++,
            x: usedW,
            y: rowY,
            w: remRightW,
            h: ph,
            position: "Sisa Kanan",
            fullStripW: rows > 1 ? remRightW : undefined,
            fullStripH: rows > 1 ? usedH : undefined,
          });
        }
      }

      return buildSolution(label, pieces, remnants);
    };

    // 1. Murni Searah / Tegak (cLong × cShort sejajar plano)
    const solTegak = buildPureGrid("Murni Searah Plano", cLong, cShort, "tegak");

    // 2. Murni Miring / Putar 90° (cShort × cLong)
    const solMiring = buildPureGrid("Murni Putar 90°", cShort, cLong, "miring");

    // 3. Kombinasi Campuran (Guillotine Split) untuk mencari yield maksimal
    let bestCombo: LayoutSolution =
      solTegak.total >= solMiring.total ? solTegak : solMiring;

    const isBetter = (cand: LayoutSolution, curr: LayoutSolution) => {
      if (cand.total !== curr.total) return cand.total > curr.total;
      return cand.usableRemnantAreaCm2 > curr.usableRemnantAreaCm2;
    };

    // Helper Horizontal Split: Pita 1 (k baris w1×h1) + Pita 2 (r2 baris w2×h2), rapat bawah-kiri
    const tryHorizontalSplits = (
      label: string,
      w1: number,
      h1: number,
      o1: "tegak" | "miring",
      w2: number,
      h2: number,
      o2: "tegak" | "miring"
    ) => {
      const cols1 = Math.floor(sheetW / w1);
      const maxRows1 = Math.floor(sheetH / h1);
      const cols2 = Math.floor(sheetW / w2);
      if (cols1 <= 0 || cols2 <= 0) return;

      for (let k = 1; k <= maxRows1; k++) {
        const remH = round2(sheetH - k * h1);
        const r2 = Math.floor(remH / h2);
        if (r2 <= 0) continue;

        const usedH = round2(k * h1 + r2 * h2);
        const remTopH = round2(sheetH - usedH);
        const yStart1 = remTopH;
        const yStart2 = round2(yStart1 + k * h1);

        const pieces: CutPiece[] = [];
        const remnants: RemnantPiece[] = [];
        let pId = 1;
        let rId = 1;

        if (remTopH > 0.01) {
          remnants.push({
            id: rId++,
            x: 0,
            y: 0,
            w: sheetW,
            h: remTopH,
            position: "Sisa Atas",
          });
        }

        const remRight1 = round2(sheetW - cols1 * w1);
        for (let r = 0; r < k; r++) {
          const rowY = round2(yStart1 + r * h1);
          for (let c = 0; c < cols1; c++) {
            pieces.push({ id: pId++, x: round2(c * w1), y: rowY, w: w1, h: h1, orientation: o1 });
          }
          if (remRight1 > 0.01) {
            remnants.push({
              id: rId++,
              x: round2(cols1 * w1),
              y: rowY,
              w: remRight1,
              h: h1,
              position: "Sisa Kanan Atas",
              fullStripW: k > 1 ? remRight1 : undefined,
              fullStripH: k > 1 ? round2(k * h1) : undefined,
            });
          }
        }

        const remRight2 = round2(sheetW - cols2 * w2);
        for (let r = 0; r < r2; r++) {
          const rowY = round2(yStart2 + r * h2);
          for (let c = 0; c < cols2; c++) {
            pieces.push({ id: pId++, x: round2(c * w2), y: rowY, w: w2, h: h2, orientation: o2 });
          }
          if (remRight2 > 0.01) {
            remnants.push({
              id: rId++,
              x: round2(cols2 * w2),
              y: rowY,
              w: remRight2,
              h: h2,
              position: "Sisa Kanan Bawah",
              fullStripW: r2 > 1 ? remRight2 : undefined,
              fullStripH: r2 > 1 ? round2(r2 * h2) : undefined,
            });
          }
        }

        const cand = buildSolution(label, pieces, remnants);
        if (isBetter(cand, bestCombo)) {
          bestCombo = cand;
        }
      }
    };

    // Helper Vertical Split: Zona Kiri (m kolom w1×h1) + Zona Kanan (c2 kolom w2×h2), rapat bawah-kiri tiap zona
    const tryVerticalSplits = (
      label: string,
      w1: number,
      h1: number,
      o1: "tegak" | "miring",
      w2: number,
      h2: number,
      o2: "tegak" | "miring"
    ) => {
      const maxCols1 = Math.floor(sheetW / w1);
      const r1 = Math.floor(sheetH / h1);
      const r2 = Math.floor(sheetH / h2);
      if (r1 <= 0 || r2 <= 0) return;

      for (let m = 1; m <= maxCols1; m++) {
        const leftW = round2(m * w1);
        const remW = round2(sheetW - leftW);
        const c2 = Math.floor(remW / w2);
        if (c2 <= 0) continue;

        const pieces: CutPiece[] = [];
        const remnants: RemnantPiece[] = [];
        let pId = 1;
        let rId = 1;

        const usedH1 = round2(r1 * h1);
        const remTop1 = round2(sheetH - usedH1);
        if (remTop1 > 0.01) {
          remnants.push({
            id: rId++,
            x: 0,
            y: 0,
            w: leftW,
            h: remTop1,
            position: "Sisa Atas Kiri",
          });
        }
        for (let r = 0; r < r1; r++) {
          const rowY = round2(remTop1 + r * h1);
          for (let c = 0; c < m; c++) {
            pieces.push({ id: pId++, x: round2(c * w1), y: rowY, w: w1, h: h1, orientation: o1 });
          }
        }

        const usedH2 = round2(r2 * h2);
        const remTop2 = round2(sheetH - usedH2);
        if (remTop2 > 0.01) {
          remnants.push({
            id: rId++,
            x: leftW,
            y: 0,
            w: remW,
            h: remTop2,
            position: "Sisa Atas Kanan",
          });
        }

        const remRight2 = round2(remW - c2 * w2);
        for (let r = 0; r < r2; r++) {
          const rowY = round2(remTop2 + r * h2);
          for (let c = 0; c < c2; c++) {
            pieces.push({
              id: pId++,
              x: round2(leftW + c * w2),
              y: rowY,
              w: w2,
              h: h2,
              orientation: o2,
            });
          }
          if (remRight2 > 0.01) {
            remnants.push({
              id: rId++,
              x: round2(leftW + c2 * w2),
              y: rowY,
              w: remRight2,
              h: h2,
              position: "Sisa Kanan",
              fullStripW: r2 > 1 ? remRight2 : undefined,
              fullStripH: r2 > 1 ? usedH2 : undefined,
            });
          }
        }

        const cand = buildSolution(label, pieces, remnants);
        if (isBetter(cand, bestCombo)) {
          bestCombo = cand;
        }
      }
    };

    tryHorizontalSplits(
      "Kombinasi Horizontal (Searah + Putar 90°)",
      cLong,
      cShort,
      "tegak",
      cShort,
      cLong,
      "miring"
    );
    tryHorizontalSplits(
      "Kombinasi Horizontal (Putar 90° + Searah)",
      cShort,
      cLong,
      "miring",
      cLong,
      cShort,
      "tegak"
    );
    tryVerticalSplits(
      "Kombinasi Vertikal (Kiri Searah, Kanan Putar 90°)",
      cLong,
      cShort,
      "tegak",
      cShort,
      cLong,
      "miring"
    );
    tryVerticalSplits(
      "Kombinasi Vertikal (Kiri Putar 90°, Kanan Searah)",
      cShort,
      cLong,
      "miring",
      cLong,
      cShort,
      "tegak"
    );

    return {
      best: bestCombo,
      tegak: solTegak,
      miring: solMiring,
      sheetW,
      sheetH,
      cLong,
      cShort,
    };
  }, [planoLength, planoWidth, cutLength, cutWidth]);

  // Active solution according to selected mode
  const activeSolution = useMemo(() => {
    if (selectedMode === "tegak") return solutions.tegak;
    if (selectedMode === "miring") return solutions.miring;
    return solutions.best;
  }, [selectedMode, solutions]);

  // Notify parent component of calculated layout
  React.useEffect(() => {
    if (onLayoutCalculated) {
      onLayoutCalculated(activeSolution);
    }
  }, [activeSolution, onLayoutCalculated]);

  const { sheetW, sheetH } = solutions;

  // Skala presisi SVG (10 unit = 1 cm) agar garis ukur & tipografi tampil tajam di semua ukuran
  const SCALE = 10;
  const W = sheetW * SCALE;
  const H = sheetH * SCALE;
  const ref = Math.max(W, H);

  const stdFont = ref * 0.029;
  const padLeft = ref * 0.032;
  const padTop = ref * 0.032;
  const padRight = ref * 0.095;
  const padBottom = ref * 0.092;

  const viewBoxW = padLeft + W + padRight;
  const viewBoxH = padTop + H + padBottom;

  const strokeOuter = ref * 0.0028;
  const strokeCut = ref * 0.0026;
  const strokeRemnant = ref * 0.0014;
  const strokeDim = ref * 0.0018;

  // Helper merender label ukuran lebar (atas-tengah) & tinggi (kiri-tengah vertikal -90°) seperti gambar teknis
  const renderDimensionLabels = (
    boxX: number,
    boxY: number,
    boxW: number,
    boxH: number,
    wCm: number,
    hCm: number,
    color: string,
    isRemnant: boolean
  ) => {
    const rx = padLeft + boxX * SCALE;
    const ry = padTop + boxY * SCALE;
    const rw = boxW * SCALE;
    const rh = boxH * SCALE;

    const minSide = Math.min(rw, rh);
    const maxSide = Math.max(rw, rh);
    const baseTarget = isRemnant ? stdFont * 0.96 : stdFont;
    const fontSize = Math.max(
      ref * 0.012,
      Math.min(baseTarget, minSide * 0.62, maxSide * 0.26)
    );

    const wLabel = fmtDim(wCm);
    const hLabel = fmtDim(hCm);

    // Jika kotak terlalu mikro di kedua sisi, tampilkan satu label ringkas di tengah
    if (rw < fontSize * 2.1 && rh < fontSize * 2.1) {
      return (
        <text
          x={rx + rw / 2}
          y={ry + rh / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fill={color}
          fontSize={fontSize * 0.85}
          fontWeight={isRemnant ? 500 : 600}
          fontFamily="ui-sans-serif, system-ui, -apple-system, sans-serif"
        >
          {wLabel}×{hLabel}
        </text>
      );
    }

    const topInset = rh < fontSize * 1.75 ? rh / 2 : fontSize * 0.88;
    const leftInset = rw < fontSize * 1.75 ? rw / 2 : fontSize * 0.88;

    // Cegah tabrakan teks pada strip vertikal yang sangat sempit
    const hCenterY =
      rw < fontSize * 2.2 && rh > fontSize * 3.0 ? ry + rh * 0.56 : ry + rh / 2;
    // Cegah tabrakan teks pada strip horizontal yang sangat tipis
    const wCenterX =
      rh < fontSize * 2.2 && rw > fontSize * 3.0 ? rx + rw * 0.54 : rx + rw / 2;

    const hX = rx + leftInset;
    const hY = hCenterY;

    return (
      <>
        {/* Ukuran Lebar (Horizontal di sisi atas-tengah kotak) */}
        <text
          x={wCenterX}
          y={ry + topInset}
          textAnchor="middle"
          dominantBaseline="central"
          fill={color}
          fontSize={fontSize}
          fontWeight={isRemnant ? 500 : 500}
          fontFamily="ui-sans-serif, system-ui, -apple-system, sans-serif"
        >
          {wLabel}
        </text>

        {/* Ukuran Tinggi (Vertikal -90° di sisi kiri-tengah kotak) */}
        <text
          x={hX}
          y={hY}
          textAnchor="middle"
          dominantBaseline="central"
          transform={`rotate(-90 ${hX} ${hY})`}
          fill={color}
          fontSize={fontSize}
          fontWeight={isRemnant ? 500 : 500}
          fontFamily="ui-sans-serif, system-ui, -apple-system, sans-serif"
        >
          {hLabel}
        </text>
      </>
    );
  };

  // Koordinat garis ukur merah luar (kanan & bawah)
  const dimBottomY = padTop + H + ref * 0.036;
  const dimRightX = padLeft + W + ref * 0.036;
  const tickHalf = ref * 0.012;
  const dimRedColor = "#C53D2F";

  return (
    <div className="rounded-xl border border-[#E2E6ED] dark:border-[#26334D] bg-[#F8FAFC] dark:bg-[#0B1525] p-4 sm:p-5 space-y-4">
      {/* Header & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E2E6ED]/70 dark:border-[#26334D]/70">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="text-sm font-bold text-[#1B2436] dark:text-[#E8ECF3] tracking-tight">
            Diagram Layout Potong & Ukuran Sisa Bahan:
          </h4>
          <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-[#EFF4FE] text-[#2B5FC7] dark:bg-[#1D4ED8]/25 dark:text-[#93C5FD]">
            {activeSolution.total} pcs / lembar plano
          </span>
        </div>

        {/* Legend sesuai warna diagram teknis */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-sm bg-[#EDE7F3] border border-[#111827]" />
            <span className="text-[#475569] dark:text-[#94A3B8] font-medium text-[11px]">
              Searah ({activeSolution.tegakCount})
            </span>
          </div>
          {activeSolution.miringCount > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-sm bg-[#FDF0D5] border border-[#111827]" />
              <span className="text-[#475569] dark:text-[#94A3B8] font-medium text-[11px]">
                Putar 90° ({activeSolution.miringCount})
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-sm bg-[#F5F6F8] border border-[#9CA3AF]" />
            <span className="text-[#475569] dark:text-[#94A3B8] font-medium text-[11px]">
              Sisa Bahan / Offcut ({activeSolution.remnants.length})
            </span>
          </div>
        </div>
      </div>

      {/* Mode Switches: Optimal vs Searah vs Putar 90° */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-[#64748B] dark:text-[#94A3B8] font-medium mr-1 text-[11px]">
          Skema Potong:
        </span>
        <button
          type="button"
          onClick={() => setSelectedMode("best")}
          className={`px-3 py-1 rounded-lg font-semibold text-xs transition-all ${
            selectedMode === "best"
              ? "bg-[#2B5FC7] text-white shadow-sm"
              : "bg-white dark:bg-[#16223A] text-[#475569] dark:text-[#94A3B8] border border-[#E2E6ED] dark:border-[#26334D] hover:border-[#2B5FC7]"
          }`}
        >
          Kombinasi Optimal ({solutions.best.total} pcs)
        </button>
        <button
          type="button"
          onClick={() => setSelectedMode("tegak")}
          className={`px-2.5 py-1 rounded-lg font-medium text-xs transition-all ${
            selectedMode === "tegak"
              ? "bg-[#2B5FC7] text-white shadow-sm"
              : "bg-white dark:bg-[#16223A] text-[#475569] dark:text-[#94A3B8] border border-[#E2E6ED] dark:border-[#26334D] hover:border-[#2B5FC7]"
          }`}
        >
          Murni Searah ({solutions.tegak.total} pcs)
        </button>
        <button
          type="button"
          onClick={() => setSelectedMode("miring")}
          className={`px-2.5 py-1 rounded-lg font-medium text-xs transition-all ${
            selectedMode === "miring"
              ? "bg-[#D97706] text-white shadow-sm"
              : "bg-white dark:bg-[#16223A] text-[#475569] dark:text-[#94A3B8] border border-[#E2E6ED] dark:border-[#26334D] hover:border-[#D97706]"
          }`}
        >
          Murni Putar 90° ({solutions.miring.total} pcs)
        </button>
      </div>

      {/* Technical Drawing SVG Canvas Container */}
      <div className="relative w-full rounded-xl bg-white border border-[#CBD5E1] dark:border-[#334155] p-3 sm:p-4 shadow-sm flex flex-col items-center justify-center overflow-hidden">
        <div className="w-full flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[#475569] pb-2 px-1 border-b border-dashed border-[#E2E8F0] mb-2">
          <span>Plano Utuh: {fmtDim(sheetW)} × {fmtDim(sheetH)} cm</span>
          <span>Potong Jadi: {fmtDim(cutLength)} × {fmtDim(cutWidth)} cm</span>
          <span className="text-[#64748B]">Satuan: cm</span>
        </div>

        <div className="w-full max-w-[680px] flex items-center justify-center py-1">
          <svg
            viewBox={`0 0 ${viewBoxW} ${viewBoxH}`}
            className="w-full h-auto max-h-[430px] select-none"
            style={{ aspectRatio: `${viewBoxW} / ${viewBoxH}` }}
          >
            <defs>
              <filter id="planoDropShadow" x="-4%" y="-4%" width="112%" height="112%">
                <feDropShadow
                  dx={ref * 0.004}
                  dy={ref * 0.005}
                  stdDeviation={ref * 0.006}
                  floodColor="#0F172A"
                  floodOpacity="0.18"
                />
              </filter>
            </defs>

            {/* 1. Dasar Lembar Plano dengan Bayangan Halus */}
            <rect
              x={padLeft}
              y={padTop}
              width={W}
              height={H}
              fill="#F5F6F8"
              filter="url(#planoDropShadow)"
            />

            {/* 2. Area Sisa Bahan (Remnants) beserta ukuran Lebar & Tinggi dalam warna abu-abu */}
            {activeSolution.remnants.map((rem) => (
              <g key={`rem-${rem.id}`}>
                <rect
                  x={padLeft + rem.x * SCALE}
                  y={padTop + rem.y * SCALE}
                  width={rem.w * SCALE}
                  height={rem.h * SCALE}
                  fill="#F5F6F8"
                  stroke="#A0AEC0"
                  strokeWidth={strokeRemnant}
                />
                {renderDimensionLabels(
                  rem.x,
                  rem.y,
                  rem.w,
                  rem.h,
                  rem.w,
                  rem.h,
                  "#6E7B8B",
                  true
                )}
              </g>
            ))}

            {/* 3. Area Potongan Jadi (Cut Pieces) dengan garis potong hitam tegas & label ukuran */}
            {activeSolution.pieces.map((piece) => {
              const isTegak = piece.orientation === "tegak";
              const fillColor = isTegak ? "#EDE7F3" : "#FDF0D5";

              return (
                <g key={`cut-${piece.id}`} className="transition-opacity duration-150 hover:opacity-90">
                  <rect
                    x={padLeft + piece.x * SCALE}
                    y={padTop + piece.y * SCALE}
                    width={piece.w * SCALE}
                    height={piece.h * SCALE}
                    fill={fillColor}
                    stroke="#0F172A"
                    strokeWidth={strokeCut}
                  />
                  {renderDimensionLabels(
                    piece.x,
                    piece.y,
                    piece.w,
                    piece.h,
                    piece.w,
                    piece.h,
                    "#111827",
                    false
                  )}
                </g>
              );
            })}

            {/* 4. Bingkai Luar Kertas Plano Utuh */}
            <rect
              x={padLeft}
              y={padTop}
              width={W}
              height={H}
              fill="none"
              stroke="#1E293B"
              strokeWidth={strokeOuter}
            />

            {/* 5. Garis Ukur Merah Sisi Bawah (Panjang Horizontal Plano) */}
            <g>
              <line
                x1={padLeft}
                y1={dimBottomY}
                x2={padLeft + W}
                y2={dimBottomY}
                stroke={dimRedColor}
                strokeWidth={strokeDim}
              />
              <line
                x1={padLeft}
                y1={dimBottomY - tickHalf}
                x2={padLeft}
                y2={dimBottomY + tickHalf}
                stroke={dimRedColor}
                strokeWidth={strokeDim}
              />
              <line
                x1={padLeft + W}
                y1={dimBottomY - tickHalf}
                x2={padLeft + W}
                y2={dimBottomY + tickHalf}
                stroke={dimRedColor}
                strokeWidth={strokeDim}
              />
              <text
                x={padLeft + W / 2}
                y={dimBottomY + stdFont * 1.05}
                textAnchor="middle"
                dominantBaseline="central"
                fill={dimRedColor}
                fontSize={stdFont}
                fontWeight={500}
                fontFamily="ui-sans-serif, system-ui, -apple-system, sans-serif"
              >
                {fmtDim(sheetW)}
              </text>
            </g>

            {/* 6. Garis Ukur Merah Sisi Kanan (Lebar Vertikal Plano) */}
            <g>
              <line
                x1={dimRightX}
                y1={padTop}
                x2={dimRightX}
                y2={padTop + H}
                stroke={dimRedColor}
                strokeWidth={strokeDim}
              />
              <line
                x1={dimRightX - tickHalf}
                y1={padTop}
                x2={dimRightX + tickHalf}
                y2={padTop}
                stroke={dimRedColor}
                strokeWidth={strokeDim}
              />
              <line
                x1={dimRightX - tickHalf}
                y1={padTop + H}
                x2={dimRightX + tickHalf}
                y2={padTop + H}
                stroke={dimRedColor}
                strokeWidth={strokeDim}
              />
              <text
                x={dimRightX + stdFont * 1.05}
                y={padTop + H / 2}
                textAnchor="middle"
                dominantBaseline="central"
                transform={`rotate(-90 ${dimRightX + stdFont * 1.05} ${padTop + H / 2})`}
                fill={dimRedColor}
                fontSize={stdFont}
                fontWeight={500}
                fontFamily="ui-sans-serif, system-ui, -apple-system, sans-serif"
              >
                {fmtDim(sheetH)}
              </text>
            </g>
          </svg>
        </div>
      </div>

      {/* Daftar Ukuran Sisa Bahan (Offcut) untuk Disimpan di Gudang */}
      <div className="rounded-xl bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D] p-3.5 space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <h5 className="text-xs font-bold text-[#1B2436] dark:text-[#E8ECF3]">
              Rincian Ukuran Sisa Bahan (Offcut) per Plano
            </h5>
            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
              Sisa potongan berukuran &ge; {MIN_USABLE_REMNANT_CM} cm dapat disimpan kembali ke gudang untuk pekerjaan cetak kecil berikutnya.
            </p>
          </div>
          {activeSolution.remnantGroups.some((g) => g.usable) && (
            <span className="self-start sm:self-auto text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-[#ECFDF5] text-[#065F46] dark:bg-[#064E3B]/50 dark:text-[#34D399] border border-[#A7F3D0] dark:border-[#059669]/40">
              Layak Simpan: {activeSolution.usableRemnantAreaCm2.toLocaleString("id-ID")} cm² / plano
            </span>
          )}
        </div>

        {activeSolution.remnantGroups.length === 0 ? (
          <div className="p-2.5 rounded-lg bg-[#ECFDF5] dark:bg-[#064E3B]/25 border border-[#A7F3D0] dark:border-[#059669]/40 text-xs text-[#065F46] dark:text-[#34D399] font-medium">
            100% Habis Terpakai — Tidak ada sisa potongan kertas plano.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {activeSolution.remnantGroups.map((grp) => {
              const totalPiecesAllPlano =
                totalPlanoSheets && totalPlanoSheets > 0
                  ? grp.countPerPlano * totalPlanoSheets
                  : null;

              return (
                <div
                  key={grp.key}
                  className={`p-2.5 rounded-lg border flex items-start justify-between gap-2 ${
                    grp.usable
                      ? "bg-[#F8FAFC] dark:bg-[#0F1B2D] border-[#CBD5E1] dark:border-[#26334D]"
                      : "bg-[#FFFBEB]/60 dark:bg-[#78350F]/10 border-[#FDE68A] dark:border-[#92400E]/30"
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-sm font-bold text-[#1B2436] dark:text-[#E8ECF3]">
                        {fmtDim(grp.w)} × {fmtDim(grp.h)} cm
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#E2E8F0]/70 dark:bg-[#1E293B] text-[#475569] dark:text-[#94A3B8] font-medium">
                        {grp.position}
                      </span>
                    </div>

                    <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      {grp.countPerPlano} bagian / plano
                      {grp.fullStripW && grp.fullStripH && (
                        <span className="text-[#2B5FC7] dark:text-[#60A5FA] font-medium">
                          {" "}
                          (strip utuh {fmtDim(grp.fullStripW)} × {fmtDim(grp.fullStripH)} cm)
                        </span>
                      )}
                    </div>

                    {totalPiecesAllPlano !== null && (
                      <div className="text-[10px] text-[#475569] dark:text-[#94A3B8] font-medium">
                        Estimasi total stok sisa:{" "}
                        <span className="font-semibold text-[#1B2436] dark:text-[#E8ECF3]">
                          {totalPiecesAllPlano.toLocaleString("id-ID")} lembar
                        </span>
                        {grp.fullStripW && grp.fullStripH && totalPlanoSheets
                          ? ` (atau ${totalPlanoSheets.toLocaleString("id-ID")} strip utuh ${fmtDim(grp.fullStripW)} × ${fmtDim(grp.fullStripH)} cm)`
                          : ""}
                      </div>
                    )}
                  </div>

                  <span
                    className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      grp.usable
                        ? "bg-[#ECFDF5] text-[#065F46] dark:bg-[#064E3B] dark:text-[#34D399]"
                        : "bg-[#FEF3C7] text-[#92400E] dark:bg-[#78350F] dark:text-[#FBBF24]"
                    }`}
                  >
                    {grp.usable ? "Bisa Disimpan" : "Trim Tipis"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Real-time Material Efficiency & Waste Analytics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs">
        <div className="p-2.5 rounded-lg bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D]">
          <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] block">Total Hasil Potong</span>
          <span className="text-base font-bold text-[#1B2436] dark:text-[#E8ECF3]">
            {activeSolution.total} pcs
          </span>
          <span className="text-[10px] text-[#64748B] block mt-0.5">
            {activeSolution.tegakCount} Searah + {activeSolution.miringCount} Putar 90°
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D]">
          <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] block">Bahan Terpakai</span>
          <span className="text-base font-bold text-[#2B5FC7] dark:text-[#3B6FE0]">
            {activeSolution.efficiencyPercent}%
          </span>
          <span className="text-[10px] text-[#64748B] block mt-0.5">
            {activeSolution.usedAreaCm2.toLocaleString("id-ID")} cm²
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D]">
          <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] block">Area Sisa Bahan</span>
          <span className="text-base font-bold text-[#D97706] dark:text-[#FBBF24]">
            {round2(100 - activeSolution.efficiencyPercent)}%
          </span>
          <span className="text-[10px] text-[#64748B] block mt-0.5">
            {activeSolution.wasteAreaCm2.toLocaleString("id-ID")} cm² ({activeSolution.remnants.length} bagian)
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-white dark:bg-[#16223A] border border-[#E2E6ED] dark:border-[#26334D]">
          <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] block">Luas Plano Utuh</span>
          <span className="text-base font-bold text-[#2B5FC7] dark:text-[#3B6FE0]">
            {activeSolution.totalAreaCm2.toLocaleString("id-ID")} cm²
          </span>
          <span className="text-[10px] text-[#64748B] block mt-0.5">
            {fmtDim(sheetW)} × {fmtDim(sheetH)} cm plano
          </span>
        </div>
      </div>
    </div>
  );
}
