from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "output" / "pdf" / "TeenLaunch-Mobile-App-One-Pager.pdf"
LOGO = ROOT / "assets" / "images" / "light_logo.png"

W, H = A4
INK = HexColor("#111C49")
BLUE = HexColor("#2E83F7")
VIOLET = HexColor("#7366F2")
MUTED = HexColor("#62708A")
PALE = HexColor("#EEF7FF")
LINE = HexColor("#DCE8F5")
NAVY = HexColor("#172668")
GREEN = HexColor("#23836A")


def rr(c, x, y, w, h, r, fill, stroke=None, sw=1):
    c.setLineWidth(sw)
    c.setFillColor(fill)
    c.setStrokeColor(stroke or fill)
    c.roundRect(x, y, w, h, r, fill=1, stroke=1 if stroke else 0)


def text(c, x, y, value, size, color=INK, font="Helvetica", leading=None):
    c.setFont(font, size)
    c.setFillColor(color)
    if "\n" not in value:
        c.drawString(x, y, value)
        return
    t = c.beginText(x, y)
    t.setFont(font, size)
    t.setFillColor(color)
    t.setLeading(leading or size * 1.25)
    for line in value.splitlines():
        t.textLine(line)
    c.drawText(t)


def centered(c, x, y, value, size, color=INK, font="Helvetica"):
    c.setFont(font, size)
    c.setFillColor(color)
    c.drawCentredString(x, y, value)


def phone(c, x, y, w=178, h=358):
    rr(c, x, y, w, h, 28, HexColor("#10172B"))
    rr(c, x + 7, y + 7, w - 14, h - 14, 22, HexColor("#F8FBFF"))
    rr(c, x + w / 2 - 25, y + h - 23, 50, 13, 7, HexColor("#10172B"))

    text(c, x + 18, y + h - 42, "9:41", 5.8, INK, "Helvetica-Bold")
    text(c, x + 18, y + h - 70, "Good morning,", 6.8, MUTED)
    text(c, x + 18, y + h - 86, "Hey, Jennie!", 12, INK, "Helvetica-Bold")
    rr(c, x + w - 39, y + h - 88, 23, 23, 12, VIOLET)
    centered(c, x + w - 27.5, y + h - 81, "J", 7, white, "Helvetica-Bold")

    rr(c, x + 16, y + h - 145, w - 32, 44, 10, BLUE)
    text(c, x + 27, y + h - 119, "YOUR WEEKLY MOMENTUM", 5.3, HexColor("#CDE3FF"), "Helvetica-Bold")
    text(c, x + 27, y + h - 133, "3 of 4 goals complete", 7.2, white, "Helvetica-Bold")
    rr(c, x + 27, y + h - 140, w - 60, 2.5, 1.2, HexColor("#79B5FA"))
    rr(c, x + 27, y + h - 140, (w - 60) * .76, 2.5, 1.2, white)

    text(c, x + 18, y + h - 164, "Picked for you", 8.4, INK, "Helvetica-Bold")
    rr(c, x + 16, y + 76, w - 32, 158, 12, white, LINE, .7)
    rr(c, x + 16, y + 158, w - 32, 76, 12, NAVY)
    c.setFillColor(VIOLET)
    c.circle(x + w - 48, y + 207, 27, fill=1, stroke=0)
    c.setStrokeColor(HexColor("#A9B9FF"))
    c.setLineWidth(1)
    c.circle(x + 54, y + 193, 21, fill=0, stroke=1)
    rr(c, x + 25, y + 215, 34, 10, 4, HexColor("#5265C8"))
    centered(c, x + 42, y + 218, "FEATURED", 4.2, white, "Helvetica-Bold")
    text(c, x + 27, y + 143, "INNOVATION", 5.2, BLUE, "Helvetica-Bold")
    text(c, x + 27, y + 124, "Young Founders", 10, INK, "Helvetica-Bold")
    text(c, x + 27, y + 111, "Challenge 2026", 10, INK, "Helvetica-Bold")
    text(c, x + 27, y + 96, "Singapore  |  Ages 14-18", 5.8, MUTED)
    rr(c, x + 27, y + 82, 46, 11, 5, HexColor("#E5F7F0"))
    centered(c, x + 50, y + 85, "94% MATCH", 4.8, GREEN, "Helvetica-Bold")

    c.setFillColor(white)
    c.rect(x + 7, y + 7, w - 14, 47, fill=1, stroke=0)
    c.setStrokeColor(LINE)
    c.line(x + 7, y + 54, x + w - 7, y + 54)
    for i, label in enumerate(("Home", "Discover", "AI Guide", "Portfolio")):
        cx = x + 27 + i * 41
        centered(c, cx, y + 31, "•", 12, BLUE if i == 0 else HexColor("#9AA5B8"))
        centered(c, cx, y + 18, label, 4.4, BLUE if i == 0 else MUTED, "Helvetica-Bold")


