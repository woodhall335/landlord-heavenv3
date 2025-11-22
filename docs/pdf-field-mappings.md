# HMCTS Official Court Forms - Field Mapping Reference

This document maps the actual PDF form field names from official HMCTS forms to our CaseData interface fields.

**Generated:** 2025-11-22
**Source:** Inspection of official PDF forms using pdf-lib

---

## Summary

| Form | Filename | Fields | Complexity |
|------|----------|--------|------------|
| N5 - Claim for possession | n5-eng.pdf | 54 | Medium - descriptive field names |
| N5B - Accelerated possession | n5b-eng.pdf | 246 | High - very detailed, excellent field names |
| N119 - Particulars of claim | n119-eng.pdf | 54 | Medium - clear field names |
| N1 - Claim form | N1_1224.pdf | 43 | Challenging - generic field names |
| Form 6A - Section 21 notice | form_6a.pdf | 16 | Simple - clear field names |

---

## Form 6A - Section 21 Notice (form_6a.pdf)

**Total fields: 16**

### Field Mappings

| PDF Field Name | Type | Maps to CaseData | Notes |
|----------------|------|------------------|-------|
| `Premises address` | Text | `property_address` | Full property address |
| `leaving date DD/MM/YYYYY` | Text | `notice_expiry_date` | Date tenant must leave |
| `Name 1` | Text | `landlord_full_name` | First landlord/agent name |
| `Name 2` | Text | `landlord_2_name` | Second landlord name (optional) |
| `Address 1` | Text | `landlord_address` | Landlord/agent address line 1 |
| `Signatory telephone1` | Text | `landlord_phone` | Contact phone 1 |
| `Signatory telephone2` | Text | - | Contact phone 2 (optional) |
| `Check Box 1` | Checkbox | - | Additional checkbox |
| `Signatory Name 1` | Text | `landlord_full_name` | Signatory 1 name |
| `Signed 1` | Text | - | Signature field 1 |
| `Date 2` | Text | `notice_date` | Date notice signed |
| `Signatory name 2` | Text | `landlord_2_name` | Signatory 2 name (optional) |
| `Signatory Telephone 1` | Text | `landlord_phone` | Phone number |
| `Signatory Telephone 2` | Text | - | Phone number 2 |
| `Signatory address 1` | Text | `landlord_address` | Address line 1 |
| `Signatory address 2` | Text | - | Address line 2 |

---

## N5 - Claim for Possession (n5-eng.pdf)

**Total fields: 54**

### Key Field Mappings

| PDF Field Name | Type | Maps to CaseData | Notes |
|----------------|------|------------------|-------|
| `In the court` | Text | `court_name` | County court name |
| `Fee account no` | Text | `fee_account_number` | Court fee account |
| `claimant's details` | Text | `landlord_full_name` + `landlord_address` | Full claimant details |
| `defendant's details` | Text | `tenant_full_name` + `property_address` | Full defendant details |
| `possession of` | Text | `property_address` | Property address |
| `heardon` | Text | - | Hearing date (set by court) |
| `year` | Text | - | Hearing year |
| `time` | Text | - | Hearing time |
| `location` | Text | - | Hearing location |
| `address for service` | Text | `landlord_address` | Service address |
| `courtfee` | Text | - | Court fee amount |
| `solfee` | Text | - | Solicitor fee |
| `total` | Text | - | Total fees |
| `issuedate` | Text | - | Issue date (auto-filled by court) |
| `claimno` | Text | - | Claim number (auto-filled by court) |
| `claim no` | Text | - | Duplicate claim number field |

### Claim Ground Checkboxes

