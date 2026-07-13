# Texas Estate Planning Readiness Report: launch packet

Status: **hold — data collection and verification in progress**  
Prepared: 2026-07-13  
Public research page: https://mywillbuddy.com/research/texas-estate-planning-readiness

This packet is ready for completion, not release. Every bracketed value must come from a frozen, reproducible aggregate table.

## Release gates

All boxes must be checked by two people: the analysis owner and editorial/legal reviewer.

- [ ] The deployed survey event fires once per completed five-question submission.
- [ ] A durable, exportable response source exists. The current interface records `texas_readiness_survey_completed` through the analytics client; do not assume analytics event volume alone is a durable research dataset.
- [ ] The exported properties match the five published questions and `survey_version`.
- [ ] The team has documented whether analytics identifiers, IP-derived properties, cookies, or session metadata accompany the event. Public “anonymous” language matches the deployed reality.
- [ ] Test and staff events are excluded by a documented rule.
- [ ] The frozen dataset contains at least 200 complete eligible responses.
- [ ] Every published subgroup contains at least 25 complete responses.
- [ ] No result is described as representative, weighted, statistically projectable to all Texans, or a poll.
- [ ] Collection start/end time, export time, query, exclusions, and row count are saved.
- [ ] Percentages and denominators independently reproduce from the frozen export.
- [ ] Rounding rules are consistent and tables include `n`.
- [ ] A named Texas attorney or qualified estate-planning expert has reviewed legal context—not the statistical validity—and the scope/date of review is disclosed.
- [ ] A second reviewer has checked the methodology, labels, tables, and press copy.
- [ ] The live report, CSV/table download, methodology, correction contact, and canonical URL return `200`.
- [ ] No embargo pitch is sent before the report URL or private press packet is reviewable.

## Survey instrument and data dictionary

Implementation event: `texas_readiness_survey_completed`  
Current survey version: `2026-07-13`

| Field | Published question | Allowed values |
| --- | --- | --- |
| `will_status` | Do you currently have a signed will? | `current`, `outdated`, `none`, `unsure` |
| `financial_agent_status` | Have you named someone to handle finances if you cannot? | `current`, `outdated`, `none`, `unsure` |
| `healthcare_status` | Have you documented a healthcare decision-maker or care wishes? | `current`, `partial`, `none`, `unsure` |
| `guardian_status` | If you care for minor children, have you named primary and backup guardians? | `current`, `partial`, `none`, `not_applicable` |
| `conversation_status` | Do the people you chose know where to find your plan? | `complete`, `partial`, `none`, `unsure` |
| `survey_version` | Instrument version | `2026-07-13` for this release |

No demographic field is currently present in the five-question instrument. Do not promise metro, age, income, race/ethnicity, gender, parent-status, or other subgroup findings unless a future, consented instrument version adds those fields and the methodology is updated before collection.

## Frozen analysis record

Complete this block and commit it with the final report assets.

```yaml
report_version: 1.0
survey_version: 2026-07-13
collection_started_at: "[ISO timestamp]"
collection_ended_at: "[ISO timestamp]"
exported_at: "[ISO timestamp]"
source_system: "[system and project id]"
event_name: texas_readiness_survey_completed
raw_event_count: "[n]"
excluded_test_or_staff_events: "[n and rule]"
excluded_incomplete_or_invalid_events: "[n and rule]"
eligible_complete_responses: "[n, must be >= 200]"
deduplication_rule: "[rule or none; explain]"
rounding_rule: "nearest whole percentage; retain unrounded value in analysis file"
analysis_query_or_script: "[committed path]"
analysis_sha256: "[hash]"
reviewer_statistics: "[name, role, date]"
reviewer_legal_context: "[name, Texas credential, scope, date]"
```

## Prewritten report structure

### Headline

**Texas Estate-Planning Readiness: What [N] Voluntary Respondents Had—and Had Not—Put in Place**

Avoid “Texans say” unless the sentence immediately states that the respondents were a voluntary convenience sample.

### Standfirst

WillBuddy collected five anonymous multiple-choice answers from [N] self-identified Texas adults who voluntarily reached the survey between [start] and [end]. The results describe this group only; they are not a representative estimate of all Texans.

### Key findings template

- **Signed will:** [x%] reported a current signed will; [y%] reported no signed will; [n] respondents.
- **Financial decision-maker:** [x%] reported a current signed document naming someone; [y%] reported none; [n] respondents.
- **Healthcare planning:** [x%] reported current healthcare decision-maker or care-wish documents; [y%] reported none; [n] respondents.
- **Guardian choices:** Among [n] respondents for whom the question applied, [x%] reported both primary and backup choices. Keep “not applicable” out of this denominator and show the exclusion.
- **Plan communication:** [x%] said their chosen people know where to find the plan; [y%] said no; [n] respondents.

### Interpretation language

Use:

> These answers identify where this voluntary group reported the most incomplete planning. They do not show how common the same gaps are among all Texas adults, and they do not verify whether any document is legally effective or current.

Do not use:

- “X% of Texans…”
- “The average Texan…”
- “Texas is less prepared than…”
- “The margin of error is…”
- causal claims about why respondents lack documents;
- claims about document validity.

## Press fact sheet

