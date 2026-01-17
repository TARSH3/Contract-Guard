# Sample Contracts for Testing ContractGuard

This document contains sample contract text that you can use to test ContractGuard's analysis capabilities. Convert these to PDF format for testing.

## 1. High-Risk Employment Contract

**Expected Risk Score:** 80-90 (High Risk)
**Expected Recommendation:** "Avoid signing"

```
EMPLOYMENT AGREEMENT

This Employment Agreement is entered into between MegaCorp Industries ("Company") and [Employee Name] ("Employee").

EMPLOYMENT TERMS:

1. TERM OF EMPLOYMENT
This agreement commences on the start date and continues for an initial term of three (3) years. The agreement automatically renews for successive two-year periods unless either party provides one hundred twenty (120) days written notice prior to expiration.

2. COMPENSATION
Base salary of $65,000 annually, subject to Company's discretionary bonus program.

3. TERMINATION PROVISIONS
Employee may terminate this agreement with sixty (60) days notice. Early termination by Employee without cause shall result in liquidated damages equal to six (6) months base salary plus recruitment costs not to exceed $15,000.

4. NON-COMPETE AND NON-SOLICITATION
Employee agrees not to:
- Engage in competing business within 100-mile radius for 24 months post-employment
- Solicit Company customers for 36 months
- Recruit Company employees for 24 months
- Use or disclose any confidential information

5. DISPUTE RESOLUTION
All disputes must be resolved through binding arbitration administered by the American Arbitration Association. Employee waives all rights to jury trial and class action participation.

6. ADDITIONAL OBLIGATIONS
Employee shall reimburse Company for:
- Training costs if employment terminates within 18 months ($5,000)
- Equipment replacement costs
- Administrative processing fees
- Professional development expenses

7. INTELLECTUAL PROPERTY
All work product, ideas, inventions, and improvements created during employment belong exclusively to Company, including work done outside business hours or using personal resources.

8. MODIFICATION
Company reserves the right to modify terms with 30 days notice. Continued employment constitutes acceptance of modifications.

Employee Signature: _________________ Date: _________
```

## 2. Medium-Risk Service Agreement

**Expected Risk Score:** 50-65 (Medium Risk)
**Expected Recommendation:** "Review carefully"

```
PROFESSIONAL SERVICES AGREEMENT

This Agreement is between ServicePro LLC ("Provider") and [Client Name] ("Client").

SERVICE TERMS:

1. SCOPE OF SERVICES
Provider will deliver marketing consulting services as outlined in attached Statement of Work.

2. TERM AND RENEWAL
Initial term of 12 months beginning on effective date. Agreement automatically renews for additional 12-month terms unless either party provides 90 days written notice.

3. PAYMENT TERMS
Monthly fee of $3,500 due within 15 days of invoice date. Late payments subject to 1.5% monthly service charge.

4. TERMINATION
Either party may terminate with 60 days notice. Client terminating without cause shall pay 50% of remaining contract value as cancellation fee.

5. LIABILITY LIMITATIONS
Provider's total liability shall not exceed the total fees paid under this agreement. Provider excludes liability for consequential, indirect, or punitive damages.

6. DISPUTE RESOLUTION
Disputes shall be resolved through mediation, and if unsuccessful, binding arbitration under AAA Commercial Rules.

7. CONFIDENTIALITY
Both parties agree to maintain confidentiality of proprietary information for 3 years post-termination.

8. ADDITIONAL CHARGES
Client responsible for:
- Third-party software licenses
- Travel expenses exceeding $500/month
- Rush delivery fees (25% surcharge)
- Revision fees beyond 3 rounds per deliverable

Client Signature: _________________ Date: _________
```

## 3. Low-Risk Rental Agreement

**Expected Risk Score:** 25-35 (Low Risk)
**Expected Recommendation:** "Safe to sign"

```
RESIDENTIAL LEASE AGREEMENT

This Lease Agreement is between [Landlord Name] ("Landlord") and [Tenant Name] ("Tenant").

LEASE TERMS:

1. PROPERTY
Tenant agrees to lease the property located at [Address] for residential purposes only.

2. TERM
Lease term is 12 months, beginning [Start Date] and ending [End Date]. No automatic renewal.

3. RENT
Monthly rent of $1,200 due on the 1st of each month. Grace period of 5 days before late fee of $50 applies.

4. SECURITY DEPOSIT
Security deposit of $1,200 held for damages beyond normal wear and tear. Deposit returned within 30 days of lease termination.

5. TERMINATION
Either party may terminate with 30 days written notice. No penalty for early termination with proper notice.

6. MAINTENANCE
Landlord responsible for major repairs and maintenance. Tenant responsible for minor maintenance and utilities.

7. PETS
One pet allowed with additional $200 deposit and $25/month pet fee.

8. DISPUTE RESOLUTION
Disputes resolved according to state landlord-tenant laws. Either party may pursue remedies in small claims court.

Tenant Signature: _________________ Date: _________
Landlord Signature: _________________ Date: _________
```