| PDF Field Name | Type | Maps to | Notes |
|----------------|------|---------|-------|
| `rent arrears - yes` | Checkbox | Ground 8, 10, 11 | Rent arrears grounds |
| `other breach of tenancy - yes` | Checkbox | Ground 12, 13, 14, 15 | Other breaches |
| `forfeiture of the lease - yes` | Checkbox | - | Lease forfeiture |
| `mortgage arrears - yes` | Checkbox | - | Mortgage possession |
| `other breach of the mortgage - yes` | Checkbox | - | Mortgage breach |
| `trespass - yes` | Checkbox | Ground 7 | Trespass |
| `other - yes` | Checkbox | - | Other grounds |
| `some other reason - details` | Text | - | Custom ground details |
| `anti-social behaviour - yes` | Checkbox | Ground 14 | ASB |
| `unlawful use - yes` | Checkbox | Ground 15 | Unlawful use |
| `demotion of tenancy - yes` | Checkbox | - | Demotion claim |
| `demotion of tenancy - no` | Checkbox | - | No demotion |
| `order suspending the right to buy - yes` | Checkbox | - | RTB suspension |
| `order suspending the right to buy - no` | Checkbox | - | No RTB suspension |
| `HRA - yes` | Checkbox | - | Human Rights Act considered |
| `HRA - no` | Checkbox | - | HRA not applicable |

### Statement of Truth Fields

| PDF Field Name | Type | Maps to | Notes |
|----------------|------|---------|-------|
| `I believe that the facts stated in this clam form are true` | Checkbox | - | Claimant signing |
| `The Claimant believes that the facts stated in this claim form are true. I am authorised by the claimant to sign this statement` | Checkbox | - | Representative signing |
| `Statement of Truth signature box` | Text | - | Signature |
| `Statement of Truth is signed by the Claimant` | Checkbox | - | Signed by claimant |
| `Statement of Truth is signed by the Litigation friend (where claimant is a child or a patient)` | Checkbox | - | Litigation friend |
| `Statement of Truth is signed by the Claimant's legal representative (as defined by CPR 2.3(1))` | Checkbox | - | Legal rep |
| `Date the Statement of Truth is signed - DD` | Text | - | Day |
| `Date the Statement of Truth is signed - MM` | Text | - | Month |
| `Date the Statement of Truth is signed - YYYY` | Text | - | Year |
| `Full name of the person signing the Statement of Truth` | Text | `landlord_full_name` | Signatory name |
| `Name of claimant's legal representative's firm` | Text | - | Law firm name |
| `If signing on behalf of firm or company give position or office held` | Text | - | Position |

### Service Address Fields

| PDF Field Name | Type | Maps to | Notes |
|----------------|------|---------|-------|
| `building and street - Claimant's or claimant's legal representative's address to which documents or payments should be sent` | Text | `landlord_address` | Street |
| `Second line of address - Claimant's or claimant's legal representative's address to which documents or payments should be sent` | Text | - | Address line 2 |
| `Town or city - Claimant's or claimant's legal representative's address to which documents or payments should be sent` | Text | `landlord_town` | Town/city |
| `County (optional) - Claimant's or claimant's legal representative's address to which documents or payments should be sent` | Text | `landlord_county` | County |
| `Postcode - Claimant's or claimant's legal representative's address to which documents or payments should be sent` | Text | `landlord_postcode` | Postcode |
| `If applicable, phone number` | Text | `landlord_phone` | Phone |
| `If applicable, fax number` | Text | - | Fax |
| `If applicable, DX number` | Text | - | DX number |
| `If applicable, email address` | Text | `landlord_email` | Email |
| `If applicable, your reference` | Text | - | Reference |

---

## N5B - Accelerated Possession (n5b-eng.pdf)

**Total fields: 246** (Most comprehensive form)

### Header Fields

| PDF Field Name | Type | Maps to CaseData | Notes |
|----------------|------|------------------|-------|
| `Enter the full names of the Claimants` | Text | `landlord_full_name` + `landlord_2_name` | All claimant names |
| `Enter the full names of the Defendants` | Text | `tenant_full_name` + `tenant_2_name` | All defendant names |
| `Name and address of the court` | Text | `court_name` | Court details |
| `The Claimant is claiming possession of` | Text | `property_address` | Property address |
| `Claim no` | Text | - | Auto-filled by court |
| `Issue date` | Text | - | Auto-filled by court |
| `Fee Account no if applicable` | Text | `fee_account_number` | Fee account |
| `Help with Fees Ref no if applicable` | Text | - | HWF reference |
| `Court fee` | Text | - | Fee amount |
| `Legal representatives costs` | Text | - | Legal costs |
| `Total amount` | Text | - | Total |

