export function buildDirectionalPath(from, to, bendRatio = 0.42) {
  if (!from || !to) {
    return "";
  }
  const dx = to.x - from.x;
  const distance = Math.max(Math.abs(dx), 140);
  const handle = Math.max(72, distance * bendRatio);
  const c1x = from.x + handle;
  const c2x = to.x - handle;
  return `M ${from.x} ${from.y} C ${c1x} ${from.y}, ${c2x} ${to.y}, ${to.x} ${to.y}`;
}

export function stageConnectionAnchors(sourceRect, targetRect) {
  if (!sourceRect || !targetRect) {
    return null;
  }
  return {
    from: {
      x: sourceRect.right - 10,
      y: sourceRect.y,
    },
    to: {
      x: targetRect.left + 10,
      y: targetRect.y,
    },
  };
}

export function companyConnectionAnchors(sourceRect, targetRect) {
  if (!sourceRect || !targetRect) {
    return null;
  }
  const sourceToRight = sourceRect.x <= targetRect.x;
  return {
    from: {
      x: sourceToRight ? sourceRect.right - 4 : sourceRect.left + 4,
      y: sourceRect.y,
    },
    to: {
      x: sourceToRight ? targetRect.left + 4 : targetRect.right - 4,
      y: targetRect.y,
    },
  };
}
