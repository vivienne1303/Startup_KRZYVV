from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from reportlab.platypus import (
    BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, PageBreak,
    KeepTogether, Table, TableStyle, ListFlowable, ListItem
)

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "TeenLaunch-User-Manual.pdf"
OUTPUT.parent.mkdir(parents=True, exist_ok=True)

FONT = "Helvetica"
BOLD = "Helvetica-Bold"
for name, path in {
    "Inter": Path("C:/Windows/Fonts/arial.ttf"),
    "Inter-Bold": Path("C:/Windows/Fonts/arialbd.ttf"),
}.items():
    if path.exists():
        pdfmetrics.registerFont(TTFont(name, str(path)))
        if name == "Inter": FONT = name
        else: BOLD = name

NAVY = colors.HexColor("#07184F")
BLUE = colors.HexColor("#1978F2")
CYAN = colors.HexColor("#25A9F3")
INK = colors.HexColor("#243E68")
MUTED = colors.HexColor("#526B91")
PALE = colors.HexColor("#EEF8FF")
LINE = colors.HexColor("#C8DFF3")
WHITE = colors.white
RED = colors.HexColor("#9B2727")

styles = getSampleStyleSheet()
body = ParagraphStyle("ManualBody", fontName=FONT, fontSize=10.2, leading=14.4,
                      textColor=INK, spaceAfter=7)
h1 = ParagraphStyle("ManualH1", fontName=BOLD, fontSize=23, leading=27,
                    textColor=NAVY, spaceBefore=3, spaceAfter=13, keepWithNext=True)
h2 = ParagraphStyle("ManualH2", fontName=BOLD, fontSize=14, leading=17,
                    textColor=NAVY, spaceBefore=9, spaceAfter=6, keepWithNext=True)
h3 = ParagraphStyle("ManualH3", fontName=BOLD, fontSize=11.2, leading=14,
                    textColor=BLUE, spaceBefore=6, spaceAfter=3, keepWithNext=True)
eyebrow = ParagraphStyle("Eyebrow", fontName=BOLD, fontSize=8.5, leading=11,
                         textColor=CYAN, tracking=1.8, spaceAfter=5)
small = ParagraphStyle("Small", parent=body, fontSize=8.5, leading=11, textColor=MUTED)
center = ParagraphStyle("Center", parent=body, alignment=TA_CENTER)
cover_title = ParagraphStyle("CoverTitle", fontName=BOLD, fontSize=38, leading=42,
                              textColor=NAVY, alignment=TA_CENTER, spaceAfter=10)
cover_sub = ParagraphStyle("CoverSub", fontName=FONT, fontSize=15, leading=21,
                            textColor=INK, alignment=TA_CENTER)
step_title = ParagraphStyle("StepTitle", fontName=BOLD, fontSize=11, leading=14,
                            textColor=NAVY, spaceAfter=2)


def p(text, style=body):
    return Paragraph(text, style)


def bullets(items):
    return ListFlowable(
        [ListItem(p(item), leftIndent=0) for item in items],
        bulletType="bullet", start="circle", leftIndent=16, bulletFontName=FONT,
        bulletFontSize=7, bulletColor=BLUE, spaceAfter=5,
    )


def steps(items):
    rows = []
    for number, (title, text) in enumerate(items, 1):
        badge = p(f"<b>{number}</b>", ParagraphStyle(
            f"badge{number}", parent=center, fontName=BOLD, fontSize=11,
            textColor=WHITE, leading=18,
        ))
        content = [p(title, step_title), p(text)]
        rows.append([badge, content])
    table = Table(rows, colWidths=[12*mm, 155*mm], hAlign="LEFT")
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), BLUE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ALIGN", (0, 0), (0, -1), "CENTER"),
        ("LEFTPADDING", (0, 0), (0, -1), 3),
        ("RIGHTPADDING", (0, 0), (0, -1), 3),
        ("TOPPADDING", (0, 0), (0, -1), 6),
        ("BOTTOMPADDING", (0, 0), (0, -1), 6),
        ("LEFTPADDING", (1, 0), (1, -1), 10),
        ("RIGHTPADDING", (1, 0), (1, -1), 0),
        ("TOPPADDING", (1, 0), (1, -1), 0),
        ("BOTTOMPADDING", (1, 0), (1, -1), 8),
        ("ROUNDEDCORNERS", [6]),
    ]))
    return table