### First Claimant Details

| PDF Field Name | Type | Maps to | Notes |
|----------------|------|---------|-------|
| `First Claimant's first names` | Text | `landlord_full_name` (first name part) | First names |
| `First Claimant's last name` | Text | `landlord_full_name` (surname part) | Surname |
| `First Claimant's address: building and street` | Text | `landlord_address` | Street |
| `First Claimant's address: second line of address` | Text | - | Address line 2 |
| `First Claimant's address: town or city` | Text | `landlord_town` | Town |
| `First Claimant's address: county (optional)` | Text | `landlord_county` | County |
| `First Claimant's address: postcode` | Text | `landlord_postcode` | Postcode (max 7 chars) |

### Second Claimant Details (Optional)

| PDF Field Name | Type | Maps to | Notes |
|----------------|------|---------|-------|
| `Second Claimant's first names` | Text | `landlord_2_name` (first name part) | First names |
| `Second Claimant's last name` | Text | `landlord_2_name` (surname part) | Surname |
| `Second Claimant's address: building and street` | Text | - | Street |
| `Second Claimant's address: second line of address` | Text | - | Address line 2 |
| `Second Claimant's address: town or city` | Text | - | Town |
| `Second Claimant's address: county (optional)` | Text | - | County |
| `Second Claimant's address: postcode` | Text | - | Postcode |

### Third Claimant Details (Optional)

Similar structure to Second Claimant.

### First Defendant Details

| PDF Field Name | Type | Maps to | Notes |
|----------------|------|---------|-------|
| `First Defendant's first name(s)` | Text | `tenant_full_name` (first name part) | First names |
| `First Defendant's last name` | Text | `tenant_full_name` (surname part) | Surname |
| `First Defendant's address: building and street` | Text | `property_address` | Usually same as property |
| `First Defendant's address: second line of address` | Text | - | Address line 2 |
| `First Defendant's address: town or city` | Text | - | Town |
| `First Defendant's address: county (optional)` | Text | - | County |
| `First Defendant's address: postcode` | Text | - | Postcode |

### Second/Third Defendant Details

Similar structure to First Defendant.

### Section 21 Specific Questions

| PDF Field Name | Type | Maps to | Notes |
|----------------|------|---------|-------|
| `Is the property you are claiming possession of located wholly or partly in England? Yes` | Checkbox | - | England location |
| `Is the property you are claiming possession of located wholly or partly in England? No` | Checkbox | - | Not England (Wales) |
| `3. Are you (the Claimant) asking for an order that the Defendant pay the costs of the claim? - Yes` | Checkbox | - | Costs claimed |
| `3. Are you (the Claimant) asking for an order that the Defendant pay the costs of the claim? - No` | Checkbox | - | No costs |
| `5. Is the property a dwelling house or part of a dwelling house? Yes` | Checkbox | - | Dwelling house |
| `5. Is the property a dwelling house or part of a dwelling house? No` | Checkbox | - | Not dwelling house |

### Tenancy Agreement Dates

| PDF Field Name | Type | Maps to | Notes |
|----------------|------|---------|-------|
| `6. On what date was the property let to the Defendant by way of a written tenancy agreement? Day` | Text | `tenancy_start_date` (day) | Day |
| `6. On what date was the property let to the Defendant by way of a written tenancy agreement? Month` | Text | `tenancy_start_date` (month) | Month |
| `6. On what date was the property let to the Defendant by way of a written tenancy agreement? Year` | Text | `tenancy_start_date` (year) | Year |
| `7. The tenancy agreement is dated. Day` | Text | `tenancy_agreement_date` (day) | Agreement day |
| `7. The tenancy agreement is dated. Month` | Text | `tenancy_agreement_date` (month) | Agreement month |
| `7. The tenancy agreement is dated. Year` | Text | `tenancy_agreement_date` (year) | Agreement year |

