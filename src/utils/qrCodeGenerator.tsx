"use client";

import React, { useMemo } from "react";

// =====================================================================
// Lightweight Zero-Dependency ISO/IEC 18004 QR Code Generator (SVG)
// Mendukung Byte Mode (UTF-8 URL) Version 1 s/d 6 (ECC Level L)
// Ukuran kode ~4 KB tanpa menaikkan bundle size node_modules.
// =====================================================================

// Tabel kapasitas Byte Mode ECC Level L: [version, totalCodewords, ecCodewordsPerBlock, dataBytesCapacity]
const VERSION_TABLE: [number, number, number, number][] = [
  [1, 26, 7, 17],
  [2, 44, 10, 32],
  [3, 70, 15, 53],
  [4, 100, 20, 78],
  [5, 134, 26, 106],
  [6, 172, 18, 134], // Version 6 uses 2 blocks of (68 data + 18 ec)
];

const ALIGNMENT_POSITIONS: Record<number, number[]> = {
  1: [],
  2: [6, 18],
  3: [6, 22],
  4: [6, 26],
  5: [6, 30],
  6: [6, 34],
};

// Galois Field GF(256) untuk Reed-Solomon Error Correction
const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) {
    GF_EXP[i] = GF_EXP[i - 255];
  }
})();

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

function getGeneratorPoly(degree: number): Uint8Array {
  let poly = new Uint8Array([1]);
  for (let i = 0; i < degree; i++) {
    const next = new Uint8Array(poly.length + 1);
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= poly[j];
      next[j + 1] ^= gfMul(poly[j], GF_EXP[i]);
    }
    poly = next;
  }
  return poly;
}

function computeReedSolomon(data: number[], ecCount: number): number[] {
  const gen = getGeneratorPoly(ecCount);
  const msg = new Uint8Array(data.length + ecCount);
  msg.set(data, 0);
  for (let i = 0; i < data.length; i++) {
    const coef = msg[i];
    if (coef !== 0) {
      for (let j = 0; j < gen.length; j++) {
        msg[i + j] ^= gfMul(gen[j], coef);
      }
    }
  }
  return Array.from(msg.slice(data.length));
}

