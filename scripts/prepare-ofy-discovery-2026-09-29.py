"""Reproduce the manually reviewed OFY batch; never scrape claims into verified fields."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DAY = '2026-09-29'
OFY = 'https://opportunitiesforyouth.org/'
COURSES = OFY + '2026/09/26/18-free-sustainability-courses-from-unitar-online-un-courses-on-climate-action-sdgs-and-sustainable-development-free-certificate-self-paced-online/'
rows = []

def add(title, organisation, category, description, source, discovered, **kw):
    evidence = kw.pop('evidence', {})
    row = dict(title=title, organisation=organisation, category=category, categories=[category],
               description=description, eligibility=None, minimum_age=None, maximum_age=None,
               education_levels=[], application_deadline=None, start_date=None, end_date=None,
               source_url=source, application_url=None, host_country=None, location=None,
               format=None, eligibility_scope='unknown', eligible_countries=[], travel_required=None,
               source_type='ai_fetched', source_name='Opportunities for Youth',
               application_method='external', internal_application_enabled=False)
    row.update(kw)
    row['discovery'] = dict(deadline_status='unknown', student_eligibility='unknown',
        application_access='unknown', discovered_url=discovered, official_url=source,
        last_checked_at=DAY, fees=None, parental_consent=None,
        school_membership=None, restrictions=None, notes=None)
    row['discovery'].update(evidence)
    rows.append(row)

add('Yale Young Global Scholars 2027', 'Yale University', 'Academic Programmes',
    'Two-week residential academic programme. Early Action closes 15 October 2026; Regular Decision closes 6 January 2027, both at 11:59pm Eastern Time.',
    'https://globalscholars.yale.edu/eligibility',
    OFY+'2026/09/18/yale-young-global-scholars-program-2024-for-high-school-students-worldwide-scholarships-and-financial-aid-available/',
    minimum_age=16, maximum_age=18, education_levels=['Secondary school'],
    application_deadline='2027-01-06', application_url='https://apply.globalscholars.yale.edu/apply/',
    host_country='US', location='New Haven, Connecticut, United States', format='in_person',
    eligibility_scope='worldwide', travel_required=True,
    eligibility='Age 16–18 on 18 July 2027; current sophomore/junior or equivalent; specified 2027–2029 graduation cohorts; English fluency; first-time participants. All countries eligible.',
    evidence=dict(deadline_status='confirmed', student_eligibility='confirmed', application_access='login_required',
        fees='US$7,500 tuition, plus travel. Application: US$85 Early Action or US$100 Regular Decision. Need-based tuition aid and application fee waivers available.',
        notes='Check graduation-cohort requirements on the source page. Login/register portal loaded; no application submitted.',
        evidence_urls=['https://globalscholars.yale.edu/application-deadlines','https://globalscholars.yale.edu/tuition','https://apply.globalscholars.yale.edu/apply/']))

add('Hansen Leadership Institute 2027', 'Hansen Leadership Institute', 'Fellowships',
    'Leadership and peacebuilding programme, 29 June–20 July 2027. International deadline: 15 January; US deadline: 15 March 2027, both 11:55pm Pacific Time.',
    'https://hansenleadershipinstitute.org/apply-now/',
    OFY+'2026/09/27/hansen-leadership-institute-fellowship-program-2024-in-usa-fully-funded-and-open-to-us-and-non-usa-citizens/',
    minimum_age=20, maximum_age=25, education_levels=['University'], application_deadline='2027-03-15',
    start_date='2027-06-29', end_date='2027-07-20', application_url='https://hansenleadershipinstitute.awardsplatform.com/',
    host_country='US', location='San Diego, United States', format='in_person', travel_required=True,
    eligibility='Age 20–25 on 1 July 2027; at least one university year completed. Non-enrolled applicants must be 2025/2026 graduates. Academic referee verifies English. Full attendance required. US and international routes have different deadlines; country-specific rules not confirmed.',
    evidence=dict(deadline_status='confirmed', student_eligibility='confirmed', application_access='unknown',
        fees='Airfare, accommodation, meals and programme funded. Passport and personal spending remain the participant’s responsibility.',
        notes='Application platform returned a JavaScript shell, so form access is not confirmed. International applicants must use the earlier 15 January deadline.',
        evidence_urls=['https://hansenleadershipinstitute.org/faq/']))

add('Oxford Farming Conference Breaking Barriers 2027', 'Oxford Farming Conference', 'Fellowships',
    'Eight funded places for people facing barriers to entering food and agriculture. Includes UK gatherings and the January 2027 conference.',
    'https://www.ofc.org.uk/scholarship-programme',
    OFY+'2026/09/28/oxford-farming-conference-scholars-programme-2027-1000-fully-funded-opportunity-for-young-people-under-30/',
    minimum_age=18, application_deadline='2026-10-16',
    application_url='https://www.ofc.org.uk/form/breaking-barriers-2027-applicati',
    host_country='GB', location='Oxford, London and Shropshire, United Kingdom', format='hybrid', travel_required=True,
    eligibility_scope='countries', eligible_countries=['GB'],
    eligibility='UK residents facing barriers in food/agriculture. No current sector employment or study required. Full programme attendance required. Upper age limit needs clarification: page says both under 30 and 18–30.',
    evidence=dict(deadline_status='confirmed', student_eligibility='unknown', application_access='available',
        fees='Breaking Barriers has eight fully funded places; travel coverage not confirmed. The separate standard Scholars route costs the sponsor £1,000 plus VAT and excludes travel.',
        notes='Breaking Barriers deadline: 16 October 2026 at 5pm. Use its direct form. Standard Scholars text elsewhere on the page has a conflicting deadline year; that separate route is not imported.'))

girl = OFY+'2026/09/24/rise-to-lead-girl-up-2026-global-leadership-summit-join-young-leaders-worldwide-for-a-virtual-gender-justice-summit/'
add('Rise to Lead: Girl Up Global Leadership Summit 2026', 'Girl Up', 'Conferences',
    'Youth leadership and gender-justice summit lead from Opportunities for Youth. Organiser details still need confirmation.',
    girl, girl, application_url='https://us02web.zoom.us/webinar/register/WN_wzlX8vwqQkKnc6zTcswyuQ',
    evidence=dict(official_url=None, application_access='unavailable',
        notes='The linked Zoom registration could not be loaded during this check. OFY reports an online event on 10 October 2026 for ages 13–24; these are unconfirmed claims, not verified eligibility or an application deadline.',
        claims={'event_date':'2026-10-10','minimum_age':13,'maximum_age':24,'format':'online'}))

for title, ident, slug, desc, eligible in [
    ('Introduction to Sports for Climate Action',214,'introduction-to-sports-for-climate-action',
     'Introductory self-paced course on sport and climate, approximately 1.5 hours.', 'Designed for sports professionals and the interested general public. Minimum age, school membership and country eligibility not specified.'),
    ('Developing Skills for Women Leadership in Climate Action',189,'developing-skills-for-women-leadership-in-climate-action',
     'Self-paced course to help women and girls develop climate leadership skills; approximately nine hours plus a practical exercise.', 'Designed for women and girls starting their climate journey. Exact minimum age, school membership and country eligibility not specified.'),
    ('Mastering International Climate Negotiations',206,'mastering-international-climate-negotiations-all-you-need-to-know',
     'Introductory self-paced course about the UNFCCC process, approximately 3.5 hours.', 'Designed especially for youth negotiators and youth organisations, and other interested learners. Exact age and country eligibility not specified.')]:
    course=f'https://unccelearn.org/course/view.php?id={ident}&page=overview'
    add(title,'UNITAR / UN CC:Learn','Online Courses',desc,course,COURSES,
        application_url=course, format='online',location='Online',travel_required=False,eligibility=eligible,
        evidence=dict(student_eligibility='confirmed' if ident in [189,206] else 'unknown',application_access='login_required',
            fees='Course learning is listed as free by UN SDG:Learn; digital certificate costs US$30 on the current course platform.',
            notes='Self-paced course and enrolment login loaded. No explicit closing date or rolling-admissions statement found; deadline remains unknown. Country eligibility remains unspecified.',
            evidence_urls=[f'https://www.unsdglearn.org/courses/{slug}/','https://unccelearn.org/login/index.php']))

add('UNICEF Internship Programme — vacancy discovery', 'UNICEF', 'Internships',
    'Programme directory for student and graduate internships. Individual vacancies have their own deadlines and restrictions; this is not a single confirmed open placement.',
    'https://www.unicef.org/careers/internships',
    OFY+'2026/05/25/unicef-internship-programme-2021-fully-funded-internships/',
    minimum_age=18, education_levels=['University'],
    application_url='https://jobs.unicef.org/en-us/filter/?search-keyword=&work-type=internship',
    eligibility='18+; enrolled undergraduate/postgraduate/PhD or graduated within two years. Relevant language proficiency and strong academics required. Immediate relatives at UNICEF or relatives in the reporting line disqualify. Country, work authorisation and education restrictions vary by vacancy.',
    evidence=dict(student_eligibility='confirmed',application_access='unknown',
        fees='Monthly stipend; travel/visa contribution may be available. Applicant fees not confirmed in the reviewed page.',
        notes='Vacancy directory loaded. A specific placement and its application form were not verified. Year-round vacancy advertising does not mean every vacancy has rolling applications.'))

add('FAO Internship Programme — Asia and the Pacific call', 'Food and Agriculture Organization of the United Nations', 'Internships',
    'Regional internship call discovered through OFY. General programme eligibility is confirmed; the linked vacancy’s deadline and form are not.',
    'https://www.fao.org/employment/young-talent-programme/internship-programme/en',
    OFY+'2026/09/28/internship-opportunities-at-united-nations-fao-italy-2022fully-funded/',
    minimum_age=21,maximum_age=30,education_levels=['University'],
    application_url='https://jobs.fao.org/careersection/fao_external/jobdetail.ftl?job=2601981&tz=GMT%2B01%3A00&tzname=Europe%2FLondon',
    eligibility='FAO-member nationals, age 21–30 at start; university students or recent graduates; one FAO language; appropriate residence/immigration status at the assignment location. Immediate family employed by FAO disqualifies. Member-country list has not been mapped to country filters.',
    evidence=dict(student_eligibility='confirmed',application_access='unavailable',
        notes='Vacancy 2601981 could not be loaded. OFY’s 31 December 2026 closing date remains an unverified claim; deadline is stored as null.',
        claims={'application_deadline':'2026-12-31'}))

add('beVisioneers: The Mercedes-Benz Fellowship — 2027 lead', 'The DO School Fellowships', 'Fellowships',
    'Environmental project fellowship lead. The linked official portal shows an older 2026/27 round, so the advertised 2027 cohort needs checking.',
    'https://applications.bevisioneers.world/courses/course/11-bevisioneers-mercedes-benz-fellowship',
    OFY+'2026/09/21/apply-now-for-the-bevisioneers-the-mercedes-benz-fellowship/',
    application_url='https://applications.bevisioneers.world/courses/course/11-bevisioneers-mercedes-benz-fellowship',
    evidence=dict(application_access='unknown',
        notes='Official page and OFY disagree on cohort and age rules. Do not reuse the old round’s country list, dates or funding for 2027. Keep deadline, age, country eligibility and current application access unknown.'))

manifest=dict(as_of=DAY, discovery_source=OFY, additions=rows,
    review_notes=['No applications submitted or accounts created.',
                  'Existing local listings checked; live duplicate check required before writes.',
                  'Professional jobs, institutional grants and PhD-only advertisements omitted from this student-focused batch.'])
(ROOT/'data/opportunities-ofy-2026-09-29.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'Prepared {len(rows)} reviewed discovery records.')