### Subsequent Tenancies

| PDF Field Name | Type | Maps to | Notes |
|----------------|------|---------|-------|
| `8. Has any subsequent written tenancy agreement been entered into? Yes` | Checkbox | - | Subsequent tenancy exists |
| `8. Has any subsequent written tenancy agreement been entered into? No` | Checkbox | - | No subsequent tenancy |
| `The Defendant has been granted a further tenancy by way of written agreement` | Checkbox | - | Single further tenancy |
| `The Defendant has been granted further tenancies by way of written agreements` | Checkbox | - | Multiple further tenancies |
| `These tenancies were` | Checkbox | - | Details |
| `Date(s) the further tenancy or tenancies were granted` | Text | - | Dates |

### AST Verification (Critical for Section 21)

| PDF Field Name | Type | Maps to | Notes |
|----------------|------|---------|-------|
| `9a Was the first tenancy and any agreement for it made on or after 28 February 1997? Yes` | Checkbox | - | Post-1997 (likely AST) |
| `9a Was the first tenancy and any agreement for it made on or after 28 February 1997? No` | Checkbox | - | Pre-1997 |
| `9b Was a notice served on the Defendant stating that any tenancy would not be, or would cease to be, an assured shorthold tenancy? Yes` | Checkbox | - | Notice served (not AST) |
| `9b Was a notice served on the Defendant stating that any tenancy would not be, or would cease to be, an assured shorthold tenancy? No` | Checkbox | - | No notice (likely AST) |
| `9c Is there any provision in any tenancy agreement which states that it is not an assured shorthold tenancy? Yes` | Checkbox | - | Provision exists (not AST) |
| `9c Is there any provision in any tenancy agreement which states that it is not an assured shorthold tenancy? No` | Checkbox | - | No provision |
| `9d Is the 'agricultural worker condition' defined in Schedule 3 to the Housing Act 1988 fulfilled with respect to the property? Yes` | Checkbox | - | Agricultural worker |
| `9d Is the 'agricultural worker condition' defined in Schedule 3 to the Housing Act 1988 fulfilled with respect to the property? No` | Checkbox | - | Not agricultural |
| `9e Did any tenancy arise by way of succession under s.39 of the Housing Act 1988? Yes` | Checkbox | - | Succession tenancy |
| `9e Did any tenancy arise by way of succession under s.39 of the Housing Act 1988? No` | Checkbox | - | No succession |
| `9f Was any tenancy previously a secure tenancy under s.79 of the Housing Act 1985? Yes` | Checkbox | - | Was secure tenancy |
| `9f Was any tenancy previously a secure tenancy under s.79 of the Housing Act 1985? No` | Checkbox | - | Not secure tenancy |
| `9g Did any tenancy arise under Schedule 10 to the Local Government and Housing Act 1989 (at the end of a long residential tenancy)? Yes` | Checkbox | - | Long tenancy ended |
| `9g Did any tenancy arise under Schedule 10 to the Local Government and Housing Act 1989 (at the end of a long residential tenancy)? No` | Checkbox | - | No long tenancy |

### Section 21 Notice Service

| PDF Field Name | Type | Maps to | Notes |
|----------------|------|---------|-------|
| `10a How was the notice served` | Text | `notice_service_method` | Service method |
| `10b. On what date was the notice served? Day` | Text | `notice_date` (day) | Day |
| `10b. On what date was the notice served? Month` | Text | `notice_date` (month) | Month |
| `10b. On what date was the notice served? Year` | Text | `notice_date` (year) | Year |
| `10c Who served the notice` | Text | - | Server name |
| `10d Who was the notice served on` | Text | `tenant_full_name` | Served on |
| `10e. After what date did the notice require the Defendant to leave the property? Day` | Text | `notice_expiry_date` (day) | Expiry day |
| `10e. After what date did the notice require the Defendant to leave the property? Month` | Text | `notice_expiry_date` (month) | Expiry month |
| `10e. After what date did the notice require the Defendant to leave the property? Year` | Text | `notice_expiry_date` (year) | Expiry year |

