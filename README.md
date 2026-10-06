# Foxwana Clarity

Build a complete, professional, responsive trading-analysis web application called:

FOXWANA
CRT Market Intelligence

The product is created by Fokosa Paul Lekwana.

IMPORTANT:
Build the application directly from the specifications below. Do not simplify, remove, replace, or reinterpret the core requirements. Do not add unnecessary trading indicators or clutter. CRT must remain the central methodology.

The application must work professionally on BOTH:
1. Desktop/PC
2. Mobile

Both versions must use the same brand, data, logic and functionality, but the layout must automatically adapt to the screen size. Desktop can use spacious multi-column layouts where useful, while mobile should use clean stacked layouts, bottom navigation or compact navigation where appropriate.

The application should look like a serious professional SaaS product that could later become a native mobile application.

==================================================
1. BRAND / VISUAL IDENTITY
==================================================

Brand name:
FOXWANA

Subtitle:
CRT Market Intelligence

Create a modern, memorable, minimal FOXWANA logo.

Logo concept:
- A clean minimalist fox head.
- Subtly incorporate a candlestick, price movement or chart shape into the fox design.
- The logo must work as:
  - Website logo
  - Mobile app icon
  - Favicon
  - Loading screen
  - Small watermark
- Do NOT use an emoji as the final logo.
- The logo should look professional in both light and dark mode.

Visual philosophy:
- Professional
- Minimal
- Modern
- Clean
- Spacious
- Easy to understand
- No clutter
- No excessive cards
- No unnecessary animations
- No excessive gradients
- No rainbow colors
- Do not make the application look like a traditional indicator dashboard.

Color system:
- Blue = bullish / BUY / positive technical confirmation
- Red = bearish / SELL / negative technical confirmation
- White / light gray / charcoal / dark neutral colors = normal interface
- Small amount of amber/yellow = warning or elevated event/spike risk
- Neutral gray = NO TRADE / unavailable / waiting
- Use colors sparingly and only where they communicate something important.

The interface should prioritize information hierarchy rather than decoration.

==================================================
2. CORE PURPOSE
==================================================

FOXWANA is a multi-timeframe trading-analysis platform centered around Candle Range Theory (CRT).

CRT is the PRIMARY methodology.

Supporting concepts are:
- Market structure
- Liquidity
- Smart Money Concepts
- MSNR / important support and resistance
- Order Blocks
- Fair Value Gaps
- BOS
- CHoCH
- Fibonacci 50%-75%
- Historical price reactions
- Session context
- Fundamental/news analysis

Do NOT add traditional indicators such as:
- RSI
- MACD
- Stochastic
- Bollinger Bands
- Moving averages
- CCI
- etc.

The application must NOT become overloaded with indicators.

The philosophy is:

CRT identifies the opportunity.
Historical price action identifies WHERE.
Validated OB/FVG identifies the entry area.
Market structure and liquidity provide confirmation.
Fundamentals provide directional context and event/spike risk.
CRT determines the main objective/target.

==================================================
3. MAIN APPLICATION NAVIGATION
==================================================

Keep navigation simple and organized.

Main sections:

1. Dashboard
2. Analysis
3. Markets
4. Fundamentals
5. Trade Journal
6. Statistics
7. Settings
8. About

Do not create unnecessary sections.

Desktop:
- Use a clean collapsible sidebar.
- Sidebar should be compact and professional.
- Main content should have plenty of spacing.

Mobile:
- Use a compact navigation system, preferably bottom navigation or a clean mobile menu.
- Do not squeeze the desktop sidebar into mobile.
- Information must remain easy to read.

==================================================
4. DASHBOARD
==================================================

The dashboard must answer:

"What is happening in the market right now?"

Display only the most important information.

Example structure:

FOXWANA
CRT Market Intelligence

MARKET OVERVIEW

Watchlist:
- XAUUSD
- EURUSD
- GBPUSD
- USDJPY
- USDCHF
- USDCAD
- AUDUSD
- Major FX pairs
- Major indices
- Metals

Each market can display:
- Bullish
- Bearish
- Developing
- Confirmed
- No Trade
- Fundamental event risk

Use blue for bullish.
Use red for bearish.
Use neutral gray for no trade.
Use small amber warnings for elevated event risk.

