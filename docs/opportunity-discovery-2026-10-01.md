# Opportunity discovery — 1 October 2026

923 student/youth opportunities were researched, validated and **published to the live database** on 1 October 2026 (12 manifests in `data/opportunities-*-2026-10-01.json`). Each import ran `node scripts/import-ofy-discovery.js --manifest=<file> --apply`, which snapshotted live rows (`output/<batch>/before-*.json`), re-checked all live listings for duplicates and wrote `output/<batch>/applied.json`. Zero merges were needed.

| Manifest | Count | Official source of evidence | Filters applied |
| --- | --- | --- | --- |
| `mlh-hackathons` | 39 | Each hackathon's own website (MLH 2027 season list for discovery) | Registration open or officially announced; events starting within 2 days without an open deadline excluded |
| `devpost-student-hackathons` | 91 | Each Devpost hackathon page ("Who can participate", submission deadline) | Student-only, high-school, 13–19 age bands or school/university hosts; invite-only, closed and already-listed events excluded |
| `devpost-open-hackathons` | 22 | Devpost hackathon pages | Open to the public (18+/age of majority); marked `student_eligibility: unknown`; professionals-only and company-required events excluded |
| `devfolio-hackathons` | 20 | Organiser Devfolio data (registration close, FAQ eligibility) | Applications open |
| `hackclub-teen` | 32 | Hack Club YSWS catalog + each programme/event site (all loaded) | Active programmes for ages 13–18 and Hack Club-listed high school hackathons |
| `nyc-events` | 74 | Discover NYC event pages (registration close, slots, cost) | Registration closes on/after 1 Oct; full events and adult-oriented events (dating night, bar event) excluded |
| `nyc-civic` | 2 | Discover NYC listings + public roles API | Roles still open |
| `careers-gov-internships` | 84 | Careers@Gov job postings | Open internships; GRIT/career-conversion traineeships and existing CAAS/Youth Corps listings excluded |
| `mcf-internships`, `mcf-internships-2` | 92 + 136 | MyCareersFuture postings made directly by the employer | Internship/Attachment type, student wording, open; recruitment agencies, agent-recruitment "internships", GRIT and sales/MLM-style roles excluded |
| `unstop-institution-competitions` | 125 | Organiser listings on Unstop | Online, free, run by universities/colleges/schools, open to external students; India-wide events tagged `IN` |
| `unstop-campus-events` | 206 | Organiser listings on Unstop | In-person inter-college events in India (`travel_required: true`) and online institution workshops/conferences/scholarships; free, open to external students |

## Sorting into existing filters

Every record sets `category` from the existing set (Hackathons, Internships, Competitions, Career Exploration, Community Events, Workshops, Mentorship, Volunteering, Conferences, Grants), `format` (online/in_person/hybrid), `host_country`, and `eligibility_scope`/`eligible_countries` only where the organiser states it. Age bands come from stated minimum/maximum ages. Checked with `browse()` on the live rows: all 923 are visible; 87 appear under Global opportunities, 88 under Singapore eligibility, 702 physical and 225 online. 676 are labelled "Open now"; the rest carry "Check eligibility", "Check deadline" or "Check application link" where evidence was incomplete.

## Evidence rules

- Deadlines are the organiser's stated registration/application close; Devpost uses the official submission deadline. Unknown deadlines stay null (`deadline_status: unknown`); Hack Club "indefinite" programmes are `rolling`.
- Application routes on Devpost, Devfolio, Unstop, Discover NYC, Careers@Gov and MyCareersFuture require a login (`application_access: login_required`). No forms were submitted and no accounts were created.
- Fees, team sizes, allowances, parental consent and residency limits are recorded when stated. Citizenship/residency is otherwise left unspecified; a venue never implies eligibility.

## Post-import cleanup

Three cross-platform duplicates were unpublished (`is_published = false`, rows retained): the IIT Mandi Multimodal AI Hackathon and Sharda Sustain-A-Thon 2.0 (Unstop copies of Devpost listings) and a second identical Case Union 4.0 posting. Six Careers@Gov titles were clarified where an agency posted distinct roles under the same name. The manifests reflect these changes.

## Not covered

Volunteer.gov.sg, NLB GoLibrary, onePA and UN Volunteers block automated access (bot protection or authenticated APIs), so no new listings came from them. All records are dated 2026-10-01; the importer refuses to re-apply them on another day without re-verification.

## Card text shortened

After publishing, the card fields `eligibility`, `discovery.restrictions` and `discovery.notes` on these 926 rows (923 published) were cut to one sentence each (average 435 → 102 characters). Category, dates, ages, education levels, location and filter fields were not changed. The manifests keep the full research text.

Descriptions on the same rows were then trimmed to one sentence (average 266 → 109 characters). Where the first sentence was a slogan or company boilerplate, the sentence was built from fields already on the listing: MyCareersFuture (role, employer, allowance), Unstop (format, host, festival, top prize), Devpost (themes, submission deadline) and Devfolio (format, dates, team size).