### HMO/Selective Licensing (Critical for Section 21)

| PDF Field Name | Type | Maps to | Notes |
|----------------|------|---------|-------|
| `11a. Is the property required to be licensed under Part 2 (Houses in Multiple Occupation) or Part 3 (Selective Licensing) of the Housing Act 2004? Yes` | Checkbox | `hmo_license_required` | License required |
| `11a. Is the property required to be licensed under Part 2 (Houses in Multiple Occupation) or Part 3 (Selective Licensing) of the Housing Act 2004? No` | Checkbox | - | No license required |
| `If yes, is there a valid licence? Yes` | Checkbox | `hmo_license_valid` | Valid license |
| `If yes, is there a valid licence? No` | Checkbox | - | No valid license |
| `11b. Is a decision outstanding as to licensing, or as to a temporary exemption notice? Yes` | Checkbox | - | Decision pending |
| `11b. Is a decision outstanding as to licensing, or as to a temporary exemption notice? No` | Checkbox | - | No decision pending |

### Deposit Protection (Critical for Section 21)

| PDF Field Name | Type | Maps to | Notes |
|----------------|------|---------|-------|
| `12. Was a deposit paid in connection with the current tenancy or any prior tenancy of the property to which the Defendant was a party? Yes` | Checkbox | `deposit_paid` | Deposit paid |
| `12. Was a deposit paid in connection with the current tenancy or any prior tenancy of the property to which the Defendant was a party? No` | Checkbox | - | No deposit |
| `13. Has the deposit been returned to the Defendant (or the person – if not the Defendant – who paid the deposit)? Yes` | Checkbox | `deposit_returned` | Returned |
| `13. Has the deposit been returned to the Defendant (or the person – if not the Defendant – who paid the deposit)? No` | Checkbox | - | Not returned |
| `Date the deposit was returned - Day` | Text | - | Day |
| `Date the deposit was returned - Month` | Text | - | Month |
| `Date the deposit was returned - Year` | Text | - | Year |
| `14a. Has the Claimant given to the Defendant, and to anyone who paid the deposit on behalf of the Defendant, the prescribed information? Yes` | Checkbox | `deposit_prescribed_info_given` | Info given |
| `14a. Has the Claimant given to the Defendant, and to anyone who paid the deposit on behalf of the Defendant, the prescribed information? No` | Checkbox | - | Info not given |
| `14b. On what date was the prescribed information given? Day` | Text | `deposit_prescribed_info_date` (day) | Day |
| `14b. On what date was the prescribed information given? Month` | Text | `deposit_prescribed_info_date` (month) | Month |
| `14b. On what date was the prescribed information given? Year` | Text | `deposit_prescribed_info_date` (year) | Year |

### Housing Act 2004 Notices (Retaliatory Eviction Prevention)

| PDF Field Name | Type | Maps to | Notes |
|----------------|------|---------|-------|
| `15. Has the Claimant been served with a relevant notice in relation to the condition of the property or relevant common parts under s.11, s.12 or s.40(7) of the Housing Act 2004? Yes` | Checkbox | `housing_act_notice_served` | Notice served on landlord |
| `15. Has the Claimant been served with a relevant notice in relation to the condition of the property or relevant common parts under s.11, s.12 or s.40(7) of the Housing Act 2004? No` | Checkbox | - | No notice served |
| `15a Date the notice was served - Day` | Text | - | Day |
| `15a Date the notice was served - Month` | Text | - | Month |
| `15a Date the notice was served - Year` | Text | - | Year |
| `15b. Has the operation of the relevant notice been suspended? Yes` | Checkbox | - | Suspended |
| `15b. Has the operation of the relevant notice been suspended? No` | Checkbox | - | Not suspended |
| `15g. Did the Defendant complain or try to complain about the relevant condition of the property or the common parts to the Claimant before the notice was given? Yes` | Checkbox | - | Tenant complained (retaliatory eviction risk) |
| `15g. Did the Defendant complain or try to complain about the relevant condition of the property or the common parts to the Claimant before the notice was given? No` | Checkbox | - | No complaint |
| `15h. Is the relevant condition of the property or common parts due to a breach of duty or contract on the part of the Defendant? Yes` | Checkbox | - | Tenant's fault |
| `15h. Is the relevant condition of the property or common parts due to a breach of duty or contract on the part of the Defendant? No` | Checkbox | - | Not tenant's fault |