Dashboard should also show:
- Important upcoming news
- Active high-impact events
- Fundamental currency bias
- Spike risk
- Current CRT setups
- Markets being watched
- Recent journal activity

Do not display every technical detail on the dashboard. Users can click into Analysis for full details.

==================================================
5. MARKET ANALYSIS
==================================================

Analysis is the main part of FOXWANA.

The user must be able to analyze a market using:

A. Uploaded screenshots
B. Market data

The application must support both.

The user should not always have to upload screenshots, especially for Daily, 4H and higher timeframes.

If live/historical market data is available through an API/data provider, use it.

If an API is not yet connected, create the application architecture so a market-data provider can be connected later without rebuilding the analysis interface.

==================================================
6. SCREENSHOT ANALYSIS
==================================================

Allow the user to upload approximately 2-3 chart screenshots for an analysis.

Typical screenshot hierarchy:

For normal/intraday analysis:
1. Daily or 4H
2. 1H / 30M
3. 15M / 5M

For long-term analysis:
1. Weekly
2. Daily
3. 4H
4. 1H
5. 15M

The user can upload screenshots individually.

The system should attempt to identify:
- Symbol
- Timeframe
- Price
- Highs/lows
- Candle structure
- CRT structure
- Liquidity
- FVG
- Order Blocks
- BOS
- CHoCH
- Support/resistance
- Historical reaction areas

If the timeframe cannot reliably be identified, ask the user to label it.

Do not pretend that image analysis knows information that cannot actually be seen.

==================================================
7. HISTORICAL DATA / MEMORY
==================================================

FOXWANA must not analyze only the current visible candles.

It must consider relevant historical price information.

Track important:
- Previous Monthly High
- Previous Monthly Low
- Previous Weekly High
- Previous Weekly Low
- Previous Daily High
- Previous Daily Low
- Major swing highs
- Major swing lows
- Important 4H levels
- Important 1H levels
- Previous reaction zones
- Repeated historical reaction areas

For swing and long-term analysis, historical levels are especially important.

The system should remember relevant chart data within an analysis/session and use previous observations when analyzing subsequent charts.

The user should not have to repeatedly explain the same historical context if the system already has the data.

==================================================
8. CRT METHODOLOGY
==================================================

CRT is the primary methodology.

Use these timeframe layers:

Monthly
Weekly (1W)
Daily
4H
1H
30M
15M
5M

The application should detect CRT structures across relevant timeframes.

Original Daily CRT logic provided by the creator:

DAILY DATA:
Previous daily candle:
- Open
- High
- Low
- Close

Current daily candle:
- Open
- High
- Low
- Close

BEARISH CRT:
1. Previous daily candle closes above its open.
2. Current daily candle closes below its open.
3. Current high is greater than previous high.
4. Current close returns inside the previous daily range:
   current close <= previous high
   AND
   current close >= previous low.

If all conditions are true:
BEARISH CRT DETECTED.

BULLISH CRT:
1. Previous daily candle closes below its open.
2. Current daily candle closes above its open.
3. Current low is lower than previous low.
4. Current close returns inside the previous daily range:
   current close <= previous high
   AND
   current close >= previous low.

If all conditions are true:
BULLISH CRT DETECTED.

This original Daily CRT logic should form part of the CRT engine.

Generalize the methodology appropriately for other supported timeframes while preserving the same CRT principles.

The system must identify:
- Previous range
- Liquidity sweep
- Directional change
- Return into previous range
- CRT target
- CRT invalidation

==================================================
9. MULTI-TIMEFRAME CRT
==================================================

FOXWANA should look for nested/aligned CRT structures.

Example:

Weekly CRT
↓
Daily CRT
↓
4H structure
↓
1H confirmation
↓
15M entry

The system should identify whether higher timeframe CRTs agree or conflict.

Example:

Weekly: Bullish
Daily: Bullish
4H: Bullish
1H: Bearish
15M: Bearish

Show:

MULTI-TIMEFRAME CONFLICT

Do not force a trade simply because some lower timeframe signal exists.

Higher timeframe context must carry more importance for swing and long-term setups.

==================================================
10. TRADING MODES
==================================================

Provide four analysis modes:

1. SCALPING
2. INTRADAY
3. SWING
4. LONG-TERM / POSITION

--------------------------------
SCALPING
--------------------------------

Typical trade duration:
Approximately 5 minutes to 1 hour.

Use:
- 30M
- 15M
- 5M
- lower timeframe confirmation where appropriate

Scalping states:

NO TRADE
DEVELOPING
TRIGGER WATCH
CONFIRMED

Do not simply say "no setup" when a setup is forming.

Example:

15M CRT detected
+
Liquidity sweep detected
+
FVG forming
+
BOS not confirmed

Show:

DEVELOPING
Waiting for BOS confirmation.

When the missing condition appears:

TRIGGER WATCH → CONFIRMED

--------------------------------
INTRADAY
--------------------------------

Typical duration:
Approximately 1 hour to several hours.

Primary timeframes:
15M
30M
1H
4H

Use higher timeframe context and lower timeframe confirmation.

--------------------------------
SWING
--------------------------------

Typical duration:
Days to weeks.

Must inspect:
- Monthly highs/lows
- Weekly highs/lows
- Daily highs/lows
- Historical reaction areas
- 4H structure
- 1H confirmation where appropriate

--------------------------------
LONG-TERM / POSITION
--------------------------------

Higher timeframe hierarchy:

1W
1D
4H
1H
15M

CRITICAL RULE:

For long-term trades, confirmation timeframes are ONLY:
1H
15M

Never use 5M or lower as long-term confirmation.

Long-term analysis must be CRT-dominant.

If Weekly/Daily/4H CRT context is weak or conflicting, lower timeframe confirmation must NOT force a long-term trade.

==================================================
11. HARD CRT ENTRY RULE
==================================================

THIS IS A CORE RULE.

A CRT signal alone does NOT create a valid entry.

The entry must occur at a technically validated reaction area.

A valid CRT entry must have at least one of:

1. Confirmed Order Block
2. Strong Fair Value Gap
3. Historically validated reaction area

Ideally multiple conditions overlap.

For BUY:
- Valid bullish CRT
- Confirmed bullish OB OR strong bullish FVG OR validated historical reaction zone
- Preferably additional market structure/liquidity confirmation

For SELL:
- Valid bearish CRT
- Confirmed bearish OB OR strong bearish FVG OR validated historical reaction zone
- Preferably additional market structure/liquidity confirmation

If CRT exists but the entry is in a random area:

DO NOT CREATE A TRADE.

Example:

CRT DETECTED
Liquidity sweep: YES
FVG: YES
But FVG is in a random area
No confirmed OB
No historical reaction

Result:

CRT DETECTED — ENTRY NOT VALID

This is mandatory.

==================================================
12. VALIDATED ORDER BLOCK
==================================================

Do NOT label every rectangle as an Order Block.

A valid OB should be evaluated using:
- Relationship to market structure
- Meaningful displacement
- Contribution to BOS
- Liquidity context
- CRT location
- Historical relevance
- Whether it has already been invalidated
- Whether price has significantly mitigated it
- Higher timeframe context

Show why an OB was accepted or rejected.

==================================================
13. STRONG FVG
==================================================

Do NOT label every gap as a valid FVG entry.

A strong FVG should consider:
- Strong displacement
- Market structure break
- Liquidity context
- CRT location
- Whether it remains unmitigated/partially mitigated
- Historical relevance
- Higher timeframe alignment

A random FVG should not qualify as an entry.

==================================================
14. HISTORICAL REACTION ZONES
==================================================

If current price reaches an area where historical price action repeatedly reacted, identify it.

Examples:
- Previous Daily reaction
- Previous 4H reaction
- Previous Weekly level
- Previous swing high/low
- Repeated support/resistance
- Liquidity level

Historical reaction can qualify as an important CRT entry location when technically appropriate.

==================================================
15. MSNR / MARKET STRUCTURE SUPPORT
==================================================

MSNR is supporting CRT, not the main strategy.

Use only useful components:

- Major support/resistance
- Previous Daily/Weekly/Monthly highs and lows
- Major swing highs/lows
- Market structure
- HH
- HL
- LH
- LL
- BOS
- CHoCH
- Flip zones
- Strong reaction zones

Do not add every possible MSNR rule.