export function generateQrMatrix(text: string): boolean[][] {
  const utf8Bytes = Array.from(new TextEncoder().encode(text));
  // Pilih versi terkecil yang muat (maks Version 6 = 134 byte)
  const payload = utf8Bytes.slice(0, 130);
  const chosen =
    VERSION_TABLE.find((v) => payload.length <= v[3]) || VERSION_TABLE[VERSION_TABLE.length - 1];
  const [version, totalCodewords, ecPerBlock] = chosen;
  const numBlocks = version === 6 ? 2 : 1;
  const totalDataCodewords = totalCodewords - ecPerBlock * numBlocks;

  // Bitstream: Mode 0100 (Byte), 8-bit length, data bytes, terminator 0000
  const bits: number[] = [];
  const pushBits = (val: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) {
      bits.push((val >> i) & 1);
    }
  };

  pushBits(0b0100, 4);
  pushBits(payload.length, 8);
  for (const b of payload) pushBits(b, 8);
  pushBits(0, Math.min(4, totalDataCodewords * 8 - bits.length));
  while (bits.length % 8 !== 0) bits.push(0);

  const dataCodewords: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | bits[i + j];
    dataCodewords.push(byte);
  }
  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (dataCodewords.length < totalDataCodewords) {
    dataCodewords.push(padBytes[padIdx % 2]);
    padIdx++;
  }

  // Reed-Solomon & Interleaving
  const finalCodewords: number[] = [];
  if (numBlocks === 1) {
    const ec = computeReedSolomon(dataCodewords, ecPerBlock);
    finalCodewords.push(...dataCodewords, ...ec);
  } else {
    const half = totalDataCodewords / 2;
    const b1 = dataCodewords.slice(0, half);
    const b2 = dataCodewords.slice(half);
    const ec1 = computeReedSolomon(b1, ecPerBlock);
    const ec2 = computeReedSolomon(b2, ecPerBlock);
    for (let i = 0; i < half; i++) {
      finalCodewords.push(b1[i], b2[i]);
    }
    for (let i = 0; i < ecPerBlock; i++) {
      finalCodewords.push(ec1[i], ec2[i]);
    }
  }

  const size = version * 4 + 17;
  const modules: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  const isFunction: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  const setFunctionModule = (r: number, c: number, dark: boolean) => {
    if (r >= 0 && r < size && c >= 0 && c < size) {
      modules[r][c] = dark;
      isFunction[r][c] = true;
    }
  };

  // Finder patterns (3 sudut)
  const drawFinder = (row: number, col: number) => {
    for (let dr = -1; dr <= 7; dr++) {
      for (let dc = -1; dc <= 7; dc++) {
        const r = row + dr;
        const c = col + dc;
        if (r < 0 || r >= size || c < 0 || c >= size) continue;
        const inOuter = dr >= 0 && dr <= 6 && (dc === 0 || dc === 6);
        const inTopBot = dc >= 0 && dc <= 6 && (dr === 0 || dr === 6);
        const inCenter = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
        setFunctionModule(r, c, inOuter || inTopBot || inCenter);
      }
    }
  };
  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    setFunctionModule(6, i, i % 2 === 0);
    setFunctionModule(i, 6, i % 2 === 0);
  }

  // Alignment patterns
  const alignCoords = ALIGNMENT_POSITIONS[version] || [];
  for (const ar of alignCoords) {
    for (const ac of alignCoords) {
      if (isFunction[ar][ac]) continue;
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const dark = Math.max(Math.abs(dr), Math.abs(dc)) !== 1;
          setFunctionModule(ar + dr, ac + dc, dark);
        }
      }
    }
  }

  // Reserve Format Info & Dark Module
  for (let i = 0; i < 9; i++) {
    if (!isFunction[8][i]) setFunctionModule(8, i, false);
    if (!isFunction[i][8]) setFunctionModule(i, 8, false);
  }
  for (let i = 0; i < 8; i++) {
    setFunctionModule(8, size - 1 - i, false);
    setFunctionModule(size - 1 - i, 8, false);
  }
  setFunctionModule(size - 8, 8, true);

  // Place data bits (zigzag kanan ke kiri)
  const allBits: number[] = [];
  for (const cw of finalCodewords) {
    for (let i = 7; i >= 0; i--) allBits.push((cw >> i) & 1);
  }

  let bitIdx = 0;
  let upward = true;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++) {
      const r = upward ? size - 1 - vert : vert;
      for (let j = 0; j < 2; j++) {
        const c = right - j;
        if (!isFunction[r][c]) {
          const dark = bitIdx < allBits.length ? allBits[bitIdx] === 1 : false;
          bitIdx++;
          // Mask pattern 0: (r + c) % 2 === 0
          modules[r][c] = (r + c) % 2 === 0 ? !dark : dark;
        }
      }
    }
    upward = !upward;
  }

  // Format information bits for ECC Level L (01) + Mask 0 (000) -> 0x77c4
  const formatBits = 0x77c4;
  const getFmtBit = (i: number) => ((formatBits >> i) & 1) === 1;

  for (let i = 0; i <= 5; i++) modules[8][i] = getFmtBit(14 - i);
  modules[8][7] = getFmtBit(8);
  modules[8][8] = getFmtBit(7);
  modules[7][8] = getFmtBit(6);
  for (let i = 9; i < 15; i++) modules[14 - i][8] = getFmtBit(14 - i);

  for (let i = 0; i < 8; i++) modules[8][size - 1 - i] = getFmtBit(i);
  for (let i = 8; i < 15; i++) modules[size - 15 + i][8] = getFmtBit(i);

  return modules;
}

interface QrCodeSvgProps {
  value: string;
  size?: number;
  className?: string;
}

export function QrCodeSvg({ value, size = 104, className = "" }: QrCodeSvgProps) {
  const matrix = useMemo(() => generateQrMatrix(value), [value]);
  const n = matrix.length;
  const quietZone = 2;
  const total = n + quietZone * 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${total} ${total}`}
      shapeRendering="crispEdges"
      className={className}
      role="img"
      aria-label={`QR Code: ${value}`}
    >
      <rect width={total} height={total} fill="#FFFFFF" />
      {matrix.map((row, r) =>
        row.map((cell, c) =>
          cell ? (
            <rect
              key={`${r}-${c}`}
              x={c + quietZone}
              y={r + quietZone}
              width={1}
              height={1}
              fill="#000000"
            />
          ) : null
        )
      )}
    </svg>
  );
}

