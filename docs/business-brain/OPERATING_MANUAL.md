# The Baisa Business Brain — Operating Manual

The strategy and intelligence layer for **The Baisa** (Pushpraj Fashion, Sanganer,
Jaipur). The interactive console is `baisa-business-brain.html` (open in any browser;
also published as a private Claude artifact). This manual is the same system in plain
text — the canonical reference for Ashish, Poonam, and AI agents working on the business.
The live registers and data live in the **Baisa OS app** (this repo).

Reviewed quarterly. Last updated: August 2026.

---

## 1. Identity

| | |
|---|---|
| Brand | The Baisa — women's ethnic & fusion wear ("Baisa" = daughter of the house, Rajasthani royal address) |
| Entity | Pushpraj Fashion, Sanganer, Jaipur. 3 years old: 2 trading/online, 1 manufacturing. In-house production + job-work network + Sanganer embroidery unit (24-head machine). |
| Home | baisajaipur.in (D2C, payments live) · baisajaipur.com (brand site → .in) · Instagram @the_baisa · WhatsApp +91 92510 22710 |
| Positioning | **Premium D2C-first heritage brand that manufactures** — block print, morpankh, gota, bandhani motifs on modern silhouettes (co-ords, shirt dresses, maternity, backless tops). Not a Meesho seller with a logo. |
| Customer | Indian woman 22–42; ethnic with a modern twist; shops Instagram + marketplaces; pays for story + quality. |
| Team | Ashish — strategy, money, growth · Poonam — ground ops: production, QC, dispatch, replies. |

**North Star: contribution margin per day** = pieces dispatched × (price − COGM − channel
cost). Secondary: blended return rate < 15%.

## 2. Pricing & channels

**Three shelves:** Entry ₹569–999 (5% GST band — discovery/volume) · Core ₹1,099–1,899
(margin engine) · Hero ₹1,999–2,499 (brand builders, may run made-to-order).

**The ₹999 line:** sale value ≤ ₹1,000/pc → 5% GST; above → 12%. Entry prices end at
₹999 deliberately; a reprice crossing ₹1,000 must jump to ₹1,199+, never ₹1,049.

**Floor = COGM × 2.0. Never sell below it** — liquidate via exhibitions/bundles instead.

**Channel map** (price = COGM × multiplier, from the Baisa OS pricing engine):

| Channel | × | Status | Play |
|---|---|---|---|
| D2C baisajaipur.in | 4.0 | Live | Home — best margin; all roads lead here |
| WhatsApp | 4.0 | Live | Fastest close; broadcast lists |
| Instagram | 4.0 | Live | Brand engine; feeds .in + WhatsApp |
| Meesho | 3.75 (cap ₹999) | Apply | Entry shelf, NDD badge, watch returns 15–25% |
| Amazon | 4.5 (~15–18% comm) | Apply | Core ₹699+, A+ story, FBA heroes |
| Flipkart | 4.0 (~12%) | Apply | Tier-2/3; aim F-Assured |
| Myntra | 6.0 (~35% comm) | Next | Hero shelf only — commission demands ×6 |
| AJIO | 5.5 (20–40%) | Next | "Indie"/heritage pitch, after Myntra |
| Wholesale/B2B | 2.25 (floor 2.0) | Ongoing | MOQ 24/style, Net-15 |

Marketplace price is **never below** the .in price. Marketplaces are discovery; the brand
store is margin and the relationship.

## 3. Costing engine

```
COGM = fabric(₹/m × m) + trims + cutting + stitching + finishing + labels
       + overhead 15% + rejection 3% (both on base) + branded packing
```
Reference kurti: 2.75m × ₹85 + ₹98 making + 15%/3% + ₹12 packing ≈ **₹392 COGM** →
floor ₹783 → D2C ₹1,599.

Rules: no cost sheet, no cutting · re-cost quarterly · packing is product cost · run every
new style through the console engine and save into the Baisa OS costing module.
Cost levers in order: fabric rate (2 suppliers + slab discounts) → marker efficiency
85→90% → rejection each 1% = 1% COGM → job-work rate at volume → packaging at 5k+ qty →
batch minimum 50 pcs/style-colour.

## 4. Catalog intelligence

29 live styles across 8 categories (₹569–2,499; avg multiplier ≈ ×3.6; 15 styles in the
5% GST band). Priorities: co-ords (biggest category, rising trend) · cotton kurtis/sets
(volume backbone) · maternity (loyal niche) · block-print stories (the AJIO/Myntra
pitch). Avoid until scale: heavy embroidery/beads, sarees, bridal, sub-₹300 price war.