Classify levels:

Major:
Monthly / Weekly / Daily

Intermediate:
4H / 1H

Entry:
30M / 15M / 5M

==================================================
16. LIQUIDITY
==================================================

Identify relevant liquidity such as:
- Previous highs
- Previous lows
- Equal highs
- Equal lows
- Swing highs/lows
- Liquidity sweeps

Use liquidity as supporting evidence for CRT.

==================================================
17. FIBONACCI
==================================================

Use Fibonacci only as a supporting confirmation.

Relevant retracement confirmation area:

50% - 75%

Do not display Fibonacci everywhere.

Only mention it when relevant to the setup.

==================================================
18. SIGNAL STRENGTH
==================================================

Use transparent confluence rather than pretending to calculate a win probability.

Possible confirmations:
- CRT
- Higher timeframe CRT alignment
- Confirmed OB
- Strong FVG
- Historical reaction
- Liquidity sweep
- BOS
- CHoCH
- MSNR level
- Fibonacci 50%-75%
- Fundamental alignment

FVG = strong confirmation
OB = strong confirmation
Other confirmations = supporting confirmations

Allow the signal threshold to be configurable for future testing.

Display:

STRONG
MEDIUM
WEAK

or a transparent confirmation score.

Never call the score:
- Probability of winning
- Guaranteed success
- Certainty

Always show WHY the strength was assigned.

==================================================
19. WHY BUY / WHY SELL
==================================================

Every directional analysis must explain itself.

Example:

WHY BUY?

✓ Bullish Daily CRT
✓ 4H bullish structure
✓ Liquidity sweep
✓ Confirmed bullish OB
✓ Strong bullish FVG
✓ Historical reaction area
✓ Fib 50%-75% alignment
✓ Fundamental bias supports currency

BLOCKERS:
⚠ Major resistance near CRT target
⚠ High-impact news approaching

The user should be able to understand the reasoning without being an expert.

==================================================
20. ENTRY ZONE
==================================================

Never create fake precision with a single price if the setup is actually a zone.

Display:

ENTRY ZONE
1.25380 - 1.25440

Preferred entry:
1.25410

The entry zone must be based on:
- OB
- FVG
- Historical reaction
- Market structure
- CRT location

==================================================
21. STOP LOSS
==================================================

The system must calculate a logical SL.

For BUY:
Generally below the validated entry/invalidation zone.

For SELL:
Generally above the validated entry/invalidation zone.

SL must be based on technical invalidation, not an arbitrary fixed number of pips.

==================================================
22. TAKE PROFIT
==================================================

The PRIMARY TP objective is where the CRT is expected to complete/end.

Display:

CRT TARGET

Also check:
- Major resistance/support
- Liquidity
- Historical levels
- Target obstruction

If a major level blocks the path to the CRT target, warn the user.

==================================================
23. RISK MANAGEMENT
==================================================

Allow the user to enter:

- Account size
- Risk per trade %
- Fixed monetary risk
- Optional manual lot size
- Entry
- Stop Loss
- Take Profit

Calculate appropriate position size where symbol specifications/data are available.

Do NOT ask users to paste raw MT5 passwords into the application.

Future MT5/broker integration should use a secure broker/API/bridge architecture.

==================================================
24. FUNDAMENTAL NEWS ENGINE
==================================================

Create a dedicated Fundamentals section.

It must analyze major economic events across major currencies, NOT just USD.

Currencies should include at least:

USD
EUR
GBP
JPY
CAD
AUD
NZD
CHF

Also support:
- Gold / XAUUSD
- Major FX pairs
- Major indices where appropriate

Use reputable public economic/news sources and Investing.com data where legally/technically available through appropriate APIs or data sources.

Cross-check important information rather than relying on one source when possible.

==================================================
25. PREVIOUS → FORECAST RULE
==================================================

This is the creator's fundamental methodology.

For major economic events:

If:

FORECAST >= PREVIOUS

then:

CURRENCY = STRONG

If:

FORECAST < PREVIOUS

then:

CURRENCY = WEAK

This applies to ALL major currencies.

It is NOT a USD-only rule.

Examples:

CAD event:
Previous = 2.0%
Forecast = 2.2%

→ CAD STRONG

