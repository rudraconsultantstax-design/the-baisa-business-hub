// The costing & channel-pricing engine.
// COGM = (Fabric + Trims + Labour) × (1+overhead) × (1+reject) + Packaging

export interface CostInputs {
  fabricCost: number;
  trimsCost: number;
  labourCost: number;
  packagingCost: number;
}

export interface CogmBreakdown {
  subtotal: number;
  overhead: number;
  reject: number;
  packaging: number;
  cogm: number;
}

export function computeCogm(c: CostInputs, overheadPct = 0.15, rejectPct = 0.03): CogmBreakdown {
  const subtotal = c.fabricCost + c.trimsCost + c.labourCost;
  const overhead = subtotal * overheadPct;
  const reject = (subtotal + overhead) * rejectPct;
  const cogm = subtotal + overhead + reject + c.packagingCost;
  return { subtotal, overhead, reject, packaging: c.packagingCost, cogm };
}

export interface ChannelRule {
  name: string;
  multiplier: number;
  capPrice: number;
}

export interface ChannelPrice {
  name: string;
  multiplier: number;
  price: number;
  margin: number; // fraction
  capped: boolean;
  belowFloor: boolean;
}

export function priceForChannels(cogm: number, channels: ChannelRule[], floorMultiplier = 2.0): ChannelPrice[] {
  const floor = cogm * floorMultiplier;
  return channels.map((ch) => {
    let price = cogm * ch.multiplier;
    const belowFloor = price < floor;
    if (belowFloor) price = floor;
    let capped = false;
    if (ch.capPrice && price > ch.capPrice) {
      price = ch.capPrice;
      capped = true;
    }
    const margin = price > 0 ? (price - cogm) / price : 0;
    return { name: ch.name, multiplier: ch.multiplier, price: Math.round(price), margin, capped, belowFloor };
  });
}

// Margin of a SKU at its current D2C selling price.
export function skuMargin(sell: number, cogm: number): number {
  return sell > 0 ? (sell - cogm) / sell : 0;
}
