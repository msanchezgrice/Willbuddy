import type { Decision } from "@/types";

function d(decisions: Decision[], section: string, key: string): string {
  const found = decisions.find((dec) => dec.section === section && dec.key === key);
  return found?.value ?? "[NOT SPECIFIED]";
}

/**
 * Generate a plain-English Durable (Financial) Power of Attorney
 * document from the user's decisions.
 */
export function generateDurablePoaText(decisions: Decision[]): string {
  const testatorName = d(decisions, "family", "full_name");
  const partnerName = d(decisions, "family", "partner_name");
  const financialPoa = d(decisions, "executor", "financial_poa");
  const backupExecutor = d(decisions, "executor", "backup_executor");
  const poaActivation = d(decisions, "executor", "poa_activation");

  const hasPartner = partnerName !== "[NOT SPECIFIED]";

  const activationText =
    poaActivation !== "[NOT SPECIFIED]"
      ? poaActivation.toLowerCase().includes("immediate")
        ? `This power of attorney is effective IMMEDIATELY upon signing and
remains in effect even if I become incapacitated (durable).`
        : poaActivation.toLowerCase().includes("springing")
          ? `This is a SPRINGING power of attorney. It becomes effective only
when I am determined to be incapacitated by a licensed physician.
Until that determination, my agent has no authority to act.`
          : `Activation conditions: ${poaActivation}`
      : `The activation condition for this power of attorney was not specified
during planning. Please discuss with your attorney whether this should
be immediate or springing (activated only upon incapacity).`;

  return `
================================================================================
              DRAFT DOCUMENT - FOR ATTORNEY REVIEW ONLY
================================================================================

              DURABLE POWER OF ATTORNEY
                   (FINANCIAL)

State of Texas


DESIGNATION OF AGENT
---------------------

I, ${testatorName}, a resident of the State of Texas, hereby appoint:

  Primary agent: ${financialPoa}

to serve as my agent (attorney-in-fact) for financial and property matters.

If ${financialPoa} is unable or unwilling to serve, I appoint:

  Backup agent: ${backupExecutor}

as my successor agent with the same powers.


ACTIVATION
-----------

${activationText}

Under Texas law (Texas Estates Code, Chapter 751), a durable power of attorney
remains in effect during the principal's incapacity unless it specifically
states otherwise.


POWERS GRANTED
--------------

My agent shall have the authority to act on my behalf in all financial and
property matters, including but not limited to:

  1. BANKING — Access, manage, and conduct transactions on my bank accounts,
     including opening and closing accounts, making deposits and withdrawals.

  2. INVESTMENTS — Buy, sell, and manage stocks, bonds, mutual funds, and
     other investment accounts.

  3. REAL ESTATE — Buy, sell, lease, mortgage, or otherwise deal with any
     real property I own.

  4. TAXES — Prepare, sign, and file tax returns on my behalf with the IRS
     and the State of Texas.

  5. INSURANCE — Apply for, maintain, modify, or cancel insurance policies.

  6. GOVERNMENT BENEFITS — Apply for and manage Social Security, Medicare,
     Medicaid, veterans benefits, and other government programs.

  7. BUSINESS OPERATIONS — Manage, operate, buy, sell, or dissolve any
     business interest I hold.

  8. LEGAL PROCEEDINGS — Hire attorneys and take legal action on my behalf,
     including filing lawsuits, settling claims, and managing litigation.

  9. DIGITAL ASSETS — Access and manage my digital accounts, online banking,
     email, social media, and digital property.

  10. PERSONAL PROPERTY — Buy, sell, or dispose of personal property including
      vehicles, household items, and other tangible assets.


LIMITATIONS
-----------

My agent may NOT:

  - Change beneficiaries on my life insurance or retirement accounts
    (unless specifically authorized by a court).
  - Make gifts from my estate exceeding $17,000 per recipient per year
    (the current annual gift tax exclusion).
  - Create, amend, or revoke my will or trust.
  - Make healthcare decisions (see the separate Medical Power of Attorney).


COMPENSATION AND EXPENSES
--------------------------

My agent shall be reimbursed for reasonable expenses incurred while acting
on my behalf. My agent shall serve without compensation unless agreed upon
in writing.


THIRD-PARTY RELIANCE
---------------------

I request that any third party (bank, brokerage, title company, government
agency) accept this power of attorney. Under Texas law, a third party who
refuses to honor a valid statutory durable power of attorney may be subject
to court order and liability for attorney's fees.


REVOCATION
-----------

I may revoke this power of attorney at any time by providing written notice
to my agent. This power of attorney is automatically revoked upon my death.


SIGNATURES
----------

Principal: ________________________________________
Printed name: ${testatorName}
Date: ____________________

Agent acknowledgment:

I, ${financialPoa !== "[NOT SPECIFIED]" ? financialPoa : "________________"}, accept this appointment
as agent and agree to act in the principal's best interest.

Agent signature: ________________________________________
Date: ____________________

${hasPartner ? `
NOTE: ${partnerName} should execute a separate Durable Power of Attorney.
A separate document for ${partnerName} may be generated if needed.
` : ""}

NOTARY ACKNOWLEDGMENT

STATE OF TEXAS
COUNTY OF ____________________

Subscribed and sworn to before me on this ______ day of ____________, 20____.

Notary Public signature: ________________________________________
My commission expires: ____________________

[NOTARY SEAL]

================================================================================
              DRAFT DOCUMENT - FOR ATTORNEY REVIEW ONLY
  This document was generated by WillBuddy as a starting point for your
  estate plan. It is NOT legal advice. Please have a licensed Texas estate
  planning attorney review and finalize this document before signing.
================================================================================
`.trim();
}
