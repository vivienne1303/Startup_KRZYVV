from pathlib import Path
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "output" / "pdf" / "TeenLaunch-Mobile-App-One-Pager.pdf"
LOGO = ROOT / "assets" / "images" / "light_logo.png"
W, H = A4

INK = HexColor("#111C49")
BLUE = HexColor("#2E83F7")
VIOLET = HexColor("#7366F2")
MUTED = HexColor("#71809A")
PALE = HexColor("#F4F9FF")
LINE = HexColor("#DDE8F5")
NAVY = HexColor("#172668")
GREEN = HexColor("#23836A")


def rr(c, x, y, w, h, r, fill, stroke=None, sw=.7):
    c.setFillColor(fill)
    c.setStrokeColor(stroke or fill)
    c.setLineWidth(sw)
    c.roundRect(x, y, w, h, r, fill=1, stroke=1 if stroke else 0)


def tx(c, x, y, s, size, color=INK, bold=False):
    c.setFillColor(color)
    c.setFont("Helvetica-Bold" if bold else "Helvetica", size)
    c.drawString(x, y, s)


def ct(c, x, y, s, size, color=INK, bold=False):
    c.setFillColor(color)
    c.setFont("Helvetica-Bold" if bold else "Helvetica", size)
    c.drawCentredString(x, y, s)


def phone_shell(c, x, y, w=154, h=340):
    rr(c, x, y, w, h, 25, HexColor("#0F172C"))
    rr(c, x + 6, y + 6, w - 12, h - 12, 20, HexColor("#F8FBFF"))
    rr(c, x + w / 2 - 22, y + h - 20, 44, 11, 6, HexColor("#0F172C"))
    tx(c, x + 16, y + h - 37, "9:41", 5, INK, True)
    return x + 12, y + 12, w - 24, h - 24


def bottom_nav(c, x, y, w, active):
    c.setFillColor(white)
    c.rect(x, y, w, 39, fill=1, stroke=0)
    c.setStrokeColor(LINE)
    c.line(x, y + 39, x + w, y + 39)
    labels = ("Home", "Discover", "AI Guide", "Portfolio")
    for i, label in enumerate(labels):
        cx = x + 17 + i * ((w - 34) / 3)
        col = BLUE if label == active else HexColor("#9BA6B8")
        ct(c, cx, y + 21, "•", 10, col, True)
        ct(c, cx, y + 10, label, 3.8, col, True)


def home_screen(c, x, y, w, h):
    tx(c, x + 7, y + h - 55, "Good morning,", 5.7, MUTED)
    tx(c, x + 7, y + h - 69, "Hey, Jennie!", 10.5, INK, True)
    rr(c, x + w - 28, y + h - 73, 20, 20, 10, VIOLET)
    ct(c, x + w - 18, y + h - 66, "J", 6, white, True)
    rr(c, x + 6, y + h - 121, w - 12, 39, 9, BLUE)
    tx(c, x + 15, y + h - 99, "WEEKLY MOMENTUM", 4.4, HexColor("#D7E9FF"), True)
    tx(c, x + 15, y + h - 112, "3 of 4 goals complete", 6.2, white, True)
    tx(c, x + 7, y + h - 140, "Picked for you", 7.5, INK, True)
    rr(c, x + 6, y + 79, w - 12, 127, 10, white, LINE)
    rr(c, x + 6, y + 142, w - 12, 64, 10, NAVY)
    c.setFillColor(VIOLET)
    c.circle(x + w - 35, y + 181, 21, fill=1, stroke=0)
    tx(c, x + 15, y + 130, "INNOVATION", 4.5, BLUE, True)
    tx(c, x + 15, y + 113, "Young Founders", 8.5, INK, True)
    tx(c, x + 15, y + 101, "Challenge 2026", 8.5, INK, True)
    tx(c, x + 15, y + 89, "Singapore  |  Ages 14-18", 4.8, MUTED)
    rr(c, x + 15, y + 73, 42, 10, 5, HexColor("#E5F7F0"))
    ct(c, x + 36, y + 76, "94% MATCH", 4.2, GREEN, True)
    bottom_nav(c, x, y, w, "Home")


