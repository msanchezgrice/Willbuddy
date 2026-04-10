import type { Decision } from "@/types";

/** Look up a decision value by section + key, returning a fallback if missing. */
function d(decisions: Decision[], section: string, key: string): string {
  const found = decisions.find((dec) => dec.section === section && dec.key === key);
  return found?.value ?? "[NOT SPECIFIED]";
}

/**
 * Generate a plain-English draft of a Texas Last Will & Testament
 * from the user's decisions. This is NOT legal advice — it is a
 * starting point for attorney review.
 */
export function generateWillText(decisions: Decision[]): string {
  const testatorName = d(decisions, "family", "full_name");
  const partnerName = d(decisions, "family", "partner_name");
  const maritalStatus = d(decisions, "family", "marital_status");
  const children = d(decisions, "family", "children");
  const executor = d(decisions, "executor", "executor");
  const backupExecutor = d(decisions, "executor", "backup_executor");
  const distribution = d(decisions, "assets", "distribution");
  const realEstate = d(decisions, "assets", "real_estate");
  const accounts = d(decisions, "assets", "accounts");
  const business = d(decisions, "assets", "business");
  const digitalAssets = d(decisions, "assets", "digital_assets");
  const inheritanceAge = d(decisions, "assets", "inheritance_age");

  return `
================================================================================
              DRAFT DOCUMENT - FOR ATTORNEY REVIEW ONLY
================================================================================

                    LAST WILL AND TESTAMENT
                            OF
                    ${testatorName.toUpperCase()}

State of Texas

I, ${testatorName}, a resident of the State of Texas, being of sound mind and
memory, declare this to be my Last Will and Testament. I revoke all prior wills
and codicils.


ARTICLE 1 — ABOUT ME
---------------------

My name is ${testatorName}.
Marital status: ${maritalStatus}.
${partnerName !== "[NOT SPECIFIED]" ? `My spouse/partner is ${partnerName}.` : ""}
Children: ${children}.


ARTICLE 2 — EXECUTOR
---------------------

I appoint ${executor} as the independent executor of this will. My executor
shall serve without bond and shall have full authority to manage my estate,
including the power to sell, lease, or otherwise deal with any property in
my estate as they see fit.

If ${executor} is unable or unwilling to serve, I appoint ${backupExecutor}
as the successor executor with the same powers.


ARTICLE 3 — DEBTS AND EXPENSES
-------------------------------

I direct my executor to pay all legally enforceable debts, funeral expenses,
and costs of administering my estate from the assets of my estate.


ARTICLE 4 — DISTRIBUTION OF ASSETS
-----------------------------------

My wishes for how my assets should be distributed:

${distribution}

For reference, here is a summary of the assets discussed during our planning
session:

  Real estate: ${realEstate}
  Financial accounts: ${accounts}
  Business interests: ${business}
  Digital assets: ${digitalAssets}


ARTICLE 5 — MINOR CHILDREN
---------------------------

If any beneficiary under this will is a minor at the time of my passing, their
share shall be held in trust until they reach the age of ${inheritanceAge}.

Until that age, the trustee (my executor, unless otherwise specified) may use
income and principal from the trust for the beneficiary's health, education,
maintenance, and support.

For guardianship of my minor children, please see the separate Guardianship
Designation document.


ARTICLE 6 — RESIDUARY ESTATE
-----------------------------

Any property not specifically addressed above shall become part of my residuary
estate and shall be distributed according to the wishes stated in Article 4.

If any named beneficiary does not survive me by thirty (30) days, their share
shall be distributed among the remaining beneficiaries in equal parts, unless
otherwise specified.


ARTICLE 7 — NO-CONTEST
-----------------------

If any beneficiary contests this will or any of its provisions, that person
shall forfeit their entire share under this will.


ARTICLE 8 — TEXAS LAW
----------------------

This will shall be governed by and interpreted under the laws of the State of
Texas.


SIGNATURES AND WITNESSES
-------------------------

Testator signature: ________________________________________

Date: ____________________

Printed name: ${testatorName}


WITNESS 1:

Signature: ________________________________________
Printed name: ________________________________________
Address: ________________________________________
Date: ____________________


WITNESS 2:

Signature: ________________________________________
Printed name: ________________________________________
Address: ________________________________________
Date: ____________________


SELF-PROVING AFFIDAVIT
(To be completed before a notary public)

STATE OF TEXAS
COUNTY OF ____________________

Before me, the undersigned authority, on this day personally appeared
${testatorName} (Testator), and _________________________ and
_________________________ (Witnesses), known to me to be the testator and
witnesses whose names are signed to the foregoing instrument.

The testator declared to me and to the witnesses that the foregoing instrument
is the testator's last will and testament, and that the testator had willingly
signed and executed it as a free and voluntary act.

Each of the witnesses stated that they signed the will as witness in the
presence and at the request of the testator, and in the presence of each other.

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
