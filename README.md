# charts

OTA Buster — Captured Analytics Final KPI & Visualization 

Create a polished, production-ready Captured Analytics / Information Received experience for OTA Buster.

This is a real hospitality SaaS analytics dashboard, not a presentation, infographic, or conceptual illustration.

Use the existing OTA Buster UI as the visual foundation. Preserve the current design language, typography, spacing, color system, card proportions, and overall dashboard feel, but significantly improve the information architecture and visualization quality.

The experience must be extremely easy for hotel marketers to understand while still being powerful enough for deeper analysis.

1. RENAME THE SECTION

Do not use:

Captured

Use:

Information Received

This section represents information received from OTA booking engines and what OTA Buster subsequently did with that information.

The story is:

OTA booking information received → information quality understood → information enriched → improved usable information → information completeness

2. GLOBAL ANALYTICS CONTROLS

Place the date and comparison controls at the top of the analytics page.

Use:

Period

Last 15 days ▾

Compare

Previous period ▾

The comparison control must support:

Previous period

Previous month

Previous quarter

Same period last year

Same month last year

Same quarter last year

Custom comparison

Do not repeat date selectors inside individual KPI cards.

The selected period and comparison must apply consistently to the Captured analytics and its charts.

3. CUSTOM COMPARISON

When the user selects Custom comparison, allow two independent date ranges:

Analyze

Start date → End date

Compare with

Start date → End date

Examples:

Last 15 days
vs.
Same 15-day period last year

or:

July 1–July 31
vs.
August 1–August 31

or:

July 10–July 24
vs.
June 1–June 15

Do not force the periods to be calendar-based.

4. UNEQUAL DATE-RANGE HANDLING

If the selected periods have different lengths, such as:

Last 15 days
vs.
Last 30 days

do not blindly compare raw totals.

Default to a normalized comparison where appropriate:

Daily average

For volume metrics such as:

Bookings analyzed

Junk info

Valid info

Guest information added

Information enriched

Improved valid information

Show the daily average comparison by default when period lengths differ.

Allow the user to switch between:

Daily average

and

Total

When Total is selected for unequal periods, clearly indicate that the date ranges are different lengths.

Do not create misleading percentage changes from incomparable raw totals.

5. KPI GRID

Use a clean 2 × 2 dashboard grid.

Row 1

OTA Information Received

Guest Information Added

Row 2

Information Improvement

Information Completeness

Do not number the sections.

Do not add 01 / 02 / 03 / 04 labels.

The composition should feel like a modern SaaS dashboard rather than a presentation slide.

6. CARD 1 — OTA INFORMATION RECEIVED

Create one large card titled:

OTA Information Received

Supporting description:

Booking information received from OTA engines during the selected period.

Include one compact control:

View: All ▾

Options:

All

Junk info

Valid info

Do NOT permanently show multiple large cards for these states.

7. ALL VIEW — OTA INFORMATION RECEIVED

When View: All is selected:

Primary KPI:

Bookings analyzed

Example:

12,483

Then show a compact supporting breakdown:

Junk info
X

Valid info
X

Do not overpopulate the card with additional numbers.

Keep the main total dominant.

The Email / Phone / Address details should appear in the familiar compact metadata style used in the existing UI.

Example:

Email · Phone · Address

or, when values are useful:

Email 7.8k · Phone 6.4k · Address 5.2k

8. JUNK INFO VIEW

When the user selects:

Junk info

Show:

Junk guest info

Large total value.

Then show the relevant field breakdown:

Email

Phone

Address

Junk represents information that requires cleanup/improvement.

Do not introduce another large KPI for “Invalid.”

Do not show “Invalid” as a standalone customer-facing metric.

If additional information is needed, use the info tooltip.

9. VALID INFO VIEW

When the user selects:

Valid info

Show:

Valid guest info

Large total value.

Then:

Email

Phone

Address

Supporting description:

Guest information that is already usable.

Keep this clean and consistent with the other states.

10. CARD 2 — GUEST INFORMATION ADDED

Create:

Guest Information Added

Supporting description:

Additional guest information added beyond the original OTA booking data.

Use one compact selector:

Source: All ▾

Options:

All

Whois AI

Guest Journey

Hotel Collection

Do not show all sources as separate large KPI cards.

11. GUEST INFORMATION ADDED — ALL

Default view:

Total guest information added

+X

This is the main number.

Below it, use a compact contribution treatment:

Whois AI
+X

Guest Journey
+X

Hotel Collection
+X

These should be secondary.

Do not overwhelm the card with multiple large numbers.

12. GUEST INFORMATION ADDED — WHOIS AI

When selected:

Whois AI

Show:

+X

Supporting description:

Guest information made usable through AI-powered cleanup and enrichment of junk information.

This is the cleanup/enrichment mechanism.

Do not call it “recovery.”

Do not expose technical implementation language beyond the product name.

13. GUEST INFORMATION ADDED — GUEST JOURNEY