Stock rules: **A** items (top 20% ≈ 80% revenue) 30-day stock all sizes, never out ·
**B** 15-day · **C** no re-cuts, liquidate at 45 days. SKU naming `TB-[TYPE]-[###]-[size]`
everywhere. New styles 2–4/month, 50-pc pilot before any re-cut. Styles under ×3.2
multiplier stay off high-commission channels.

## 5. Factory floor

Flow (never skip): design → fabric sourcing → pattern/grading → sample+approval → cost
sheet → fabric inspection → marker+cutting → stitching → finishing → in-line QC → final
QC → pack → dispatch. **Tech pack is the contract**: sizes ±0.5cm, fabric type/GSM/colour
code, SPI, trims, label placement, packing.

Capacity = operators × efficiency% × minutes ÷ SAM. SAM: palazzo 10–14 · basic kurti
12–18 · printed kurti 20–28 · suit set 25–35 · co-ord 28–38. 5-tailor line ≈ 50–110
pcs/day — festival volumes need job-work booked 8 weeks out.

Fabric: Sanganer/Bagru (signature block print, shoot the process) · Bhilwara (suiting) ·
Surat (georgette/festive) · Pali/Balotra (solid base) · Delhi (cotton/linen). Buy +10%
over consumption · single dye lot per style-colour · pre-wash cotton · rub/water/crease
tests before buying · 100m+ = 10–15% off, 500m+ = push Net-30 · bank payments only (ITC).

Job work — five golden rules: batch the fabric (never all at once) · deadline on WhatsApp
(legal record) · rejection redone at contractor cost · max 30% advance · 2–3 contractors
per work type. Rates (Jaipur 2025-26): kurti ₹35–55 · suit set ₹80–120 · embroidery
₹30–80 · cutting ₹8–15 · finishing ₹8–15; volume discounts 5–20%. Machines: oil daily,
needles every 8–10 hrs, service quarterly. Idle embroidery heads = rentable capacity.

## 6. Quality gate

Three gates: (1) pre-production — fabric vs PO, shade band, wash test <3% shrink, trims
tested, sealed sample ±0.5cm; (2) in-line 10% sampling — SPI 10–12 woven / 8–10 knit,
seam ≥1cm, symmetry, trim placement; (3) final — zero loose threads, ±1cm, labels, press,
pack-vs-sticker. **AQL: sample 10%; <2.5% accept · 2.5–6.5% hold & 100% check · >6.5%
reject the batch.**

Return bands: <15% excellent · 15–20% acceptable · 20–25% audit photos+chart+QC ·
**>25% pause the listing** (24-hr alert). Reason→fix: size → measure real garments into
the chart · colour → daylight, no filters · quality → trace the batch · "not as shown" →
rewrite listing. Return SOP: photograph before opening → relist / fix / claim within 72h
→ write-offs feed the rejection %.

## 7. Sales beyond marketplaces

Boutiques (Jaipur → Jodhpur/Udaipur/Ajmer/Kota): samples in hand, 3-pc trial set,
boutique margin 35–40%, Net-15 or 20% cash discount, collect weekly. Exhibitions: target
10× stall cost (Shilpgram Dec, Jaipur melas Feb–Mar, Navratri/Diwali haats, Pushkar Nov);
kit = QR standee, rack, backdrop, ₹499–999 bestsellers front. GeM: uniform tenders as
factory base-load. Export: supply Jaipur export houses now (GEAR network — pitch
2,000–5,000 pcs/mo capability); year 2 direct via IEC → AEPC → IIGF; FOB = COGM ×
3.5–4.5 in USD/AED.

## 8. Brand engine

Instagram week: Mon product · Tue behind-the-scenes · Wed styling reel · Thu customer
repost · Fri drop day · Sat Sanganer craft story · Sun festive mood. Reels: 3-second
hook → angles + fabric close-up → styling → CTA; trending audio ≤4 weeks old. Batch-shoot
Tuesday PM.

WhatsApp: 4 broadcast lists (customers / wholesale / warm IG leads / exhibition) · quick
replies (/size /fabric /delivery /bulk /return) · 2-hour SLA · every parcel carries the
QR + "10% off direct" card. Influencers: 5K–50K ethnic-fashion micros, free piece for
1 reel + 2 stories, coupon-tracked, repeat only what sells. Pinterest: pin everything.

