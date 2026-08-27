from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

from pypdf import PdfReader

import create_ground_questionnaire_pack as builder


ROOT = Path(r"C:\Users\t_moh\Documents\GitHub\landlord-heavenv3")
LIBRARY_DIR = ROOT / "output" / "pdf" / "england-possession-questionnaire-library"
ZIP_OUTPUT = ROOT / "output" / "pdf" / "landlord-heaven-england-possession-questionnaire-library.zip"

BASE_EVIDENCE = [
    "Tenancy agreement and all named tenants", "Landlord title / authority evidence",
    "Relevant correspondence", "Chronology of key events", "Any prior notice and service evidence", "Other supporting document",
]


def ground(code, title, status, notice, prompts, evidence):
    combined_evidence = (evidence + BASE_EVIDENCE)[:6]
    display_code = code[1:] if code.startswith("0") else code
    return (f"{code}-{title.lower().replace(' ', '-').replace('/', '-').replace(':', '')}", f"Ground {display_code} - {title}", status, notice, prompts, combined_evidence)


FORMS = [
    ground("01", "Occupation by landlord or family", "Mandatory", "4 months; cannot expire before the first 12 months of a new tenancy", ["Who needs to occupy the property, and what is their relationship to the landlord?", "Why is the property needed as that person's only or main home?", "When is occupation required and what evidence supports the timing?", "What notice was given to the tenant before the tenancy about possible use of this ground, if any?"], ["Signed statement of intention to occupy", "Proof of relationship / current address"]),
    ground("01A", "Sale of dwelling-house", "Mandatory", "4 months; cannot expire before the first 12 months of a new tenancy", ["Why is the property being sold and when was that decision made?", "What steps have been taken to market or sell the property?", "What is the tenancy start date and prior tenancy status?", "What notice was given before the tenancy about possible reliance on this ground, if any?"], ["Estate-agent instruction or valuation", "Marketing / sales evidence"]),
    ground("01B", "Rent to Buy sale", "Mandatory", "4 months", ["Confirm the landlord is a Private Registered Provider and the property is part of Rent to Buy.", "When and how was the tenant offered the opportunity to buy?", "What was the tenant's response to that offer?", "What documents show the Rent to Buy conditions and relevant dates?"], ["Rent to Buy scheme documents", "Offer to buy and tenant response"]),
    ground("02", "Sale by mortgagee", "Mandatory", "4 months", ["Who is the mortgagee or lender seeking possession?", "What enforcement event has occurred under the mortgage?", "Why is possession required for a sale?", "What authority shows who may bring the claim?"], ["Mortgage / charge evidence", "Lender enforcement correspondence"]),
    ground("02ZA", "Possession when superior lease ends", "Mandatory", "4 months", ["What is the superior lease and when will it end?", "Which qualifying landlord category applies to the claimant?", "Why does the tenancy fall within this ground?", "What notices or lease documents confirm the relevant dates?"], ["Superior lease", "Lease end / termination evidence"]),
    ground("02ZB", "Fixed term superior lease ends", "Mandatory", "4 months", ["What is the superior lease term and why was it for more than 21 years?", "When has the superior lease ended or when will it end?", "Why does the claimant have standing to use this ground?", "What lease and title documents prove the position?"], ["Superior lease", "Title / landlord-chain evidence"]),
    ground("02ZC", "Possession by superior landlord", "Mandatory", "4 months", ["Who is the superior landlord and why did they become the tenant's landlord?", "When and how did the original superior lease end?", "Which qualifying landlord category applies?", "What documents show the tenancy and landlord chain?"], ["Lease-end evidence", "Title / landlord-chain evidence"]),
    ground("02ZD", "Possession by superior landlord - fixed term", "Mandatory", "4 months", ["What was the superior lease term and why did it exceed 21 years?", "When did the lease revert to the superior landlord?", "Is the application within the relevant six-month window?", "What documents prove the landlord chain and dates?"], ["Superior lease", "Reversion / title evidence"]),
    ground("04", "Student accommodation", "Mandatory", "2 weeks", ["Confirm the claimant is a university or college and the property is student accommodation.", "When was the property last let to students?", "Why is the property now needed for student accommodation?", "What records identify the students and accommodation requirement?"], ["University or college status evidence", "Student accommodation records"]),
    ground("04A", "HMO needed for new students", "Mandatory", "4 months", ["Confirm the property is an HMO occupied by full-time students.", "When was this tenancy agreed and when did it begin?", "What incoming student group requires the property and for which academic period?", "What advance notice of possible reliance on Ground 4A was given?"], ["HMO / student evidence", "Incoming student booking evidence"]),
    ground("05", "Ministers of religion", "Mandatory", "2 months", ["How is the property usually used to house a minister of religion?", "Why is the property needed for that purpose again?", "Who will occupy it and when?", "What historic use and allocation evidence is held?"], ["Property-use records", "Religious-organisation confirmation"]),
    ground("05A", "Occupation by agricultural worker", "Mandatory", "2 months", ["Who needs to occupy the property as an agricultural worker?", "What is their employment or self-employment role?", "Why is this property needed for the worker?", "What documents evidence the agricultural work and housing need?"], ["Employment / engagement evidence", "Agricultural-work evidence"]),
    ground("05B", "Occupation by person meeting employment requirements", "Mandatory", "2 months", ["Confirm the claimant is a Private Registered Provider.", "What employment criteria apply to the property?", "Why does the current tenant not meet those criteria?", "Who needs the property and how do they meet the criteria?"], ["Provider status evidence", "Written employment criteria"]),
    ground("05C", "End of employment by landlord", "Mandatory", "2 months", ["Was the tenant employed by the landlord when the property was let?", "When and why did the employment end?", "Does the landlord need the property for a new employee or another qualifying purpose?", "What employment and tenancy documents evidence the arrangement?"], ["Employment contract / termination evidence", "Property allocation records"]),
    ground("05D", "End of employment requirements", "Mandatory", "2 months", ["Confirm the claimant is a Private Registered Provider.", "What employment requirements were stated in the tenancy?", "How and when did the tenant stop meeting them?", "What documents prove the criteria and the change?"], ["Provider status evidence", "Tenancy requirement evidence"]),
    ground("05E", "Occupation as supported accommodation", "Mandatory", "4 weeks", ["How is the property usually used as supported accommodation?", "Why is it currently let to a private tenant?", "Why is possession needed to use it again as supported accommodation?", "What documents prove the property and support arrangement meet the required definition?"], ["Support-service evidence", "Provider / property-use evidence"]),
    ground("05F", "Supported accommodation no longer suitable", "Mandatory", "4 weeks", ["What support was provided with the accommodation?", "What has changed: support ended, funding ended or the tenant's needs changed?", "Why is the current accommodation no longer suitable?", "What documents support the assessment and decision?"], ["Support plan / funding evidence", "Suitability assessment"]),
    ground("05G", "Tenancy granted for homelessness duty", "Mandatory", "4 weeks", ["How was the property used to meet a homelessness duty?", "What written notice has the council given that the housing is no longer needed?", "When was that notice received and is the relevant application window met?", "What tenancy and council records prove the arrangement?"], ["Council notice", "Homelessness-duty records"]),
    ground("05H", "Stepping stone accommodation", "Mandatory", "2 months", ["Confirm the claimant is a registered provider or charity.", "What written eligibility criteria applied and how did the tenant meet them at the start?", "Why does the tenant no longer meet the criteria or why has the defined period ended?", "What evidence supports the rent level, programme purpose and eligibility facts?"], ["Provider / charity status", "Eligibility and programme evidence"]),
    ground("06", "Redevelopment or demolition", "Mandatory", "4 months", ["Describe the redevelopment or demolition and why the tenant cannot remain during the works.", "What approvals, contracts and work dates are in place?", "Is alternative accommodation needed or was advance notice about this ground given?", "What tenancy timing restriction or exception may be relevant?"], ["Planning / approval evidence", "Works contract / programme"]),
    ground("06A", "Decant accommodation", "Mandatory", "4 months", ["Confirm the claimant is a relevant social landlord and describe the original decant arrangement.", "Why is the current accommodation no longer needed?", "What alternative accommodation is available to the tenant?", "How is it secure, affordable, suitable and not overcrowded?"], ["Decant / redevelopment records", "Alternative-accommodation assessment"]),
    ground("06B", "Compliance with enforcement action", "Mandatory", "4 months", ["What enforcement action applies to the landlord or property?", "Why does compliance require recovery of possession?", "What dates and compliance deadlines apply?", "Is tenant compensation relevant and what evidence supports the position?"], ["Enforcement notice / decision", "Compliance timetable"]),
    ground("07", "Death of tenant", "Mandatory", "2 months", ["Who was the former tenant and when did they die?", "Who now occupies or inherited the tenancy and were they living there immediately before the death?", "Why does succession not prevent reliance on this ground?", "Are any 12-month timing limits relevant?"], ["Death certificate", "Succession / occupancy evidence"]),
    ground("07A", "Severe antisocial or criminal behaviour", "Mandatory", "No notice period; court cannot make an order until 14 days after notice", ["Which tenant, occupier or visitor is relevant and what qualifying conviction, breached order or closure order exists?", "Give the court, order or closure reference and all dates.", "How does the conviction, breached order or closure order meet the statutory route?", "What safety, safeguarding and witness issues need careful handling?"], ["Conviction / order / closure evidence", "Police and witness material"]),
    ground("07B", "No right to rent", "Mandatory", "2 weeks", ["What notice has the Secretary of State given and when was it received?", "Which tenant is affected and how is their identity matched to the tenancy?", "What checks confirm the notice is current and applies to this property?", "What response has the tenant given?"], ["Secretary of State notice", "Right to Rent records"]),
    ground("08", "Rent arrears", "Mandatory", "4 weeks", ["What is the rent frequency, contractual rent and each due date?", "What are the arrears at the notice date and current date?", "For the selected rent frequency, is the threshold met at notice and likely to be met at hearing?", "Are any sums disputed or attributable to Universal Credit non-receipt?"], ["Rent schedule", "Bank statements / payment ledger"]),
    ground("09", "Suitable alternative accommodation", "Discretionary", "2 months", ["Describe the alternative accommodation offered, including address, rent, tenure and availability.", "Why is it suitable for the household and relevant needs?", "When was the offer made and what was the response?", "What arrangements exist for moving costs or practical support?"], ["Alternative-accommodation offer", "Suitability / affordability evidence"]),
    ground("10", "Any rent arrears", "Discretionary", "4 weeks", ["What is the rent due, frequency and current arrears?", "Provide a clear month-by-month arrears schedule.", "What payment requests and reasonable repayment opportunities have been given?", "What factors support the court finding possession reasonable?"], ["Rent schedule", "Payment correspondence"]),
    ground("11", "Persistent delay in paying rent", "Discretionary", "4 weeks", ["Give a month-by-month history of late payments, including dates due and dates received.", "How often has rent been paid late and over what period?", "What reminders, warnings or repayment opportunities were given?", "What is the tenant's explanation and current payment position?"], ["Rent ledger", "Late-payment correspondence"]),
    ground("12", "Breach of tenancy other than rent", "Discretionary", "2 weeks", ["Which tenancy term has been breached? Quote the clause and attach the agreement.", "What happened, when and who witnessed it?", "What warning or opportunity to remedy was given?", "Why would possession be reasonable despite the tenant's response?"], ["Tenancy clause", "Warning / breach correspondence"]),
    ground("13", "Deterioration of property", "Discretionary", "2 weeks", ["Describe each area of deterioration and when it was discovered.", "What was the previous condition and what evidence records it?", "Why is the tenant responsible or said to have allowed the deterioration?", "What inspections, warnings and opportunities to remedy were given?"], ["Inventory / check-in report", "Photos and repair estimates"]),
    ground("14", "Antisocial behaviour", "Discretionary", "No notice period; court cannot make an order until 14 days after notice", ["What antisocial behaviour or serious offence occurred, and where?", "Who committed it: tenant, occupier or visitor?", "How did the behaviour affect the property, a neighbour or the locality?", "What evidence, warnings and current safety issues are relevant?"], ["Police / incident reports", "Witness statements / evidence"]),
    ground("14A", "Domestic abuse - social landlords only", "Discretionary", "2 weeks", ["Confirm the claimant is a social landlord.", "Who carried out the abuse and who has left the property?", "Why is that person unlikely to return?", "What safeguarding and confidentiality needs apply?"], ["Social-landlord status", "Safeguarding / support evidence"]),
    ground("14ZA", "Rioting", "Discretionary", "2 weeks", ["Which adult tenant or occupier was convicted of a riot-related offence?", "Give the court, conviction and date.", "How is the convicted person connected to the tenancy?", "What factors support possession being reasonable?"], ["Conviction record", "Occupancy evidence"]),
    ground("15", "Deterioration of furniture", "Discretionary", "2 weeks", ["List the furniture or fittings affected and their previous and current condition.", "What evidence identifies responsibility for the deterioration?", "What inspection, warning and repair opportunities were given?", "What remedy cost or loss is claimed, if any?"], ["Furniture inventory", "Photos / repair estimates"]),
    ground("17", "False statement", "Discretionary", "2 weeks", ["What information was false, who supplied it and when?", "Why was the information material to granting the tenancy?", "When and how was the false statement discovered?", "What explanation has the tenant or their representative given?"], ["Tenancy application", "Verification records"]),
    ground("18", "Supported accommodation - lack of cooperation", "Discretionary", "4 weeks", ["What support is provided and how does the accommodation meet the statutory definition?", "What cooperation is expected from the tenant?", "What specific failures to cooperate occurred, with dates?", "What support, warnings and reasonable adjustments were offered?"], ["Support plan / provider evidence", "Chronology of non-cooperation"]),
]