def discover_screen(c, x, y, w, h):
    ct(c, x + w / 2, y + h - 63, "Discover", 10, INK, True)
    rr(c, x + 6, y + h - 97, w - 12, 24, 7, white, LINE)
    tx(c, x + 15, y + h - 88, "Search opportunities", 5.4, HexColor("#9AA5B6"))
    tags = [("For you", BLUE, white), ("Compete", white, MUTED), ("Internships", white, MUTED)]
    sx = x + 6
    for label, fill, col in tags:
        tw = (w - 20) / 3
        rr(c, sx, y + h - 122, tw, 17, 8, fill, LINE if fill == white else None)
        ct(c, sx + tw / 2, y + h - 116, label, 3.6, col, True)
        sx += tw + 4
    tx(c, x + 7, y + h - 140, "24 opportunities matched", 4.8, MUTED)
    cards = [
        ("94% MATCH", "Founders Challenge", "Innovation", NAVY),
        ("89% MATCH", "Leaders Lab", "Leadership", HexColor("#3297A7")),
        ("86% MATCH", "Debate Open", "Communication", HexColor("#E27666")),
    ]
    cy = y + h - 207
    for match, title, meta, color in cards:
        rr(c, x + 6, cy, w - 12, 57, 9, white, LINE)
        rr(c, x + 13, cy + 7, 40, 43, 7, color)
        ct(c, x + 33, cy + 23, "◆", 12, white)
        tx(c, x + 60, cy + 41, match, 4.2, BLUE, True)
        tx(c, x + 60, cy + 28, title, 5.2, INK, True)
        tx(c, x + 60, cy + 16, meta, 3.8, MUTED)
        cy -= 64
    bottom_nav(c, x, y, w, "Discover")


def ai_screen(c, x, y, w, h):
    ct(c, x + w / 2, y + h - 63, "AI Guide", 10, INK, True)
    rr(c, x + 6, y + h - 123, w - 12, 45, 10, HexColor("#E9F3FF"))
    rr(c, x + 14, y + h - 111, 22, 22, 8, BLUE)
    ct(c, x + 25, y + h - 104, "✦", 8, white, True)
    tx(c, x + 43, y + h - 96, "Hi Jennie!", 6.4, INK, True)
    tx(c, x + 43, y + h - 109, "What are you working on?", 4.8, MUTED)
    tx(c, x + 7, y + h - 146, "ASK ABOUT", 4.4, BLUE, True)
    prompts = ("Finding opportunities", "Improving my pitch", "Planning next steps")
    py = y + h - 174
    for prompt in prompts:
        rr(c, x + 6, py, w - 12, 22, 8, white, LINE)
        tx(c, x + 15, py + 8, prompt, 5.4, INK, True)
        py -= 29
    rr(c, x + 35, y + 91, w - 41, 45, 10, BLUE)
    tx(c, x + 44, y + 119, "How can I make my", 5.2, white)
    tx(c, x + 44, y + 107, "pitch stand out?", 5.2, white)
    rr(c, x + 6, y + 53, w - 12, 30, 9, white, LINE)
    tx(c, x + 15, y + 64, "Ask TeenLaunch AI...", 5, MUTED)
    bottom_nav(c, x, y, w, "AI Guide")