def callout(label, text, color=BLUE):
    t = Table([[p(label.upper(), ParagraphStyle("CalloutLabel", parent=eyebrow, textColor=color)),
                p(text, body)]], colWidths=[33*mm, 134*mm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PALE),
        ("BOX", (0, 0), (-1, -1), 0.8, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    return t


def data_table(headers, rows, widths):
    data = [[p(f"<b>{x}</b>", small) for x in headers]]
    data += [[p(str(x), small) for x in row] for row in rows]
    t = Table(data, colWidths=widths, repeatRows=1, hAlign="LEFT")
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#DCEEFF")),
        ("TEXTCOLOR", (0, 0), (-1, 0), NAVY),
        ("GRID", (0, 0), (-1, -1), 0.55, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    return t


class ManualDoc(BaseDocTemplate):
    def __init__(self, filename):
        super().__init__(filename, pagesize=A4, leftMargin=20*mm, rightMargin=20*mm,
                         topMargin=20*mm, bottomMargin=18*mm,
                         title="TeenLaunch User Manual",
                         author="TeenLaunch",
                         subject="Updated user guide for TeenLaunch")
        frame = Frame(self.leftMargin, self.bottomMargin, self.width, self.height, id="main")
        self.addPageTemplates(PageTemplate(id="manual", frames=frame, onPage=self.decorate))

    def decorate(self, canvas, doc):
        canvas.saveState()
        if doc.page > 1:
            canvas.setFillColor(NAVY)
            canvas.rect(0, A4[1] - 9*mm, A4[0], 9*mm, fill=1, stroke=0)
            canvas.setFont(BOLD, 7.5)
            canvas.setFillColor(WHITE)
            canvas.drawString(20*mm, A4[1] - 6*mm, "TEENLAUNCH USER MANUAL - AUGUST 2026")
        canvas.setStrokeColor(LINE)
        canvas.line(20*mm, 12*mm, A4[0]-20*mm, 12*mm)
        canvas.setFont(FONT, 8)
        canvas.setFillColor(MUTED)
        canvas.drawString(20*mm, 7.5*mm, "vivienne@teenlaunch.app")
        canvas.drawRightString(A4[0]-20*mm, 7.5*mm, f"Page {doc.page}")
        canvas.restoreState()


story = []

# Cover
story += [Spacer(1, 23*mm), p("TEENLAUNCH", ParagraphStyle("CoverEyebrow", parent=eyebrow, alignment=TA_CENTER, fontSize=12)),
          p("USER MANUAL", cover_title),
          p("Discover opportunities. Build skills. Plan your next move.", cover_sub),
          Spacer(1, 18*mm),
          callout("Updated edition", "August 2026 - includes persistent sign-in, improved mobile navigation, saved reminders, planner confirmations, XP tiers, experience posts, inbox improvements, and expanded Chinese interface."),
          Spacer(1, 15*mm),
          p("AUDIENCE", ParagraphStyle("AudienceLabel", parent=eyebrow, alignment=TA_CENTER)),
          p("Students aged 10-24, parents, educators, partners, and administrators", center),
          Spacer(1, 8*mm), p("Support: <b>vivienne@teenlaunch.app</b>", center), PageBreak()]

# Welcome + What's new
story += [p("1. Welcome to TeenLaunch", h1),
          p("TeenLaunch is a youth-focused platform for discovering opportunities, building career awareness, practising future-ready skills, planning goals, connecting with peers, and presenting achievements. Public pages can be browsed without an account; personalised and record-keeping features require sign-in."),
          callout("Important", "Always confirm deadlines, fees, eligibility, safeguarding arrangements, and application requirements with the official organiser."),
          p("What you can do", h2), bullets([
              "Browse and filter opportunities, competitions, resources, and skills content.",
              "Complete Career DNA and explore personalised recommendations.",
              "Save opportunities, set competition reminders, and submit supported applications.",
              "Plan weekly tasks, deadlines, repeat schedules, and planning preferences.",
              "Use Career Copilot, the AI guide, resources, and debate practice.",
              "Connect with members, exchange messages, and review notifications.",
              "Build a public portfolio and add photo-based experience posts.",
              "Earn XP, maintain a streak, and unlock progress tiers.",
              "Submit opportunities as a partner for administrator review.",
          ]),
          p("What's new in this edition", h2), bullets([
              "Sign-in is retained across normal page changes and temporary connection interruptions, so users are not repeatedly prompted to log in.",
              "The mobile navigation stays available while scrolling and its category dropdowns open without closing the menu.",
              "Competition reminders persist after refresh in the same browser.",
              "Life Planner gives a clear success message after adding a task and provides side-by-side week arrows.",
              "Experience posts can be opened for a larger, readable view.",
              "The mobile inbox, forms, showcase, typography, and bilingual interface have been improved.",
          ]), PageBreak()]

# Quick start
story += [p("2. Quick start", h1), p("Follow this route to get useful results in about ten minutes."),
          steps([
              ("Sign in once", "Select Login and register if you are new. TeenLaunch keeps a valid session while you move between protected pages. Use Logout when you intentionally want to end it."),
              ("Complete your profile", "Open My Profile or Settings > Edit Profile. Accurate age and education details help eligibility checks and recommendations."),
              ("Complete Career DNA", "Answer honestly; there are no correct answers. Your result supports recommendations and can be retaken from Settings."),
              ("Find an opportunity", "Search by keyword or category, then open Details. Check deadline, eligibility, location, format, organiser, and source."),
              ("Save, remind, or apply", "Save bookmarks an item. Set Reminder adds a competition deadline to your reminder list. Apply starts the actual application flow."),
              ("Plan the next action", "Add a task in Life Planner, choose a deadline and repeat setting, then confirm that the task-added message appears."),
              ("Record your progress", "Add a reflection, project, or experience post to your profile or portfolio. Each experience post currently earns 5 XP."),
          ]), Spacer(1, 5*mm),
          callout("Mobile tip", "The navigation bar stays at the top while you scroll. Tap the hamburger button, then tap Opportunities or Competitions to reveal their subpages. Tap a destination only when you want to navigate away."), PageBreak()]

# Opportunities
story += [p("3. Opportunities, competitions, and reminders", h1),
          p("Search and filters", h2), bullets([
              "Use specific keywords such as design, internship, public speaking, or startup.",
              "Combine category filters with age, mode, deadline, or level filters where available.",
              "Use Recommended Opportunities after completing Career DNA.",
              "Treat match percentages as guidance, not acceptance predictions.",
          ]),
          p("Read the detail page", h2),
          data_table(["Check", "Why it matters"], [
              ("Deadline", "Allow time for documents, consent, and external forms."),
              ("Eligibility", "Confirm age, education level, residency, and prerequisites."),
              ("Format and location", "Plan travel, time zone, device, and accessibility needs."),
              ("Source and organiser", "Confirm identity, official website, fees, and safeguarding details."),
              ("Outcome", "Know what you will learn, submit, receive, or be assessed on."),
          ], [42*mm, 125*mm]),
          p("Save, reminder, and application actions", h2), bullets([
              "Save bookmarks an opportunity; it does not submit an application.",
              "Set Reminder adds the competition to Your List and keeps it after refresh in the same browser and device.",
              "Apply opens TeenLaunch's application flow or the organiser's official page.",
              "A submission is complete only after TeenLaunch or the organiser confirms receipt.",
          ]),
          callout("If a reminder is missing", "Return to the same browser and device where it was created. Clearing browser storage, using private browsing, or changing devices can remove locally stored reminders."),
          Spacer(1, 4*mm), callout("Safety check", "Stop if anyone asks for a password, one-time code, secret payment, or unnecessary identity information. Verify the organiser independently and tell a trusted adult if anything feels wrong.", RED), PageBreak()]

# Planner + tools
story += [p("4. Life Planner and growth tools", h1),
          p("Life Planner", h2),
          steps([
              ("Choose the week", "Use the left and right arrow buttons placed side by side. The date range updates above them."),
              ("Review settings", "This Week and Planning Preferences appear below the arrows. Use preferences to shape how you plan."),
              ("Add a task", "Enter a title, deadline, time needed, and repeat option, then select Add task."),
              ("Check confirmation", "A success message confirms where the task was added. If an error appears, keep the information on screen and retry after checking your connection."),
              ("Review deadlines", "Linked opportunity deadlines appear automatically when supported saved or applied opportunities are available."),
          ]),
          p("Career DNA", h2), p("Career DNA highlights patterns in your interests and working style. It is an exploration aid, not a diagnosis or fixed label."),
          p("Career Copilot and AI guide", h2), p("Ask for ideas, comparison criteria, preparation checklists, reflection prompts, and possible next steps. Do not enter confidential, identifying, medical, legal, or financial information. Verify important advice against official sources."),
          p("Resources and debate", h2), p("Use workshops, pitching tips, presentation guidance, and speaking practice before applications or competitions. Practise in short rounds and note one improvement after each attempt."), PageBreak()]

# Profile
story += [p("5. Profile, XP, and portfolio", h1),
          p("XP and tier journey", h2), p("Your profile displays your current tier, XP total, progress bar, and streak. Each tier requires another 100 XP."),
          data_table(["Tier", "XP required", "Meaning"], [
              ("Explorer", "0 XP", "Starting tier and profile badge."),
              ("Challenger", "100 XP", "First progression milestone."),
              ("Builder", "200 XP", "Continued participation milestone."),
              ("Achiever", "300 XP", "Advanced progress milestone."),
              ("Trailblazer", "400 XP", "Highest listed tier."),
          ], [42*mm, 35*mm, 90*mm]),
          p("Experience posts", h2), bullets([
              "Add a title, date, caption, and image for a completed experience.",
              "A new experience post currently earns 5 XP.",
              "Select any post card to open the full post in a larger dialog.",
              "Use the close button to return to the profile without leaving the page.",
              "Review captions and images before sharing; avoid private contact details or documents.",
          ]),
          p("Verified portfolio", h2), bullets([
              "Combine official completion records with reflections and projects you control.",
              "Official records remain locked; you choose the visibility of your own content.",
              "Preview the public view before sharing the link.",
              "Use Print / Save as PDF from the public view when you need a shareable copy.",
          ]),
          callout("Privacy", "When a portfolio is public, anyone with its link may be able to view it. Publish only content that is suitable for a broad audience."), PageBreak()]

# Social + inbox
story += [p("6. Community, connections, and inbox", h1),
          p("Finding people", h2), p("Use Community or Find People to search for members. Open a member profile before following or starting a conversation."),
          p("Inbox", h2),
          steps([
              ("Open Inbox", "Choose Inbox from your profile or navigation."),
              ("Choose a tab", "Messages shows conversations. Updates shows reminders, follower activity, and supported application notices."),
              ("Select a conversation", "Choose a person from the conversation list. The message history opens in the main panel."),
              ("Send a message", "Write in the message box and select Send. On narrow phones the button may appear below the field for readability."),
          ]),
          p("Community safety", h2), bullets([
              "Keep conversations relevant and respectful.",
              "Do not share private contact details, home or school schedules, passwords, codes, or sensitive documents.",
              "Do not arrange an in-person meeting without a trusted adult and appropriate safeguarding.",
              "Preserve evidence and contact support if a message is threatening, suspicious, or inappropriate.",
          ]),
          callout("Empty inbox", "No messages yet is normal for a new account. Find a member through Community, open their profile, and start a conversation when messaging is available."), PageBreak()]

# Nav/account/language
story += [p("7. Navigation, language, and account", h1),
          p("Mobile navigation", h2), bullets([
              "The header remains available while the page scrolls, so you do not need to return to the top.",
              "Tap the hamburger button once to open or close the menu.",
              "Tap a dropdown arrow to reveal subpages; this should not close the full menu.",
              "Competition categories include Academic and Non-Academic.",
              "The menu is scrollable when all links do not fit on the screen.",
          ]),
          p("Language and display", h2), bullets([
              "Use the language control to switch supported English and Chinese interface text.",
              "The AI guide and showcase include enlarged, translated text for readability.",
              "Some organiser-provided titles or external pages may remain in their original language.",
              "Use Display Settings to change the visual theme.",
          ]),
          p("Sign-in behavior", h2), bullets([
              "A valid session is reused across protected TeenLaunch pages.",
              "Temporary verification or network failures should not immediately erase the local session.",
              "You may be asked to sign in again after a true session expiry, invalid credentials, manual logout, or cleared browser storage.",
              "Always use Logout on a shared device.",
          ]),
          callout("Accessibility", "Mobile layouts enlarge controls and prevent content from being cut off. If text still appears clipped, rotate the device back to portrait, reset browser zoom, refresh once, and report the page and device to support."), PageBreak()]

# Partner/admin
story += [p("8. Partners and administrators", h1),
          p("Submit an opportunity", h2),
          steps([
              ("Sign in", "Use an authorised account and choose Submit an Opportunity from the Opportunities menu."),
              ("Register the organisation", "Provide the organisation name and description. Complete any required partner registration step."),
              ("Enter opportunity details", "Give accurate eligibility, deadline, location, application, safeguarding, and source information."),
              ("Submit for review", "TeenLaunch administrators review submissions before students can see them. Submission does not guarantee publication."),
          ]),
          p("Administrator responsibilities", h2), bullets([
              "Review source identity, official links, dates, eligibility, costs, and student safety.",
              "Manage opportunities and partner submissions from the admin dashboard.",
              "Apply least-privilege access and never share administrator sessions.",
              "Correct, unpublish, or escalate inaccurate or unsafe listings promptly.",
          ]),
          p("Before a major campaign", h2), bullets([
              "Confirm that the production API and database are available.",
              "Check that opportunity deadlines are current and support coverage is assigned.",
              "Test one complete student journey on both desktop and mobile.",
              "Test sign-in persistence, navigation dropdowns, reminders, planner creation, inbox, and partner submission.",
          ]), PageBreak()]

# Troubleshooting + FAQ
story += [p("9. Troubleshooting and questions", h1),
          data_table(["Problem", "Try this"], [
              ("Asked to log in repeatedly", "Refresh once. If the session truly expired, sign in again. Avoid private browsing and do not clear site storage during use."),
              ("Navigation jumps or closes", "Use the dropdown arrow for categories and the link text for navigation. Refresh to load the latest interface files."),
              ("Reminder disappeared", "Use the same browser and device. Reminders stored locally can be removed when browser storage is cleared."),
              ("Planner could not be updated", "Keep the form values, check the connection and sign-in state, then retry. Report the displayed error if it continues."),
              ("No recommendations", "Complete Career DNA and fill in profile eligibility details."),
              ("Inbox looks empty", "Select Messages or Updates. Start a connection through Community if there are no conversations."),
              ("Mobile content is cut off", "Use portrait orientation, reset zoom, refresh, and try a current supported browser."),
              ("Public portfolio missing", "Confirm it is public in the builder and copy a fresh public link."),
          ], [55*mm, 112*mm]),
          p("Frequently asked questions", h2),
          p("<b>Can I browse without an account?</b><br/>Yes. Sign-in is required for saved items, applications, recommendations, planning, social features, and portfolio management."),
          p("<b>Does a recommendation guarantee eligibility or acceptance?</b><br/>No. Recheck every official requirement and use the score only as guidance."),
          p("<b>Is Save the same as Apply?</b><br/>No. Save bookmarks an opportunity. Apply starts or links to its submission process."),
          p("<b>Can I retake Career DNA?</b><br/>Yes. Open Settings > Personality Test and choose the retake option."),
          p("<b>Where can I get help?</b><br/>Open Help inside TeenLaunch or email vivienne@teenlaunch.app."),
          Spacer(1, 3*mm), callout("When contacting support", "Include the page, date and time, browser and device, what you expected, what happened, and a screenshot with passwords and sensitive personal data removed.")]

ManualDoc(str(OUTPUT)).build(story)
print(OUTPUT)