### EPC and Gas Safety

| PDF Field Name | Type | Maps to | Notes |
|----------------|------|---------|-------|
| `Copy of the Energy Performance Certificate marked F` | Checkbox | `epc_provided` | EPC attached |
| `Copy of the Gas Safety Records marked G G1 G2 etc` | Checkbox | `gas_safety_provided` | Gas cert attached |
| `Copy of the Tenancy Deposit Certificate marked E` | Checkbox | `deposit_certificate_provided` | Deposit cert attached |

### Attachments

| PDF Field Name | Type | Maps to | Notes |
|----------------|------|---------|-------|
| `Copy of the first written tenancy agreement marked A` | Checkbox | - | Tenancy agreement attached |
| `Copy of the notice saying that possession was required marked B` | Checkbox | - | Section 21 notice attached |
| `Proof of service of the notice requiring possession marked B1` | Checkbox | - | Service proof attached |

### Statement of Truth

| PDF Field Name | Type | Maps to | Notes |
|----------------|------|---------|-------|
| `Statement of Truth signature` | Text | - | Signature |
| `Name of Claimants legal representatives firm` | Text | - | Law firm |
| `If signing on behalf of firm or company give position or office held` | Text | - | Position |

---

## N119 - Particulars of Claim for Possession (n119-eng.pdf)

**Total fields: 54**

### Header Fields

| PDF Field Name | Type | Maps to CaseData | Notes |
|----------------|------|------------------|-------|
| `name of court` | Text | `court_name` | County court name |
| `claim no` | Text | - | Auto-filled by court |
| `name of claimant` | Text | `landlord_full_name` | Claimant name |
| `name of defendant` | Text | `tenant_full_name` | Defendant name |

### Property and Possession

| PDF Field Name | Type | Maps to | Notes |
|----------------|------|---------|-------|
| `The claimant has a right to possession of:` | Text | `property_address` | Property address |
| `To the best of the claimant's knowledge the following persons are in possession of the property:` | Text | `tenant_full_name` + others | Occupants |

### Tenancy Details

| PDF Field Name | Type | Maps to | Notes |
|----------------|------|---------|-------|
| `3(a) Type of tenancy` | Text | `tenancy_type` | e.g., "Assured Shorthold Tenancy" |
| `3(a) Date of tenancy` | Text | `tenancy_start_date` | Start date |
| `3(b) The current rent is` | Text | `rent_amount` | Rent amount |
| `3(b) The current rent is payable each week` | Text | - | Weekly rent |
| `3(b) The current rent is payable each fortnight` | Text | - | Fortnightly rent |
| `3(b) The current rent is payable each month` | Text | - | Monthly rent |
| `3(b) The current rent is payable each - specify the period` | Text | `rent_frequency` | Other frequency |
| `3(c) Any unpaid rent or charge for use and occupation should be calculated at £` | Text | `current_arrears_amount` | Arrears |

### Grounds for Possession

| PDF Field Name | Type | Maps to | Notes |
|----------------|------|---------|-------|
| `4. (a) The reason the claimant is asking for possession is:` | Text | `particulars_of_claim` | Main particulars |
| `4. (b) The reason the claimant is asking for possession is:` | Text | - | Additional particulars |
| `4. (c) The reason the claimant is asking for possession is:` | Text | - | Further particulars |

### Arrears Recovery Steps

| PDF Field Name | Type | Maps to | Notes |
|----------------|------|---------|-------|
| `5. The following steps have already been taken to recover any arrears:` | Text | - | Steps taken (e.g., letters, notices) |