Therefore:
CADJPY → BUY bias
USDCAD → SELL bias

EUR event:
Forecast >= Previous
→ EUR STRONG

EURUSD → BUY bias

GBP event:
Forecast >= Previous
→ GBP STRONG

GBPUSD → BUY bias

USD event:
Forecast >= Previous
→ USD STRONG

EURUSD → SELL bias
GBPUSD → SELL bias
Gold → SELL bias

If:
Forecast < Previous
then the currency is WEAK.

For USD:
USD Weak → Gold BUY
USD Strong → Gold SELL

The engine must understand base currency vs quote currency.

For example:

CAD Strong:
CADJPY = BUY
USDCAD = SELL

Do not simply apply "strong = buy" to every pair.

==================================================
26. MULTIPLE SIMULTANEOUS EVENTS
==================================================

When multiple major events occur at the same time or within the same release window, group them together.

Example:

14:30:
USD
- Average Hourly Earnings
- Non-Farm Employment Change
- Unemployment Rate

Treat them as one fundamental release group while still analyzing each event individually.

==================================================
27. MAJORITY RULE
==================================================

When several simultaneous events affect the same currency:

Count the directional signals.

Example:

4 events:

Event 1 → Strong
Event 2 → Strong
Event 3 → Strong
Event 4 → Weak

Result:

Strong = 3/4
Weak = 1/4

Majority:
STRONG

For USD:
Gold = SELL bias

For another currency:
Apply the direction to affected pairs based on base/quote positioning.

Display the breakdown.

==================================================
28. CONFLICTING EVENTS / SPIKE RISK
==================================================

Conflicting simultaneous events create expected spike/reaction risk according to the creator's methodology.

Example:

Core CPI m/m:
Previous = 0.2%
Forecast = 0.2%
→ Strong according to the creator's rule.

Core CPI y/y:
Previous = 0.5%
Forecast = 0.4%
→ Weak.

Because the simultaneous events disagree:

SPIKE RISK = HIGH / ELEVATED

The exact visual severity should depend on the degree of disagreement and number of events.

Examples:

4/4 same direction:
- Strong agreement
- Lower expected conflict/spike risk

3/4 same direction:
- Majority exists
- Elevated spike risk

2/4 vs 2/4:
- No majority
- Very high conflict
- Do not treat direction as decisive

The app must keep:
DIRECTION
and
SPIKE RISK

as separate concepts.

A directional majority does not mean there is no spike risk.

==================================================
29. ACTUAL VALUE
==================================================

Actual normally appears after the event.

Before the event:
Use:

PREVIOUS → FORECAST

to determine expected direction.

After the event:
Use:

PREVIOUS → FORECAST → ACTUAL

Actual should confirm or contradict the forecast expectation.

Example:

Previous = 0.2%
Forecast = 0.2%
Actual = 0.3%

→ Forecast expectation confirmed/strengthened.

Example:

Previous = 0.2%
Forecast = 0.3%
Actual = 0.1%

→ Forecast expectation contradicted.

The app must NOT use Actual before it has been released.

Once Actual becomes available, automatically update the event status.

Possible statuses:

FORECAST CONFIRMED
FORECAST CONTRADICTED
FORECAST STRONGLY CONFIRMED
FORECAST WEAKENED

Do not invent an Actual-based rule beyond this unless later specified.

==================================================
30. FUNDAMENTAL DISPLAY
==================================================

Example:

USD EVENTS

Core CPI m/m
Previous: 0.2%
Forecast: 0.2%
Actual: —

Expected:
USD STRONG

Core CPI y/y
Previous: 0.5%
Forecast: 0.4%
Actual: —

Expected:
USD WEAK

------------------------

MAJORITY:
USD STRONG — 3/4

SPIKE RISK:
ELEVATED

Gold:
BEARISH

EURUSD:
BEARISH

GBPUSD:
BEARISH

When Actual appears:

Previous → Forecast → Actual

0.2% → 0.2% → 0.3%

✓ Forecast confirmed

==================================================
31. NEWS + TECHNICAL ANALYSIS
==================================================

Fundamental analysis must NOT automatically override CRT.

Example:

FUNDAMENTALS:
USD Strong
Gold Bearish
Spike Risk High