def feature(c, x, y, number, title, body):
    rr(c, x, y + 39, 23, 23, 12, PALE)
    centered(c, x + 11.5, y + 47, number, 6.5, BLUE, "Helvetica-Bold")
    text(c, x + 33, y + 51, title.upper(), 7.2, BLUE, "Helvetica-Bold")
    text(c, x + 33, y + 35, body, 7.2, MUTED, leading=10)


def build():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT), pagesize=A4)
    c.setTitle("TeenLaunch Mobile App One-Pager")
    c.setAuthor("TeenLaunch")
    c.setSubject("Discover, prepare for and prove youth opportunities with TeenLaunch.")

    # Background and top brand
    c.setFillColor(HexColor("#F9FCFF"))
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setFillColor(PALE)
    c.circle(W + 5, H - 105, 165, fill=1, stroke=0)
    c.setFillColor(HexColor("#F2F0FF"))
    c.circle(W - 50, H - 20, 92, fill=1, stroke=0)

    c.drawImage(ImageReader(str(LOGO)), 39, H - 67, 28, 28, preserveAspectRatio=True, mask="auto")
    text(c, 73, H - 57, "TeenLaunch", 14, INK, "Helvetica-Bold")
    text(c, 73, H - 69, "YOUR FUTURE, IN YOUR POCKET", 5.8, BLUE, "Helvetica-Bold")

    # Hero copy
    text(c, 39, H - 121, "Find your next", 31, INK, "Helvetica-Bold")
    text(c, 39, H - 156, "big opportunity.", 31, BLUE, "Helvetica-Bold")
    text(
        c, 39, H - 184,
        "A mobile launchpad helping young people discover,\nprepare for and capture opportunities that shape their future.",
        10.2, MUTED, leading=15,
    )
    rr(c, 39, H - 246, 155, 35, 10, BLUE)
    centered(c, 116.5, H - 234, "GET EARLY ACCESS", 8.2, white, "Helvetica-Bold")
    c.linkURL("mailto:vivienne@teenlaunch.app?subject=TeenLaunch%20Mobile%20Early%20Access",
              (39, H - 246, 194, H - 211), relative=0)
    text(c, 207, H - 226, "Built with students,\nfor ages 10-24", 7.4, MUTED, "Helvetica-Bold", 10)

    # Phone and floating proof cards
    phone(c, 371, H - 437, 178, 358)
    rr(c, 324, H - 210, 105, 39, 11, white, LINE, .6)
    rr(c, 333, H - 199, 22, 22, 11, HexColor("#E5F7F0"))
    centered(c, 344, H - 192, "94%", 5.8, GREEN, "Helvetica-Bold")
    text(c, 363, H - 188, "GREAT MATCH", 5.2, GREEN, "Helvetica-Bold")
    text(c, 363, H - 200, "For your goals", 6.3, INK, "Helvetica-Bold")
    rr(c, 470, H - 408, 90, 38, 11, white, LINE, .6)
    text(c, 481, H - 386, "3 DAYS LEFT", 6, HexColor("#E06C4D"), "Helvetica-Bold")
    text(c, 481, H - 399, "Deadline reminder", 5.6, MUTED)

    # Value proposition band
    rr(c, 0, 286, W, 270, 0, INK)
    text(c, 39, 523, "ONE JOURNEY. ALL IN ONE PLACE.", 6.5, HexColor("#7FB9FF"), "Helvetica-Bold")
    text(c, 39, 494, "From \"what's next?\" to \"I did it.\"", 20, white, "Helvetica-Bold")
    text(c, 39, 473, "TeenLaunch turns scattered information into a clear, personal path forward.", 8.7, HexColor("#B8C7E2"))

    feature(c, 39, 389, "01", "Discover",
            "Personal opportunity matches\nClear eligibility and reminders")
    feature(c, 220, 389, "02", "Prepare",
            "AI guidance in plain language\nApplication and confidence support")
    feature(c, 401, 389, "03", "Prove",
            "Verified achievements\nOne polished portfolio link")

    # Outcomes row
    text(c, 39, 354, "WHY IT MATTERS", 6.5, HexColor("#7FB9FF"), "Helvetica-Bold")
    outcomes = [
        ("Less searching", "Relevant options,\nnot endless links"),
        ("More action", "Clear next steps\nand deadlines"),
        ("Visible growth", "Experiences become\ncredible evidence"),
    ]
    for i, (head, body) in enumerate(outcomes):
        x = 39 + i * 181
        c.setFillColor(BLUE if i == 0 else VIOLET if i == 1 else HexColor("#39A882"))
        c.circle(x + 5, 334, 4, fill=1, stroke=0)
        text(c, x + 16, 330, head, 8, white, "Helvetica-Bold")
        text(c, x + 16, 311, body, 6.6, HexColor("#B8C7E2"), leading=9)

    # Audience and CTA footer
    text(c, 39, 247, "BUILT FOR YOUNG PEOPLE. USEFUL FOR THE ADULTS WHO SUPPORT THEM.", 6.5, BLUE, "Helvetica-Bold")
    text(c, 39, 218, "For students exploring what is possible.", 13, INK, "Helvetica-Bold")
    text(c, 39, 198, "For schools, mentors and partners helping them get there.", 10, MUTED)

    audiences = ("Students", "Schools", "Youth programmes", "Opportunity partners")
    x = 39
    for label in audiences:
        tw = stringWidth(label, "Helvetica-Bold", 6.7) + 20
        rr(c, x, 161, tw, 22, 11, PALE)
        centered(c, x + tw / 2, 169, label, 6.7, BLUE, "Helvetica-Bold")
        x += tw + 7

    rr(c, 39, 61, W - 78, 72, 16, HexColor("#EAF5FF"))
    text(c, 57, 105, "One app. Limitless directions.", 15, INK, "Helvetica-Bold")
    text(c, 57, 86, "Discover  |  Prepare  |  Prove", 7.2, MUTED, "Helvetica-Bold")
    rr(c, W - 202, 79, 145, 36, 10, BLUE)
    centered(c, W - 129.5, 92, "vivienne@teenlaunch.app", 7.3, white, "Helvetica-Bold")
    c.linkURL("mailto:vivienne@teenlaunch.app?subject=TeenLaunch%20Partnership",
              (W - 202, 79, W - 57, 115), relative=0)
    text(c, 39, 34, "TEENLAUNCH MOBILE EXPERIENCE", 5.8, MUTED, "Helvetica-Bold")
    c.setFont("Helvetica", 5.8)
    c.setFillColor(MUTED)
    c.drawRightString(W - 39, 34, "Prospect one-pager")

    c.showPage()
    c.save()
    print(OUT)


if __name__ == "__main__":
    build()