Show:

+X

Supporting description:

Guest information provided through OTA Buster guest messaging and landing experiences.

This represents information voluntarily supplied through the Guest Journey.

14. GUEST INFORMATION ADDED — HOTEL COLLECTION

Use one combined source:

Hotel Collection

This represents:

Staff collection

ID scan

Show:

+X

Then use compact secondary metadata:

Staff collection · ID scan

Do not create separate major controls for Staff and ID scan.

15. CARD 3 — INFORMATION IMPROVEMENT

This is the key value-creation visualization.

Create:

Information Improvement

Supporting description:

How enrichment increased the amount of usable guest information.

This card should use an increasing horizontal funnel / expanding funnel visualization.

This is the only place where the funnel metaphor should be used.

The funnel must visually grow from left to right.

16. INFORMATION IMPROVEMENT FUNNEL

Show three horizontal stages:

INFORMATION ENRICHMENT

Example:

5,000

This represents the larger enriched information pool generated through:

Whois AI

Guest Journey

Hotel Collection

Staff collection

ID scan

EXISTING VALID INFO

Example:

4,000

This is the usable information that already existed.

IMPROVED VALID INFO

Example:

9,000

This is the final usable information pool after enrichment.

The visual should rise and expand:

Information Enrichment → Existing Valid Info → Improved Valid Info

Use an ascending / expanding funnel silhouette so the final Improved Valid Info stage is visibly larger and taller.

The final stage should visually “peak.”

17. FUNNEL VISUAL LOGIC

The visual should communicate:

Existing valid information

4,000

Information enrichment

5,000

=

Improved valid information

9,000

Do not imply that the 5,000 enriched records were created by modifying the 4,000 valid records.

Instead, communicate that enrichment creates an additional usable pool which contributes to the final result.

Use subtle:

+

between Enrichment and Existing Valid.

Use subtle:

=

before Improved Valid.

Do not use large arrows.

Do not use a traditional descending funnel.

The funnel should increase in visual height and width toward the final result.

18. INFORMATION ENRICHMENT SOURCES

Within the funnel card, do not show large source cards.

Use a small supporting line below the Enrichment stage:

Whois AI · Guest Journey · Hotel Collection

This tells the user where enrichment comes from without clutter.

19. EMAIL / PHONE / ADDRESS IN INFORMATION IMPROVEMENT

Do not put the Email / Phone / Address numbers inside each funnel segment.

That will make the visualization too dense.

Instead, show the final field breakdown beneath the Improved Valid Info outcome:

Email X · Phone X · Address X

This preserves the information while keeping the funnel visually clean.

If the user clicks or expands the metric, they can access the detailed field breakdown.

20. INFORMATION IMPROVEMENT HIERARCHY

The visual hierarchy should be:

Largest visual emphasis

Improved Valid Info

Second

Information Enrichment

Third

Existing Valid Info

The objective is to visually communicate:

We created a much larger usable information pool through enrichment.

Do not make all three stages visually equal.

21. CARD 4 — INFORMATION COMPLETENESS

Create:

Information Completeness

Supporting description:

How complete the final guest information is after enrichment and collection.

Use a donut chart as the main visualization.

Example:

82.4%

Complete

This should be the primary visual.

22. COMPLETENESS CONTRIBUTION BARS

Below or beside the donut, show how the different processes contributed.

Use horizontal bars:

Whois AI

████████████

Guest Journey

██████████

Staff Collection

████████

ID Scan

███████

The bars should communicate relative contribution visually.

Do not create four separate KPI cards.

Do not overload the card with percentages.

Use the bar lengths as the primary comparison mechanism.

If exact contribution numbers exist, make them secondary.

23. COMPLETENESS STORY

The card should communicate:

How complete is the final guest information?

and:

Which processes helped make it complete?

The visual hierarchy is:

82.4% complete

↓

Contribution bars

Whois AI → Guest Journey → Staff Collection → ID Scan

Do not make this another funnel.

24. GRAPH SYSTEM

Below the four KPI cards, create one shared chart area.

The graph dynamically changes based on the selected KPI/card.

Do not show multiple unrelated charts simultaneously.

25. OTA INFORMATION RECEIVED GRAPH

When the user clicks Bookings analyzed, show:

OTA Booking Information Over Time

Default view:

All

Display:

Total bookings analyzed

Junk info

Valid info

Use a stacked column chart when the three values represent compositional components of the same daily population.

The total height represents the total booking volume.

The internal segments represent:

Valid

Junk

If the data does not support a true compositional relationship, use a multi-series line chart instead.

The chart must not imply relationships that the underlying data does not support.

26. MASKED / JUNK / VALID GRAPH

When the user selects:

Junk info

show:

Junk Information Over Time

Allow a field selector:

All | Email | Phone | Address

Use a clean line or column trend appropriate to the selected time range.

When:

Valid info

is selected, show:

Valid Information Over Time