def portfolio_screen(c, x, y, w, h):
    ct(c, x + w / 2, y + h - 63, "My Portfolio", 10, INK, True)
    rr(c, x + w / 2 - 22, y + h - 112, 44, 44, 22, VIOLET)
    ct(c, x + w / 2, y + h - 97, "J", 12, white, True)
    ct(c, x + w / 2, y + h - 125, "Jennie Tan", 8, INK, True)
    ct(c, x + w / 2, y + h - 137, "Student  |  Singapore", 4.8, MUTED)
    rr(c, x + 6, y + h - 177, w - 12, 25, 8, HexColor("#E9F3FF"))
    tx(c, x + 15, y + h - 167, "PROFILE STRENGTH", 4.2, BLUE, True)
    tx(c, x + w - 28, y + h - 167, "82%", 5, BLUE, True)
    tx(c, x + 7, y + h - 196, "VERIFIED HIGHLIGHTS", 4.5, BLUE, True)
    wins = [
        ("Public Speaking", "Future Leaders Lab", HexColor("#FFF0D4")),
        ("Innovation", "Founders Challenge", HexColor("#E7F2FF")),
        ("Teamwork", "Youth Debate Open", HexColor("#E7F7F0")),
    ]
    wy = y + h - 248
    for skill, item, fill in wins:
        rr(c, x + 6, wy, w - 12, 46, 8, white, LINE)
        rr(c, x + 13, wy + 9, 28, 28, 8, fill)
        ct(c, x + 27, wy + 18, "✓", 8, GREEN, True)
        tx(c, x + 49, wy + 28, skill, 6, INK, True)
        tx(c, x + 49, wy + 15, item, 4.4, MUTED)
        wy -= 52
    rr(c, x + 14, y + 48, w - 28, 23, 8, BLUE)
    ct(c, x + w / 2, y + 56, "SHARE PORTFOLIO", 5, white, True)
    bottom_nav(c, x, y, w, "Portfolio")


def build():
    c = canvas.Canvas(str(OUT), pagesize=A4)
    c.setTitle("TeenLaunch Mobile App Visual One-Pager")
    c.setAuthor("TeenLaunch")
    c.setFillColor(PALE)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setFillColor(HexColor("#EAF5FF"))
    c.circle(W - 25, H - 65, 125, fill=1, stroke=0)
    c.setFillColor(HexColor("#F0EDFF"))
    c.circle(W + 5, H - 5, 75, fill=1, stroke=0)

    c.drawImage(ImageReader(str(LOGO)), 36, H - 60, 26, 26, preserveAspectRatio=True, mask="auto")
    tx(c, 68, H - 50, "TeenLaunch", 13, INK, True)
    tx(c, 36, H - 99, "Your future, in your pocket.", 25, INK, True)
    tx(c, 36, H - 122, "Discover opportunities. Get AI guidance. Build proof that travels with you.", 9, MUTED)

    positions = [25, 164, 303, 442]
    labels = [
        ("01", "HOME", "Your launchpad"),
        ("02", "DISCOVER", "Personal matches"),
        ("03", "AI GUIDE", "Smart support"),
        ("04", "PORTFOLIO", "Verified proof"),
    ]
    for x, (num, title, sub) in zip(positions, labels):
        rr(c, x, H - 174, 22, 17, 8, BLUE)
        ct(c, x + 11, H - 168, num, 5.2, white, True)
        tx(c, x + 27, H - 168, title, 5.7, BLUE, True)
        tx(c, x, H - 187, sub, 6.8, INK, True)

    y = 245
    dims = []
    for x in positions:
        dims.append(phone_shell(c, x, y, 128, 380))
    home_screen(c, *dims[0])
    discover_screen(c, *dims[1])
    ai_screen(c, *dims[2])
    portfolio_screen(c, *dims[3])

    rr(c, 32, 68, W - 64, 103, 17, INK)
    tx(c, 51, 139, "ONE JOURNEY. ALL IN ONE PLACE.", 6, HexColor("#7FB9FF"), True)
    tx(c, 51, 111, "From \"what's next?\" to \"I did it.\"", 16, white, True)
    tx(c, 51, 89, "Built with students, for young people aged 10-24.", 7.5, HexColor("#B9C8E2"))
    rr(c, W - 209, 91, 158, 42, 11, BLUE)
    ct(c, W - 130, 107, "vivienne@teenlaunch.app", 7.3, white, True)
    c.linkURL("mailto:vivienne@teenlaunch.app?subject=TeenLaunch%20Mobile%20App",
              (W - 209, 91, W - 51, 133), relative=0)
    tx(c, 32, 37, "TEENLAUNCH MOBILE EXPERIENCE", 5.8, MUTED, True)
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 5.8)
    c.drawRightString(W - 32, 37, "Discover  |  Prepare  |  Prove")
    c.showPage()
    c.save()
    print(OUT)


if __name__ == "__main__":
    build()