### Notice Details

| PDF Field Name | Type | Maps to | Notes |
|----------------|------|---------|-------|
| `6. Other type of notice` | Text | - | Notice type if not standard |
| `6. Day and month notice served` | Text | `notice_date` | DD/MM |
| `6. Year notice served` | Text | `notice_date` | YYYY |

### Defendant's Circumstances

| PDF Field Name | Type | Maps to | Notes |
|----------------|------|---------|-------|
| `7. The following information is known about the defendant's circumstances:` | Text | - | Defendant's situation |
| `8. The claimant is asking the court to take the following financial or other information into account when making its decision whether or not to grant an order for possession:` | Text | - | Financial info |

### Relief Against Forfeiture

| PDF Field Name | Type | Maps to | Notes |
|----------------|------|---------|-------|
| `9. (b) Entitled to relief against forfeiture - name` | Text | - | Name |
| `9. (b) Entitled to relief against forfeiture - address` | Text | - | Address |

### Demotion/Suspension Orders

| PDF Field Name | Type | Maps to | Notes |
|----------------|------|---------|-------|
| `11. In the alternative to possession, is the claimant asking the court to make a demotion order or an order suspending the right to buy? Yes` | Checkbox | - | Yes |
| `11. In the alternative to possession, is the claimant asking the court to make a demotion order or an order suspending the right to buy? No` | Checkbox | - | No |
| `12. The (demotion) (suspension) claim is made under: section 82A(2) of the Housing Act 1985` | Checkbox | - | Section 82A(2) |
| `12. The (demotion) (suspension) claim is made under: section 6A(2) of the Housing Act 1988` | Checkbox | - | Section 6A(2) |
| `12. The (demotion) (suspension) claim is made under: section 121A of the Housing Act 1985` | Checkbox | - | Section 121A |

### Claimant Type

| PDF Field Name | Type | Maps to | Notes |
|----------------|------|---------|-------|
| `13. The claimant is a: local authority` | Checkbox | - | Local authority |
| `13. The claimant is a: housing action trust` | Checkbox | - | HAT |
| `13. The claimant is a: registered social landlord or a private registered provider of social housing` | Checkbox | - | RSL/PRP |
| `13. The claimant is - other` | Checkbox | - | Other (private landlord) |
| `13. Details if the claimant is some other entity` | Text | - | Details |

### Demotion Details

| PDF Field Name | Type | Maps to | Notes |
|----------------|------|---------|-------|
| `14. Has the claimant served on the tenant a statement of express terms of the tenancy which are to apply to the demoted tenancy? Yes` | Checkbox | - | Yes |
| `14. Has the claimant served on the tenant a statement of express terms of the tenancy which are to apply to the demoted tenancy? No` | Checkbox | - | No |
| `if the claimant served on the tenant a statement of express terms of the tenancy which are to apply to the demoted tenancy, please give details` | Text | - | Details |
| `15. The claimant is claiming demotion of tenancy` | Text | - | Demotion reasons |
| `15. The claimant is claiming an order suspending the right to buy 1` | Text | - | RTB suspension reason 1 |
| `15. The claimant is claiming an order suspending the right to buy 2` | Text | - | RTB suspension reason 2 |
| `details of the conduct alleged and any other matters relied upon` | Text | - | Conduct details |

### Statement of Truth

| PDF Field Name | Type | Maps to | Notes |
|----------------|------|---------|-------|
| `I believe that the facts stated in these particulars of claim are true` | Checkbox | - | Claimant signing |
| `The Claimant believes that the facts stated in these particulars of claim are true. I am authorised by the claimant to sign this statement` | Checkbox | - | Representative signing |
| `Statement of Truth signature box` | Text | - | Signature |
| `Statement of Truth signed by Claimant` | Checkbox | - | Claimant |
| `Statement of Truth signed by Litigation friend (where claimant is a child or a patient)` | Checkbox | - | Litigation friend |
| `Statement of Truth signed by Claimant's legal representative (as defined by CPR 2.3(1))` | Checkbox | - | Legal rep |
| `Date Statement of Truth is signed - DD` | Text | - | Day |
| `Date Statement of Truth is signed - MM` | Text | - | Month |
| `Date Statement of Truth is signed - YYYY` | Text | - | Year |
| `Full name of person signing the Statement of Truth` | Text | - | Signatory name |
| `Name of claimant's legal representative's firm` | Text | - | Law firm |
| `If signing on behalf of firm or company give position or office held` | Text | - | Position |