TECHNICAL:
Daily CRT Bullish
4H Bullish
Confirmed Bullish OB
Strong Bullish FVG
Historical reaction

Result:

TECHNICAL / FUNDAMENTAL CONFLICT

Do not automatically create a trade.

The app should explain the conflict.

CRT remains the primary methodology.

==================================================
32. EVENT RISK
==================================================

Display important upcoming events.

Show:
- Currency
- Event
- Time
- Impact
- Previous
- Forecast
- Actual when released
- Expected currency direction
- Majority
- Conflict
- Spike risk

Show warnings before high-impact events.

Do not make promises about guaranteed spikes.

Use language such as:
- Spike Risk
- Elevated Event Risk
- Conflicting Fundamentals
- Strong Fundamental Agreement

==================================================
33. USER NEWS SCREENSHOTS
==================================================

Allow the user to upload screenshots of economic-calendar events.

The system should extract where possible:
- Currency
- Event name
- Previous
- Forecast
- Actual
- Time
- Event grouping

The screenshots supplied by the creator are examples of the expected input format.

If OCR/data extraction is uncertain, ask the user to correct the value rather than silently inventing it.

==================================================
34. FUNDAMENTAL SOURCES
==================================================

The app should be designed to obtain news/event information from reputable public sources and economic calendar data sources, including Investing.com where technically/legal access is available.

The system should cross-check important events.

Display source information where appropriate.

==================================================
35. TRADE JOURNAL
==================================================

Create a separate private Trade Journal.

Do NOT clutter the main analysis screen with journal information.

Record:

- Date
- Symbol
- Mode
- Direction
- Entry
- Stop Loss
- Take Profit
- Position size
- Risk %
- CRT timeframe
- CRT direction
- Signal strength
- Confirmations
- Fundamental bias
- Spike risk
- Before screenshot
- After screenshot
- Result
- P/L
- R:R
- Reason for entry
- Reason for exit
- What went wrong
- Post-trade analysis

Allow the user to review previous trades.

==================================================
36. POST-TRADE ANALYSIS
==================================================

After a trade, FOXWANA should help explain:

WHY WAS THE TRADE GENERATED?

WHY DID THE TRADE WORK OR FAIL?

Compare:
Expected setup
vs
Actual price behaviour

Possible technical observations:
- CRT target failed
- Lower timeframe structure reversed
- Opposing liquidity became the draw
- OB invalidated
- FVG failed
- Historical level rejected price
- Major support/resistance obstructed target
- Fundamental event contradicted expectation
- Spike caused temporary displacement

The system must clearly distinguish analysis from certainty.

It can identify likely technical reasons based on the available data, but must not claim to know hidden causality with certainty.

==================================================
37. STATISTICS
==================================================

Create a clean statistics section for the user's own journal data.

Display useful statistics such as:
- Total trades
- Winning trades
- Losing trades
- Win/loss count
- Average R:R
- Average P/L
- Results by symbol
- Results by trading mode
- Results by CRT timeframe
- Results by signal strength
- Results around high-impact news
- Results with/without fundamental agreement

Do not make claims that these statistics guarantee future performance.

==================================================
38. CONFLICT DETECTOR
==================================================

Create a simple conflict detection system.

Examples:

Weekly Bullish
Daily Bullish
4H Bullish
1H Bearish
15M Bearish

→ MULTI-TIMEFRAME CONFLICT

Or:

CRT Bullish
Fundamentals Bearish

→ TECHNICAL/FUNDAMENTAL CONFLICT

Or:

CRT Bullish
Major resistance immediately before target

→ TARGET OBSTRUCTION

Conflicts should be clearly visible but not overly colorful.

==================================================
39. NO TRADE LOGIC
==================================================

FOXWANA must be comfortable saying:

NO TRADE

Do not force BUY or SELL.

Examples:

CRT detected
but no valid OB/FVG/historical reaction

→ NO VALID ENTRY

Or:

Higher timeframe conflict

→ NO TRADE

Or:

Major target obstruction

→ CAUTION / NO TRADE

For scalping, use:
NO TRADE
DEVELOPING
TRIGGER WATCH
CONFIRMED

For other modes, NO VALID SETUP is appropriate when conditions are insufficient.

==================================================
40. ANALYSIS OUTPUT
==================================================