Packaging (~₹4/parcel, inside COGM): branded polybag + QR hang tag + thank-you card
("tag @the_baisa") + care card (cuts "ruined garment" complaints ~30%). Study list:
@bunaai, @aachho, @libas.in, @suta_bombay — one repeatable idea per month each.

## 9. Money

Cash cycle: fabric paid today → settlements T+7 (Meesho) / T+14 (Amazon) / T+2 (D2C).
**Cash Friday** dashboard: inflows vs outflows, net position; two red Fridays = stop
fabric buying and collect. Four rules: fabric ≤30 days of capacity · wholesale Net-15 ·
₹25–50k emergency fund untouched · business ≠ personal account.

Working capital ladder (cheapest first): vendor credit Net-15→30 → MUDRA Kishore
₹50k–5L → invoice discounting (KredX/M1xchange 1–2%) → bank CC 20–30% of turnover
(festival surges only) → platform lending (read the fine print). Borrow only for stock
already sold.

Monthly P&L: COGS <55% · gross margin >45% (alert <35%) · opex <30% · net >15% — and take
profit out monthly. KPI bands: returns <20% (alert >25%) · inventory days 30–45 (alert
>60) · debtor days <20 (alert >30) · cash ≥₹50k (alert <₹25k) · D2C share target 35%+.

## 10. Compliance & schemes (executed via TCC)

GST: garments ≤₹1,000 → 5%, above → 12% · job work 5% · cotton fabric 5% · synthetic 12%
· embroidery (5810) 5%. Claim every ITC (bank payments + GST invoices); reconcile
marketplace TCS monthly.

Registrations: Udyam (opens every scheme door) · GST current · **trademark "The Baisa"
Class 25 (₹4,500 MSME fee — before a copycat files)** · GeM · IEC at export · Shops &
Establishment; factory licence at 10+ workers.

Schemes: Rajasthan Textile & Apparel Policy 2025 (25% capital subsidy + SGST refund — file
before the next machine purchase) · RIPS 2024 (interest subsidy) · MUDRA (working
capital) · PMEGP (route any *new* unit through it before it exists on paper, 35% women
rural) · Rajasthan export policy (75% marketplace-fee reimbursement to ₹2L/yr) · ODOP
Jaipur block print · GeM tenders. One scheme application per quarter, minimum.

## 11. Team & rituals

Poonam daily: **9–11** pull orders → pack → courier before 2 PM → returns inspected;
**11–2** DMs/WhatsApp (2h SLA) → shoot 2–3 products → post today's content → QC
spot-check; **2–5** stock register → 1 catalog upload/refresh → job-work chase →
tomorrow's packing prep. (The console's checklist auto-resets each morning.)

Weekly: Mon command review (Ashish 30 min) · Tue PM batch shoot · Wed production day ·
Fri cash Friday · Sat slow-mover sweep (45+ days old → bundle/exhibition/reseller).

Festival clocks (production = peak − lead; catalogs live 3–4 weeks pre-peak): Rakhi
(Aug) · Navratri (Oct, lead ~10 wks) · Karwa Chauth · Diwali (Nov, lead ~10 wks) ·
wedding season (Nov–Feb) · Eid · Holi · summer drop (Apr). The console computes live
countdowns.

Hiring triggers: ₹3–5L/mo → packing helper + 5–8 tailors · ₹10L → QC person + content
help · ₹25L → production + sales managers. First hire protects Poonam's time — she is
the bottleneck asset. Source: ITI colleges, SHGs; ₹8–12k experienced, quality bonuses.

## 12. Alerts (standing)

**Critical (24h):** style return rate >30% → pause & root-cause · job worker 7+ days late
→ physical visit · cash <₹25k → freeze buying, collect · shade variation mid-cut → stop
the line, call supplier.
**Warning (3 days):** hero stock <20 pcs → cut + job-work order · return rate 20–25% →
audit · platform account health yellow → fix now.
**Opportunity:** stock >45 days → liquidate · festival 8 weeks out + low stock →
accelerate · competitor style going viral → can we make it? move.

## 13. Run this system

Weekly 30 minutes (Mon): festival radar → KPI fill → returns/watchlist → set production +
content + one growth move → top-3 to Poonam. 30/60/90: **Protect** (cost every SKU, QC
gates live, festival production locked, cash Friday, Udyam+trademark) → **Expand**
(marketplace wave, IG cadence ×4 weeks, packaging kit, MUDRA file, 10 boutiques) →
**Compound** (Myntra/AJIO in, influencer cycle, export-house pitch, D2C >25%, quarter
review). Margin pehle, growth baad mein.