Again allow:

All | Email | Phone | Address

Do not display all field series by default if it creates visual noise.

27. INFORMATION ADDED GRAPH

When the user clicks Guest Information Added, display:

Guest Information Added Over Time

Allow the source selector:

All | Whois AI | Guest Journey | Hotel Collection

The chart updates based on the selected source.

Example:

Whois AI

shows the amount of information added through AI enrichment over time.

28. INFORMATION IMPROVEMENT GRAPH

When the user clicks:

Information Improvement

show:

Information Improvement Over Time

Display the relationship between:

Existing valid information

Information enrichment

Improved valid information

Use a visualization that preserves the additive story.

A multi-series line chart is appropriate here.

Do not use a funnel on the time-series chart.

The funnel is for the current-period KPI composition.

The graph is for temporal behavior.

29. COMPLETENESS GRAPH

When the user clicks:

Information Completeness

show:

Information Completeness Over Time

Use a percentage line chart.

The Y-axis is percentage.

The X-axis is time.

The comparison period should overlay the selected comparison when historical data exists.

30. COMPARISON GRAPH LOGIC

The graph must support all common comparison scenarios.

Examples:

Last 15 days vs last year

Align both periods by relative day.

Example:

Day 1 current period vs Day 1 comparison period.

July vs August

Align both periods by relative day when appropriate.

July 1–July 31 vs June 1–June 30

Because the periods have different lengths, allow:

Daily average

and, when appropriate:

Total

Do not stretch one month's data across another without making the comparison basis clear.

31. TIME GRANULARITY

Allow the chart to adapt its granularity based on the selected period.

Possible levels:

Day

Week

Month

Examples:

Last 15 days
→ Day

Last 90 days
→ Week

Last 12 months
→ Month

Allow manual adjustment where appropriate.

32. COMPARISON ON KPI CARDS

When a comparison is active, show subtle change indicators.

Example:

Information Enrichment

+5,000

↑ 18.4%

vs comparison period

For percentages such as completeness:

82.4%

+3.2 pts

Do not clutter the cards with long comparison sentences.

33. TRACTION & MOMENTUM

When comparison data exists, optionally show a subtle contextual signal.

Examples:

Building momentum

Improving

Stable

Slowing

Do not display momentum when comparison data does not exist.

Do not make momentum a separate KPI.

Keep it secondary to the number.

34. INFORMATION ICONS

Add a small information icon next to relevant KPI labels.

Do not use icons as decoration.

Use them to explain the metric.

Examples:

Bookings analyzed

Total OTA booking records analyzed during the selected period.

Junk guest info

Guest information requiring cleanup or improvement before it can be considered usable.

Valid guest info

Guest information that is already usable based on the platform's validation criteria.

Guest information added

Additional guest information introduced through enrichment, guest interaction, or hotel collection.

Information enrichment

Additional information made usable through OTA Buster's enrichment and collection processes.

Improved valid info

The resulting usable information pool after existing valid information and additional enriched information are combined.

Information completeness

The percentage of final guest information that contains the required information fields.

Tooltips should be concise and written for hotel marketers.

35. NO EXCESSIVE NUMBERS

The dashboard should not feel like a spreadsheet.

Use the rule:

Primary number → supporting label → optional compact field breakdown

Do not show every possible metric simultaneously.

Use filtering, hover, click, and progressive disclosure to reveal deeper detail.

36. CARD DESIGN

Use the current OTA Buster visual language.

Maintain:

strong horizontal alignment

consistent card heights

clean grid

premium SaaS spacing

restrained borders

modern typography

existing color hierarchy

clear active states

subtle interactions

The funnel should feel like a component within a dashboard, not a separate infographic.

The donut and bars should also feel like dashboard analytics components.

37. FINAL VISUAL STORY

The user should be able to scan the page and understand:

OTA Information Received

What did we receive?

Guest Information Added

What additional information did we add?

Information Improvement

How much more usable information did we create?

Information Completeness

How complete is the final result?

The visual storytelling should come from:

layout + hierarchy + interaction + data relationships

not giant arrows or elaborate diagrams.

38. FINAL DESIGN PRINCIPLE

The interface should feel like a real, production-ready SaaS analytics dashboard for hotel marketers.

It must be:

intuitive

flexible

analytical

visually polished

easy to navigate

easy to understand

scalable

responsive

codable in Next.js

Do not make the page look like a presentation.

Do not create decorative charts.

Do not create a giant infographic.

Do not force every metric into a funnel.

Use the increasing funnel only for Information Improvement, where it meaningfully communicates:

Existing Valid Info + Information Enrichment → Improved Valid Info

Use traditional KPI structures for the other metrics and appropriate time-series/comparison visualizations underneath.

The final product should feel like a mature hospitality analytics platform where a marketer can quickly understand performance and then progressively explore the underlying data.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/cba6e424-9db4-4f35-b72e-de6c12132ef1).

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