Every analysis should have a clear structure:

MARKET
TIMEFRAME
MODE

CRT STATUS
- Bullish / Bearish / Developing / None

HIGHER TIMEFRAME CONTEXT

MARKET STRUCTURE

LIQUIDITY

VALIDATED ENTRY ZONE

ORDER BLOCK

FVG

HISTORICAL REACTION

MSNR

FIBONACCI if relevant

FUNDAMENTAL BIAS

SPIKE RISK

CONFLICTS

ENTRY

STOP LOSS

CRT TARGET

SIGNAL STRENGTH

WHY BUY / WHY SELL

BLOCKERS

FINAL STATUS:
BUY
SELL
DEVELOPING
TRIGGER WATCH
NO TRADE

Do not show all sections if they are irrelevant. Keep the interface clean.

==================================================
41. CRT TARGET
==================================================

The CRT target should be the primary objective.

Display:
CRT TARGET

Also identify important liquidity and major levels around the target.

If the target is obstructed, warn the user.

==================================================
42. SESSION CONTEXT
==================================================

Where relevant, display market session context:
- London
- New York
- Asian session where useful for context

Do not turn sessions into a cluttered indicator.

Session context should support CRT and liquidity analysis.

==================================================
43. SETTINGS
==================================================

Settings should include:

- Trading mode preferences
- Risk %
- Account size
- Fixed risk
- Default symbols
- Timeframe preferences
- Signal threshold
- Notification preferences
- Light/Dark mode
- Data/API configuration
- Screenshot preferences
- Journal preferences

==================================================
44. LIGHT / DARK MODE
==================================================

Full seamless Light/Dark mode.

Mode toggle must be easy to access.

Use:
Light:
white / light gray / charcoal

Dark:
deep charcoal / near black / light text

Keep blue and red as the primary semantic colors in both modes.

==================================================
45. RESPONSIVE DESIGN
==================================================

PC:
- Spacious
- Professional
- Multi-panel where useful
- Large analysis workspace
- Charts and analysis can sit side by side where appropriate
- Collapsible sidebar

Mobile:
- One primary task at a time
- Stacked sections
- Compact navigation
- Easy-to-read charts
- Large enough buttons
- Easy screenshot upload
- No horizontal overflow
- No tiny text
- No crowded tables
- Important BUY/SELL/NO TRADE status should remain immediately visible

The mobile version must not simply be a shrunk desktop version.

==================================================
46. FUTURE MOBILE APP
==================================================

Build the web architecture so it can later be packaged/adapted into a mobile application.

Use responsive components and reusable UI components.

Avoid desktop-only assumptions.

==================================================
47. FUTURE AUTHENTICATION / LOCK SYSTEM
==================================================

The first version does not need to lock the app yet, but the architecture must allow authentication and permissions later.

Future opening flow:

FOXWANA
↓
Login
↓
Authentication
↓
Permission Check
↓
Account Status
↓
Access FOXWANA

Future system should support:
- User accounts
- Email/password authentication
- Secure sessions
- User permissions
- Admin permissions
- Feature permissions
- Subscription/license status
- Device/session management
- Account suspension/revocation

Do NOT hard-code passwords or secret keys in the frontend.

Do NOT ask users to enter raw MT5 passwords into the application.

Future broker/MT5 connectivity must use secure API/bridge architecture.

==================================================
48. ABOUT PAGE
==================================================

Create a professional About page.

Title:

ABOUT FOXWANA

FOXWANA
CRT Market Intelligence

Description:

"FOXWANA is a multi-timeframe market-analysis platform built around Candle Range Theory (CRT). The platform combines CRT with selected market-structure concepts, liquidity, Order Blocks, Fair Value Gaps, historical price reactions and fundamental news analysis to help traders understand where a potential setup is forming, why it may be forming, and where the trade could become invalid.

FOXWANA is designed to keep analysis focused rather than overloaded with traditional indicators. The goal is to provide clear market information, explain the reasoning behind an analysis, and help traders document and review their decisions."

Creator:

Fokosa Paul Lekwana

Creator description:

"Fokosa Paul Lekwana is the creator and developer of FOXWANA. He was born on 11 November 2003 and is from Jane Furse, Mochadi, Limpopo Province, South Africa.

