# WillBuddy Texas Search pilot

Prepared: 2026-07-13  
Status: launch-ready plan; blocked on a WillBuddy-owned Google Ads account and verified conversion action

## Guardrails

- Total media cap: **$500** over 14 days.
- Daily budget: **$35.70**.
- Network: Google Search only. Disable Display and Search Partners for the pilot.
- Location: Texas; target people **in or regularly in** Texas, not people merely interested in Texas.
- Language: English.
- Schedule: 7:00 a.m.–10:00 p.m. Central for the first week; expand only if search-term quality is stable.
- Match types: exact and phrase only at launch.
- Bid strategy: clicks/traffic learning first, with a conservative CPC ceiling. Do not use conversion-optimized bidding until the primary conversion is verified and has enough volume.
- Every ad lands on the most relevant free tool, never the homepage.

## Measurement gate

Do not enable spend until all four checks pass:

1. A WillBuddy-owned Google Ads account is selected and billing is explicit.
2. A production pageview reaches PostHog with HTTP 200.
3. `tool_started`, `tool_completed`, and `plan_started` arrive in PostHog with no answer text or PII.
4. A Google Ads primary conversion action is installed and verified. Use `plan_started` as the primary business conversion and `tool_completed` as a secondary observation conversion.

UTM template:

```text
{lpurl}?utm_source=google&utm_medium=cpc&utm_campaign=tx_search_tools_202607&utm_content={adgroupid}-{creative}&utm_term={keyword}
```

## Campaign and ad groups

### 1. Estate-planning readiness

Landing page: `https://mywillbuddy.com/tools/estate-planning-readiness`

Keywords:

- `[estate planning checklist texas]`
- `"texas estate planning checklist"`
- `[estate planning quiz]`
- `"estate planning readiness"`
- `"what estate planning documents do i need texas"`

Headlines:

- Free Texas Planning Check
- See What Your Plan Is Missing
- Private, No Email Required
- Get Your Next Three Steps
- Texas Estate Planning Tool

Descriptions:

- Answer private questions and get a focused next-step list. Free, with no email gate.
- See which planning actions may apply to your household. Educational, not legal advice.

### 2. Will vs. living trust

Landing page: `https://mywillbuddy.com/blog/wills-vs-trusts-texas`

Keywords:

- `[will vs trust texas]`
- `"will or trust in texas"`
- `[living trust vs will texas]`
- `"do i need a trust in texas"`
- `"texas will and trust comparison"`

Headlines:

- Will vs Trust in Texas
- Compare Five Key Questions
- Free Texas Decision Tool
- See Which Path to Discuss
- No Universal Winner

Descriptions:

- Compare real estate, privacy, family complexity, and funding before choosing a path.
- Work through five questions and review the Texas sources. Free and educational.

### 3. Texas intestacy

Landing page: `https://mywillbuddy.com/tools/texas-intestacy-calculator`

Keywords:

- `[texas intestacy calculator]`
- `"who inherits without a will texas"`
- `[texas inheritance without will]`
- `"texas intestate succession"`
- `"spouse inheritance texas no will"`

Headlines:

- Texas Intestacy Visualizer
- Who May Inherit Without a Will
- Explore the Family Branches
- Community vs Separate Property
- Free Texas Inheritance Tool

Descriptions:

- See a simplified illustration of who may inherit under selected Texas intestacy rules.
- Explore spouse and family branches by property type. Not an heirship determination.

### 4. Texas estate-planning cost

Landing page: `https://mywillbuddy.com/tools/texas-estate-planning-cost-calculator`

Keywords:

- `[estate planning cost texas]`
- `"cost of a will in texas"`
- `[living trust cost texas]`
- `"how much does a trust cost in texas"`
- `"texas will attorney cost"`

Headlines:

- Texas Estate Planning Costs
- Edit Every Cost Assumption
- Compare Will and Trust Ranges
- Free Transparent Calculator
- No Fake Savings Promise

Descriptions:

- Compare editable will, trust, funding, and probate ranges. No guaranteed savings claim.
- See when planning costs may occur and which assumptions change the range. Free tool.

### 5. Power of attorney and directives

Landing page: `https://mywillbuddy.com/tools/texas-power-of-attorney-navigator`

Keywords:

- `[power of attorney texas types]`
- `"texas power of attorney documents"`
- `[medical power of attorney texas]`
- `"durable power of attorney texas"`
- `"advance directive texas"`

Headlines:

- Texas POA Document Navigator
- Match Five Jobs to Documents
- Financial and Medical Choices
- Free Texas Planning Tool
- Know What Each Document Does

Descriptions:

- Map financial, medical, records, treatment, and guardian needs to documents to review.
- Learn what each Texas incapacity document does before deciding what to discuss or prepare.

## Shared negative keywords

Apply as phrase or exact negatives after checking that they do not block a desired query:

- jobs, career, salary, paralegal, law school
- pdf, printable, blank form, free form, download form
- california, florida, new york, uk, canada
- celebrity, movie, book, definition, crossword
- contest a will, lawsuit, litigation, criminal
- tax return, irs form, medicaid application

Review the search-terms report daily for the first five days. Add negatives for other states, employment intent, form-download intent, and active legal disputes.

## Stop and scale rules

- Pause an ad group after 40 clicks with zero tool completions.
- Pause any query that spends more than $20 without a tool start.
- Do not raise the total cap during the pilot.
- Continue only if traffic is Texas-relevant, analytics is complete, and at least one ad group produces tool completions at an acceptable cost.
- Treat `plan_started` as the decision metric. Tool completion alone is a leading indicator, not revenue.

## Current blocker evidence

The signed-in Google Ads selector on 2026-07-13 listed other product accounts but no WillBuddy account. Do not borrow ToastBuddy, My Forever Songs, Surgery Viz, or any generic account. Create or select a clearly named WillBuddy account, then verify its customer ID and conversion action before launch.
