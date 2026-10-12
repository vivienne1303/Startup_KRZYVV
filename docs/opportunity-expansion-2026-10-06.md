# Opportunity expansion — 6 October 2026

Added 175 new records to the live catalogue, exceeding the requested 160 additions. The baseline contained 1,141 records; none of the 175 new IDs existed in that baseline. The import merged zero existing records. All 175 were read back from the database and confirmed published, visible through the browse filters, and without past deadlines.

| Source | New opportunities |
| --- | ---: |
| [InternSG](https://www.internsg.com/jobs/) | 90 Singapore internships |
| [Unstop](https://unstop.com/competitions) | 79 overseas student competitions and hackathons |
| [Devpost](https://devpost.com/hackathons) | 6 globally eligible hackathons |

Formats overlap with these source groups: 22 fully online, 30 hybrid, and 123 in person. Worldwide eligibility is recorded only where the organiser explicitly states it, subject to excluded countries and the organiser's other rules. Overseas hosting alone does not imply worldwide eligibility. Unknown student or country eligibility remains labelled unknown; applicants must review linked organiser requirements. Devpost legal-majority requirements use a conservative minimum age of 18; organiser rules take precedence where legal-majority ages differ.

Reviewed 226 candidate detail pages and excluded 51 for duplication, expiration or closed registration, fee conflicts, restricted participation, unsuitable internship requirements, or conflicting evidence. Internship browsing-page parameters were removed from canonical application URLs. Registration windows were not misrepresented as event dates. Local remote listings with an office address were conservatively classified as hybrid.

The dated manifest is `data/opportunities-expansion-2026-10-06.json`. Retained source evidence, rejection reasons, the baseline, the before-write backup, imported IDs, and live verification are under `output/expansion-2026-10-06/`. Preparation and verification scripts are dated and must not be replayed as fresh research on another date.

Validation: full manifest validation before writes; live duplicate check; read-back verification of all 175 inserted IDs; opportunity discovery and opportunity filter regression checks passed.