FOXWANA was created from his interest in developing a focused approach to market analysis by combining CRT, price action, market structure and fundamental analysis into one professional platform."

Email:

Fokosalekwana@gmail.com

Created:

22 September 2026

Display:
Created by Fokosa Paul Lekwana
South Africa

==================================================
49. DATA ARCHITECTURE
==================================================

Use a modular architecture.

Suggested structure:

USER
↓
SCREENSHOTS / MARKET DATA
↓
HISTORICAL DATA ENGINE
↓
CRT ENGINE
↓
LIQUIDITY
↓
MARKET STRUCTURE
↓
FVG
↓
ORDER BLOCK
↓
MSNR / SUPPORT & RESISTANCE
↓
FIBONACCI
↓
FUNDAMENTAL NEWS ENGINE
↓
CONFLUENCE ENGINE
↓
SIGNAL STRENGTH
↓
CONFLICT DETECTOR
↓
ENTRY ZONE
↓
SL
↓
CRT TARGET
↓
TRADE JOURNAL
↓
POST-TRADE ANALYSIS

Keep these modules separated so they can be improved later without rebuilding the entire application.

==================================================
50. IMPORTANT PRODUCT RULES
==================================================

1. CRT is the central methodology.
2. Do not add traditional indicators.
3. Do not force BUY/SELL when conditions are insufficient.
4. A CRT signal alone is NOT an entry.
5. Entry requires a confirmed OB, strong FVG, or historically validated reaction area.
6. Historical price context matters.
7. Higher timeframe context matters.
8. Long-term confirmation is ONLY 1H and 15M.
9. Fundamentals apply to ALL major currencies, not only USD.
10. Forecast >= Previous = Strong according to the creator's methodology.
11. Forecast < Previous = Weak.
12. Majority determines the fundamental directional bias when multiple simultaneous events exist.
13. Conflicting simultaneous events increase spike risk.
14. Actual arrives after the event and is used to confirm or contradict the Forecast.
15. Actual must never be used before release.
16. Fundamental direction and spike risk must remain separate.
17. Fundamental analysis must not automatically override CRT.
18. Do not describe signal strength as probability or certainty.
19. TP is primarily based on the CRT target.
20. SL must be technically logical.
21. Entry should preferably be represented as a zone.
22. Keep the UI minimal.
23. Use blue primarily for bullish.
24. Use red primarily for bearish.
25. Use only limited warning colors.
26. PC and mobile must both look professional.
27. The application must not feel clustered.
28. Every major analysis must explain WHY.
29. Keep the Trade Journal separate from the main analysis.
30. Build with future authentication/permissions in mind.

==================================================
51. DEVELOPMENT QUALITY
==================================================

Build reusable components.

Use clean state management.

Make the UI responsive.

Use realistic sample/demo data where live APIs are not yet connected, but clearly structure the application so real data sources can replace demo data.

Do not create fake claims that live market data is available if no real data connection exists.

Clearly distinguish:
- Demo data
- Uploaded screenshot analysis
- Real market data
- Real news data

Make the interface production-quality.

Avoid placeholder-looking pages.

Do not leave empty sections that look unfinished.

Make buttons and interactions functional wherever possible.

==================================================
52. FINAL UI PRINCIPLE
==================================================

FOXWANA should feel like:

A professional trading-analysis workstation.

NOT:
- A casino
- A colorful indicator dashboard
- A cluttered TradingView clone
- A collection of random indicators
- A generic AI chatbot

The main feeling should be:

CLEAN
SMART
FOCUSED
PROFESSIONAL
MINIMAL
POWERFUL

The user should open FOXWANA and immediately understand:

1. What market is being analyzed?
2. What is the CRT direction?
3. Is there a valid entry?
4. Where is the entry zone?
5. Where is the SL?
6. Where is the CRT target?
7. Why is the setup valid or invalid?
8. What do the fundamentals say?
9. Is there conflict or spike risk?
10. Should the current state be BUY, SELL, DEVELOPING, TRIGGER WATCH, or NO TRADE?

Build the application around these principles and requirements without adding unnecessary features.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://foxwana-crt-trader.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/79159f7c-6310-437b-a361-383ccf38122c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