## 4. Subscription Service Agreement (Auto-Renewal Focus)

**Expected Risk Score:** 45-55 (Medium Risk)
**Expected Recommendation:** "Review carefully"

```
SOFTWARE SUBSCRIPTION AGREEMENT

This Agreement governs your use of CloudSoft Pro services.

SUBSCRIPTION TERMS:

1. SERVICE DESCRIPTION
Access to CloudSoft Pro platform including 100GB storage, premium features, and priority support.

2. SUBSCRIPTION PERIOD
Initial term of 24 months at promotional rate of $29/month. After initial term, subscription automatically continues at standard rate of $49/month for successive 12-month periods unless cancelled.

3. PAYMENT
Subscription fees charged automatically to provided payment method. Price changes with 60 days notice.

4. CANCELLATION
Subscription may be cancelled anytime through account settings. Cancellation effective at end of current billing period. No refunds for partial periods.

5. DATA RETENTION
Upon cancellation, data retained for 90 days then permanently deleted. Data export available for additional $99 fee.

6. SERVICE MODIFICATIONS
We may modify, suspend, or discontinue services with 30 days notice. No compensation for service changes.

7. LIABILITY
Service provided "as-is" without warranties. Our liability limited to subscription fees paid in preceding 12 months.

By clicking "Accept" you agree to these terms.
```

## 5. Freelance Contract (Non-Compete Heavy)

**Expected Risk Score:** 70-80 (High Risk)
**Expected Recommendation:** "Avoid signing"

```
INDEPENDENT CONTRACTOR AGREEMENT

This Agreement is between TechStart Inc. ("Company") and [Contractor Name] ("Contractor").

PROJECT TERMS:

1. SERVICES
Contractor will provide web development services for Company's e-commerce platform.

2. COMPENSATION
Fixed fee of $15,000 payable upon project completion and acceptance.

3. TIMELINE
Project completion within 8 weeks. Delays beyond Contractor's control may extend timeline.

4. NON-COMPETE RESTRICTIONS
During project term and for 18 months thereafter, Contractor shall not:
- Work for any e-commerce company
- Develop competing platforms or applications
- Provide services to Company's competitors
- Use similar technologies for other clients

5. INTELLECTUAL PROPERTY
All code, designs, and work product become Company's exclusive property. Contractor assigns all rights and cannot reuse any components.

6. CONFIDENTIALITY
Contractor must maintain strict confidentiality of all Company information for 5 years.

7. TERMINATION
Company may terminate for any reason with 7 days notice. Contractor only paid for completed milestones.

8. DISPUTE RESOLUTION
All disputes resolved through binding arbitration. Contractor responsible for arbitration costs if Company prevails.

Contractor Signature: _________________ Date: _________
```

## How to Use These Samples

1. **Copy the contract text** from any section above
2. **Create a PDF file:**
   - Paste text into Microsoft Word or Google Docs
   - Format as needed
   - Export/Save as PDF
3. **Upload to ContractGuard** for analysis
4. **Compare results** with expected risk scores and recommendations

## Expected Analysis Features to Test

When testing these contracts, verify that ContractGuard detects:

### High-Risk Clauses
- ✅ Auto-renewal terms
- ✅ Early termination penalties
- ✅ Broad non-compete restrictions
- ✅ Mandatory arbitration
- ✅ Liability limitations
- ✅ Hidden fees and charges

### Risk Scoring Accuracy
- ✅ High-risk contracts score 70+
- ✅ Medium-risk contracts score 40-69
- ✅ Low-risk contracts score below 40

### Plain Language Explanations
- ✅ Complex legal terms explained simply
- ✅ Specific risks identified for each clause
- ✅ Negotiation tips provided

### Recommendations
- ✅ "Avoid signing" for high-risk contracts
- ✅ "Review carefully" for medium-risk contracts
- ✅ "Safe to sign" for low-risk contracts

## Creating Your Own Test Contracts

To create additional test contracts:

1. **Start with a basic template** (employment, service, rental, etc.)
2. **Add risky clauses** from the patterns below:
   - Auto-renewal: "automatically renews unless 90 days notice"
   - Penalties: "early termination fee of X months salary"
   - Non-compete: "shall not compete within X miles for X months"
   - Arbitration: "disputes resolved through binding arbitration"
   - Hidden fees: "additional charges may apply"
3. **Convert to PDF** and test
4. **Verify detection** of added risky clauses

This comprehensive testing approach ensures ContractGuard accurately identifies and explains contract risks across various document types and risk levels.