**Project:** Texas Estate Planning Readiness Report  
**Publisher:** WillBuddy  
**Release:** [date/time/time zone]  
**Public URL:** [canonical URL]  
**Download:** [aggregate table CSV URL]  
**Method:** Five-question online voluntary convenience sample  
**Eligible responses:** [N]  
**Field dates:** [start]–[end]  
**Who could respond:** Self-identified Texas adults who voluntarily reached the page  
**Personal data requested by instrument:** No name, email, precise location, asset value, or document text  
**Subgroup publication rule:** No subgroup with fewer than 25 responses  
**Primary limitation:** Not representative, not weighted, and not generalizable to all Texans  
**Media contact:** [name, role, email, phone]  
**Corrections:** [email and corrections-policy URL]

## Embargo pitch

**Subject options**

- Embargoed Texas data: where [N] voluntary respondents reported planning gaps
- New Texas readiness dataset with open instrument and aggregate table
- Texas estate-planning readiness report — methodology and interview available

**Body**

Hi [name],

WillBuddy is publishing a five-question Texas estate-planning readiness report on [date/time]. The report covers [N] self-identified Texas adults who voluntarily reached the survey between [dates]. It is a convenience sample—not a representative poll—and the release includes the full instrument, denominators, aggregate table, exclusions, and limitations.

The clearest finding is [one exact, non-sensational finding with denominator]. A second useful finding is [one exact finding].

Embargoed materials: [private review URL]

Available:

- the frozen aggregate table and analysis method;
- an interview with WillBuddy about the project and tool design;
- a named independent expert for legal context, if confirmed;
- screenshots and charts with source notes.

The embargo lifts [date/time/time zone]. Would this fit your [consumer finance / aging / family / Texas data] coverage?

[signature]

## Non-embargo local pitch

Use only when the instrument supports the geographic claim. The current instrument does not collect metro or county, so do not create a Dallas, Houston, Austin, San Antonio, or regional finding from it.

**Subject:** Five-question Texas readiness report publishes open aggregate table

Hi [team],

WillBuddy has published aggregate results from [N] voluntary Texas respondents to a five-question estate-planning readiness survey. The strongest statewide-audience takeaway is [finding with denominator].

The report is explicit that the sample is voluntary and not representative. The instrument, methodology, exclusions, table, and limitations are public here: [tracked URL]

If useful, we can discuss what the responses do—and do not—show and provide the charts in editable form.

[signature]

## Press release draft

### WillBuddy publishes open Texas estate-planning readiness dataset from [N] voluntary respondents

**[CITY, Texas] — [DATE]** — WillBuddy today published aggregate answers from [N] self-identified Texas adults who completed a five-question estate-planning readiness survey between [start] and [end]. The voluntary convenience sample is not weighted or representative of all Texans.

Among participating respondents, [finding one with numerator/denominator]. [Finding two with numerator/denominator]. The questionnaire asked about signed wills, financial decision-makers, healthcare documents or wishes, guardian choices where applicable, and whether chosen people know where to find a plan.

“[Quote that describes the purpose without overstating the data],” said [name, role]. “The value of this project is making the instrument, denominators, and limitations visible—not pretending a voluntary sample can speak for every Texan.”

The public report includes the five-question instrument, aggregate table, field dates, exclusions, and methodology. No subgroup with fewer than 25 responses is reported. The survey did not request names, email addresses, asset values, or document text.

WillBuddy is a Texas-focused estate-planning preparation product. It is not a law firm and does not provide legal advice. Its free educational tools are available at https://mywillbuddy.com/tools.

**Media contact:** [contact]  
**Report:** [URL]  
**Methodology:** [URL]  
**Aggregate table:** [URL]

## Interview Q&A

### Is this a poll of Texans?

No. It is a voluntary convenience sample of self-identified Texas adults who reached the WillBuddy research page. It is not weighted or representative and should not be generalized to all Texas adults.

### Did WillBuddy verify respondents’ documents?

No. The instrument records self-reported multiple-choice answers. It does not inspect a will or any other document and cannot determine legal validity.

### What personal information did the survey request?

The instrument did not request names, emails, precise locations, asset values, or document text. Before release, the team will also disclose relevant analytics metadata and retention practices so “anonymous” is not broader than the deployed implementation supports.

### Why publish this data?

The project is intended to show where this participating group reported unfinished planning and to create a transparent baseline for better educational resources. Its limitations are part of the result.

### Is WillBuddy a law firm?

No. WillBuddy is a preparation tool, not a law firm, and does not provide legal advice. Situation-specific questions should go to a licensed Texas attorney.

### Did partners pay to appear or link?

No. Earned coverage and partner sharing are optional editorial decisions. WillBuddy does not pay for ranking links or require reciprocal links.

## Chart package

Produce these only from the frozen table:

1. Five-panel horizontal bar chart: one panel per question, full answer distribution, `n` and field dates in the footer.
2. “Current versus not current/unsure” summary chart only if recoding is documented and the original distribution remains available.
3. Guardian chart with “not applicable” separated and the applicable denominator printed prominently.
4. Methodology card: sample type, field dates, `n`, thresholds, and limitations.
5. Social card with one finding, denominator, “voluntary respondents” language, source URL, and no Texas population silhouette that implies representativeness.

Every image needs alt text, a source note, and an editable source file. Do not use 3D charts, truncated percentage axes, or unlabeled denominators.

## Media routing

Start with the public routes already verified in the prospect sheet:

- [Texas Tribune contact and pitches](https://www.texastribune.org/contact/)
- [KUT / Texas Standard newsroom contact](https://www.kut.org/contact-directions)
- [Community Impact newsroom form](https://communityimpact.com/corporate-contact/)
- KERA, Houston Public Media, and Texas Public Radio through their public newsroom routes.

Pitch the report only after release gates pass. Until then, invite organizations to review the methodology or share the survey—never preview findings from an incomplete sample.