GENERAL_FORM = (
    "00-general-fact-finding-ground-unclear",
    "General possession fact-finding - ground unclear",
    "Initial fact-finding only",
    "Do not serve until the correct ground, notice period and current official form are confirmed",
    [
        "What outcome do you want: possession, rent recovery, a tenancy change, or another resolution?",
        "Describe the problem in date order, including any tenant communication and actions already taken.",
        "What tenancy, rent, deposit, compliance, repair, safety, sale, employment or support facts may be relevant?",
        "What documents, evidence and service records do you hold, and what is missing?",
    ],
    ["Tenancy agreement", "Rent / payment record", "Notices and service evidence", "Tenant correspondence", "Compliance / repair records", "Other evidence"],
)


def main():
    LIBRARY_DIR.mkdir(parents=True, exist_ok=True)
    builder.PACK_DIR = LIBRARY_DIR
    created = [builder.create_form(GENERAL_FORM)]
    created.extend(builder.create_form(config) for config in FORMS)
    for path in created:
        reader = PdfReader(str(path))
        fields = reader.get_fields() or {}
        if len(reader.pages) != 2 or len(fields) < 20:
            raise RuntimeError(f"Verification failed for {path.name}")
    readme = LIBRARY_DIR / "READ-ME.txt"
    readme.write_text(
        "Landlord Heaven - England possession questionnaire library\n\n"
        "Use the General Fact-Finding form where the likely ground is not clear. Otherwise send the individual questionnaire matching the likely ground before the telephone call.\n"
        "Each PDF is editable and gathers factual information for document preparation. It does not provide legal advice, choose the correct route or guarantee a court outcome.\n"
        "The library follows the ground categories and notice positions in official England guidance current as at 26 August 2026. Check the current official Form 3A and guidance before any notice is served.\n",
        encoding="utf-8",
    )
    with ZipFile(ZIP_OUTPUT, "w", ZIP_DEFLATED) as archive:
        for path in sorted(LIBRARY_DIR.iterdir()):
            archive.write(path, path.name)
    print(f"Created {len(created)} individual editable questionnaires.")
    print(ZIP_OUTPUT)


if __name__ == "__main__":
    main()