---

## N1 - Claim Form (N1_1224.pdf)

**Total fields: 43**

**⚠️ WARNING:** This form uses generic field names that don't describe their purpose. Field mapping will require manual inspection of the PDF to determine which field corresponds to which data point.

### Field List (Requires Manual Mapping)

The following fields exist but need to be manually mapped by visually inspecting the PDF:

**Text Fields:**
- `Text Field 48`, `Text Field 28`, `Text Field 12`, `Text Field 47`, `Text Field 46`, `Text Field 45`, `Text Field 44`
- `Text Field 10`, `Text Field 9`, `Text Field 8`, `Text Field 7`, `Text Field 6`, `Text Field 4`, `Text Field 3`, `Text Field 2`
- `Text21` through `Text38` (numbered sequentially)
- Note: `Text34` has max length 7 (likely postcode)
- Note: `Text37` has max length 3 (likely day/month)
- Note: `Text38` has max length 3 (likely day/month)

**Checkboxes:**
- `Check Box39` through `Check Box49` (11 checkboxes total)

**Next Steps for N1:**
1. Open N1_1224.pdf in Adobe Acrobat or similar
2. Enable "Highlight Existing Fields" to see field locations
3. Manually map each "Text Field N" and "Check Box N" to the visible form labels
4. Update this documentation with proper mappings
5. Update the fillN1Form() function

---

## Implementation Notes

### Recommended Approach

1. **Start with Form 6A and N5B**: These have excellent field names and are well-documented
2. **Then N5 and N119**: Good field names, medium complexity
3. **Finally N1**: Requires manual visual inspection to map generic field names

### Field Filling Best Practices

```typescript
function fillTextField(form: PDFForm, fieldName: string, value: string | undefined) {
  if (!value) return; // Don't fill empty values

  try {
    const field = form.getTextField(fieldName);
    field.setText(value);
  } catch (e) {
    console.warn(`Field '${fieldName}' not found or not a text field`);
  }
}

function fillCheckbox(form: PDFForm, fieldName: string, checked: boolean) {
  if (!checked) return; // Only check boxes when true

  try {
    const field = form.getCheckBox(fieldName);
    field.check();
  } catch (e) {
    console.warn(`Field '${fieldName}' not found or not a checkbox`);
  }
}
```

### Date Handling

Many forms split dates into separate DD/MM/YYYY fields. Use helper:

```typescript
function splitDate(dateString: string): { day: string; month: string; year: string } {
  const [year, month, day] = dateString.split('-'); // From YYYY-MM-DD format
  return { day, month, year };
}
```

### Name Splitting

Forms like N5B require separate first name and surname:

```typescript
function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(' ');
  const lastName = parts[parts.length - 1];
  const firstName = parts.slice(0, -1).join(' ');
  return { firstName, lastName };
}
```

---

## Testing Checklist

- [ ] Form 6A - Section 21 notice filled correctly
- [ ] N5B - All claimant/defendant fields populated
- [ ] N5B - AST verification checkboxes correct
- [ ] N5B - Deposit protection fields accurate
- [ ] N5B - HMO licensing fields correct
- [ ] N5 - Claim grounds checkboxes appropriate
- [ ] N5 - Service address fields complete
- [ ] N119 - Particulars of claim detailed
- [ ] N119 - Rent arrears calculated correctly
- [ ] N1 - Manual mapping completed
- [ ] N1 - All fields filled accurately

---

**Last Updated:** 2025-11-22
**Next Review:** After implementing N1 field mappings
