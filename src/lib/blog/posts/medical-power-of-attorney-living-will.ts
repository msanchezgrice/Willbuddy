import type { BlogPost } from "../types";

const medicalPoaForm =
  "https://www.hhs.texas.gov/regulations/forms/advance-directives/medical-power-attorney-designation-health-care-agent-mpoa";
const livingWillForm =
  "https://www.hhs.texas.gov/regulations/forms/advance-directives/directive-physicians-family-or-surrogates-living-will";

export const medicalPoa: BlogPost = {
  slug: "medical-power-of-attorney-living-will",
  title: "Texas Medical Power of Attorney and Living Will Guide",
  description:
    "Learn how a Texas medical power of attorney and directive to physicians work together, using current Texas HHS forms and law.",
  date: "2026-06-18",
  dateModified: "2026-07-13",
  category: "Healthcare Directives",
  author: "WillBuddy Editorial Team",
  editorialNote:
    "Written and source-checked by the WillBuddy Editorial Team against current Texas statutes and Texas HHS forms. This article was not attorney-reviewed or medically reviewed.",
  faqs: [
    {
      question: "When does a Texas medical power of attorney take effect?",
      answer:
        "The current Texas HHS form states that it takes effect when the person becomes unable to make healthcare decisions and a physician certifies that fact in writing.",
      sourceUrl: medicalPoaForm,
      sourceLabel: "Texas HHS Medical Power of Attorney form",
    },
    {
      question: "Is a medical power of attorney the same as a living will in Texas?",
      answer:
        "No. A medical power of attorney names a healthcare agent, while the directive to physicians records treatment preferences for defined terminal or irreversible conditions.",
      sourceUrl: livingWillForm,
      sourceLabel: "Texas HHS Directive to Physicians form",
    },
    {
      question: "Does a Texas medical power of attorney manage finances?",
      answer:
        "No. Financial and property authority belongs in a separate durable power of attorney governed by the Texas Estates Code.",
      sourceUrl:
        "https://tcss.legis.texas.gov/resources/ES/htm/ES.752.htm",
      sourceLabel: "Texas Estates Code Chapter 752",
    },
  ],
  content: `Texas uses separate documents to answer two different healthcare questions:

1. **Who should make healthcare decisions if I cannot?** A medical power of attorney names an agent.
2. **What treatment would I want in defined end-of-life circumstances?** A directive to physicians and family or surrogates—often called a living will—records treatment preferences.

Both documents are part of the Texas Advance Directives Act in [Health and Safety Code Chapter 166](https://tcss.legis.texas.gov/resources/HS/htm/HS.166.htm). Texas Health and Human Services publishes current statutory-form pages for a [Medical Power of Attorney](https://www.hhs.texas.gov/regulations/forms/advance-directives/medical-power-attorney-designation-health-care-agent-mpoa) and a [Directive to Physicians and Family or Surrogates](https://www.hhs.texas.gov/regulations/forms/advance-directives/directive-physicians-family-or-surrogates-living-will).

> **Educational information only.** This guide summarizes general Texas law and the Texas HHS forms available as of July 13, 2026. WillBuddy is not a law firm and does not provide legal or medical advice. Discuss legal questions with a licensed Texas attorney and treatment questions with qualified healthcare professionals.

Not sure whether your next conversation is about a medical agent, a financial agent, treatment instructions, or access to health information? The free [Texas power-of-attorney navigator](/tools/texas-power-of-attorney-navigator) explains the different document categories and links to current official forms. It is educational and does not recommend treatment or determine which document is legally sufficient for you.

## What the medical power of attorney does

The current Texas HHS medical power of attorney form lets an adult appoint an agent to make healthcare decisions, subject to limitations written in the document and restrictions imposed by law. The form says it takes effect when the principal is unable to make the principal's own healthcare decisions and a physician certifies that fact in writing. Read the instructions and full grant from the [Texas HHS Medical Power of Attorney page](https://www.hhs.texas.gov/regulations/forms/advance-directives/medical-power-attorney-designation-health-care-agent-mpoa) and the statutory provisions beginning at [Health and Safety Code Section 166.151](https://tcss.legis.texas.gov/resources/HS/htm/HS.166.htm).

The form also provides spaces for first and second alternate agents. If the primary agent is unwilling or unable to act, an alternate can serve in the stated order. The form contains a specific rule about a spouse-agent designation after the marriage ends unless the document provides otherwise. See the [Texas HHS form page](https://www.hhs.texas.gov/regulations/forms/advance-directives/medical-power-attorney-designation-health-care-agent-mpoa).

The agent's authority is not unlimited. Chapter 166 and the statutory form identify decisions an agent may not make, require the agent to follow known wishes, and otherwise direct the agent to act in the principal's best interest. Review [Health and Safety Code Sections 166.152–166.166](https://tcss.legis.texas.gov/resources/HS/htm/HS.166.htm) rather than relying on a generic healthcare-proxy description.

## What the directive to physicians does

The Texas HHS directive is designed to communicate treatment wishes for a future time when the signer cannot make those wishes known because of illness or injury. Its statutory choices address a **terminal condition** and an **irreversible condition** as defined in the form, with options concerning life-sustaining treatment and comfort-focused care. See the [Texas HHS Directive to Physicians page](https://www.hhs.texas.gov/regulations/forms/advance-directives/directive-physicians-family-or-surrogates-living-will) and [Health and Safety Code Sections 166.031–166.039](https://tcss.legis.texas.gov/resources/HS/htm/HS.166.htm).

The directive is not a general list of every medical preference. It speaks to the circumstances and treatment choices described in the statute and form. That is why conversation with the healthcare agent and physician still matters.

## Why the documents work together

The directive records choices for defined conditions. The medical power of attorney supplies a person who can respond to healthcare decisions that arise when the principal cannot decide. The HHS directive itself notes that Texas law provides other directives, including the medical power of attorney and out-of-hospital do-not-resuscitate order. See the [Texas HHS Directive to Physicians page](https://www.hhs.texas.gov/regulations/forms/advance-directives/directive-physicians-family-or-surrogates-living-will).

A clean plan therefore asks both:

- Have I selected someone who understands my values and can decide under pressure?
- Have I recorded the treatment preferences the Texas directive asks me to make?

## Choose an agent for judgment, not family rank

Use these practical criteria:

- The person listens accurately and will follow your wishes even when personally uncomfortable.
- The person can communicate calmly with clinicians and family.
- The person is reachable and willing to serve.
- The person understands your religious, cultural, and quality-of-life values.
- The person will ask questions when the medical situation is unclear.
- The appointment will not predictably create avoidable conflict.

The current form restricts certain categories of people from serving as agent, including a healthcare provider or an employee of a provider unless a statutory relationship exception applies. Read the exact restriction in [Health and Safety Code Section 166.153](https://tcss.legis.texas.gov/resources/HS/htm/HS.166.htm) and the HHS form before naming anyone.

## Have a scenario-based conversation

Do more than say, “I do not want to be kept alive on machines.” That phrase can mean different things to different people. Use the HHS directive's defined scenarios to start a more precise conversation with your agent and physician:

- What outcomes would you consider an acceptable recovery?
- What burdens of treatment would you accept for a meaningful chance of that recovery?
- What does comfort-focused care mean to you?
- Are there religious or personal values clinicians should know?
- Who should be present or consulted if possible?
- Where are the signed forms and who has copies?

These are value questions, not medical predictions. A physician can explain treatments and likely outcomes; a lawyer can explain document choices.

## Follow the execution instructions exactly

The HHS forms provide alternatives involving qualified witnesses or a notary and contain restrictions on who may serve as a witness. The requirements differ by document and circumstance. Do not reuse a witness plan from a will or assume every family member is qualified. Follow the current instructions from the [Texas HHS Medical Power of Attorney page](https://www.hhs.texas.gov/regulations/forms/advance-directives/medical-power-attorney-designation-health-care-agent-mpoa), the [Texas HHS Directive to Physicians page](https://www.hhs.texas.gov/regulations/forms/advance-directives/directive-physicians-family-or-surrogates-living-will), and [Health and Safety Code Chapter 166](https://tcss.legis.texas.gov/resources/HS/htm/HS.166.htm).

An incorrectly completed form can fail when it is most needed. If anything about capacity, witnesses, electronic execution, language access, or an existing directive is uncertain, get legal help before signing.

## Make the documents usable in a real emergency

The HHS directive instructs people to provide copies to the physician, usual hospital, and family or spokesperson and to consider periodic review. The medical power of attorney form includes space to record where the original is kept and who has copies. Start from the [Texas HHS advance-directives page](https://www.hhs.texas.gov/formas/advance-directives).

Create an access plan:

1. Give the agent and alternates the appropriate signed document.
2. Ask the treating physician how to add it to the medical record.
3. Tell close family who the agent is.
4. Keep an accessible copy without broadly exposing sensitive health information.
5. Replace distributed copies after a valid revocation or update.

## Keep financial authority separate

A medical power of attorney does not authorize financial management. The Texas statutory durable financial form expressly says it does not authorize medical or healthcare decisions, underscoring the separation between the two systems. See [Texas Estates Code Section 752.051](https://tcss.legis.texas.gov/resources/ES/htm/ES.752.htm) and our [Texas durable power of attorney guide](/blog/durable-power-of-attorney).

Your healthcare plan should also be coordinated with the will and broader family plan. The [wills-versus-trusts guide](/blog/wills-vs-trusts-texas) explains the different after-death property tools.

## Review when life changes

Revisit the documents after a diagnosis, major procedure, marriage change, agent conflict, move, or change in values. The HHS directive recommends periodic review so it continues to reflect current preferences. See the [Texas HHS Directive to Physicians page](https://www.hhs.texas.gov/regulations/forms/advance-directives/directive-physicians-family-or-surrogates-living-will).

Use the [Texas estate-planning hub](/texas-estate-planning) to review these documents alongside the financial power of attorney, will, executor, and guardian choices.

## The takeaway

The Texas medical power of attorney chooses a decision-maker. The directive to physicians records treatment preferences for defined end-of-life conditions. Complete both from current Texas sources, choose and prepare capable agents, follow execution instructions, distribute usable copies, and revisit the choices after meaningful change. The paperwork matters; the informed conversation is what makes the paperwork useful.

---

*WillBuddy is not a law firm and does not provide legal advice or medical advice. WillBuddy provides educational information and draft-planning tools. Any draft should be reviewed for your facts and properly executed with guidance from licensed Texas legal and healthcare professionals.*`,
};
