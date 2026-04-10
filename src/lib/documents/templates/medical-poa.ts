import type { Decision } from "@/types";

function d(decisions: Decision[], section: string, key: string): string {
  const found = decisions.find((dec) => dec.section === section && dec.key === key);
  return found?.value ?? "[NOT SPECIFIED]";
}

/**
 * Generate a plain-English Medical Power of Attorney document
 * from the user's decisions.
 */
export function generateMedicalPoaText(decisions: Decision[]): string {
  const testatorName = d(decisions, "family", "full_name");
  const partnerName = d(decisions, "family", "partner_name");
  const medicalPoa = d(decisions, "healthcare", "medical_poa");
  const partnerMedicalPoa = d(decisions, "healthcare", "partner_medical_poa");
  const lifeSupport = d(decisions, "healthcare", "life_support");
  const organDonation = d(decisions, "healthcare", "organ_donation");

  const hasPartner = partnerName !== "[NOT SPECIFIED]";

  return `
================================================================================
              DRAFT DOCUMENT - FOR ATTORNEY REVIEW ONLY
================================================================================

                MEDICAL POWER OF ATTORNEY
                     AND
              DIRECTIVE TO PHYSICIANS

State of Texas


PART 1 — MEDICAL POWER OF ATTORNEY FOR ${testatorName.toUpperCase()}
${"=".repeat(60)}

I, ${testatorName}, a resident of the State of Texas, hereby designate the
following person as my agent to make healthcare decisions on my behalf if I
become unable to make or communicate my own healthcare decisions:

  Medical agent: ${medicalPoa}

My agent shall have the authority to:

  1. Consent to, refuse, or withdraw any medical treatment, procedure,
     or service.

  2. Access my medical records and health information (see HIPAA
     Authorization, a separate document).

  3. Make decisions about my care in any hospital, nursing facility,
     or other healthcare setting.

  4. Hire and fire healthcare providers.

  5. Make decisions about organ and tissue donation after my death
     (subject to my wishes below).


MY WISHES REGARDING LIFE-SUSTAINING TREATMENT
----------------------------------------------

${lifeSupport !== "[NOT SPECIFIED]"
    ? `My preferences regarding life support: ${lifeSupport}`
    : "I have not specified preferences regarding life-sustaining treatment. I ask my agent to use their best judgment in consultation with my physicians."}

This directive applies if I am diagnosed with a terminal or irreversible
condition and am unable to communicate my wishes.


MY WISHES REGARDING ORGAN DONATION
-----------------------------------

${organDonation !== "[NOT SPECIFIED]"
    ? `My preferences regarding organ donation: ${organDonation}`
    : "I have not specified organ donation preferences."}


HIPAA AUTHORIZATION REFERENCE
------------------------------

I have executed a separate HIPAA Authorization form granting my medical agent
and designated family members access to my protected health information. That
document should be read together with this Medical Power of Attorney.

${hasPartner ? `
${"=".repeat(60)}
PART 2 — MEDICAL POWER OF ATTORNEY FOR ${partnerName.toUpperCase()}
${"=".repeat(60)}

I, ${partnerName}, a resident of the State of Texas, hereby designate the
following person as my agent to make healthcare decisions on my behalf if I
become unable to make or communicate my own healthcare decisions:

  Medical agent: ${partnerMedicalPoa}

My agent shall have the same authority as described in Part 1 above.

MY WISHES REGARDING LIFE-SUSTAINING TREATMENT
----------------------------------------------

${lifeSupport !== "[NOT SPECIFIED]"
    ? `My preferences regarding life support: ${lifeSupport}`
    : "I have not specified preferences regarding life-sustaining treatment. I ask my agent to use their best judgment in consultation with my physicians."}


MY WISHES REGARDING ORGAN DONATION
-----------------------------------

${organDonation !== "[NOT SPECIFIED]"
    ? `My preferences regarding organ donation: ${organDonation}`
    : "I have not specified organ donation preferences."}
` : ""}

DURATION AND REVOCATION
------------------------

This Medical Power of Attorney is effective immediately and shall remain in
effect until revoked. I may revoke this document at any time by notifying my
agent or healthcare provider in writing, orally, or by any other act showing
a specific intent to revoke.


SIGNATURES
----------

Principal: ________________________________________
Printed name: ${testatorName}
Date: ____________________

${hasPartner ? `Principal: ________________________________________
Printed name: ${partnerName}
Date: ____________________
` : ""}

WITNESS 1 (must not be the designated agent):

Signature: ________________________________________
Printed name: ________________________________________
Date: ____________________


WITNESS 2 (must not be the designated agent):

Signature: ________________________________________
Printed name: ________________________________________
Date: ____________________


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
