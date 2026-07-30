from pathlib import Path

from PIL import Image
from pypdf import PdfReader
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[2]
CAPTURES = ROOT / "tmp" / "pdfs" / "html-wireframes"
OUT = ROOT / "output" / "pdf" / "TeenLaunch-All-HTML-Wireframes.pdf"
LOGO = ROOT / "assets" / "images" / "light_logo.png"
PW, PH = landscape(A4)
INK = HexColor("#111C49")
BLUE = HexColor("#2E83F7")
MUTED = HexColor("#71809A")
PALE = HexColor("#F4F9FF")
LINE = HexColor("#DCE7F3")


def build():
    images = sorted(CAPTURES.glob("*.png"))
    if not images:
        raise RuntimeError("No captured HTML wireframes found.")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT), pagesize=(PW, PH))
    c.setTitle("TeenLaunch - All HTML Page Wireframes")
    c.setAuthor("TeenLaunch")

    for page_no, image_path in enumerate(images, 1):
        route = image_path.stem.split("__", 1)[1].replace("__", "/") + ".html"
        page_name = route.rsplit("/", 1)[-1].replace(".html", "").replace("-", " ").replace("_", " ").title()

        c.setFillColor(PALE)
        c.rect(0, 0, PW, PH, fill=1, stroke=0)
        c.drawImage(ImageReader(str(LOGO)), 28, PH - 48, 22, 22, preserveAspectRatio=True, mask="auto")
        c.setFillColor(INK)
        c.setFont("Helvetica-Bold", 12)
        c.drawString(56, PH - 38, page_name)
        c.setFillColor(MUTED)
        c.setFont("Helvetica", 6.8)
        c.drawRightString(PW - 28, PH - 37, route)

        frame_x, frame_y = 28, 34
        frame_w, frame_h = PW - 56, PH - 94
        c.setFillColor(white)
        c.setStrokeColor(LINE)
        c.roundRect(frame_x, frame_y, frame_w, frame_h, 10, fill=1, stroke=1)

        with Image.open(image_path) as im:
            iw, ih = im.size
        scale = min((frame_w - 12) / iw, (frame_h - 12) / ih)
        draw_w, draw_h = iw * scale, ih * scale
        draw_x = frame_x + (frame_w - draw_w) / 2
        draw_y = frame_y + (frame_h - draw_h) / 2
        c.drawImage(ImageReader(str(image_path)), draw_x, draw_y, draw_w, draw_h, preserveAspectRatio=True)

        c.setFillColor(BLUE)
        c.circle(18, 18, 9, fill=1, stroke=0)
        c.setFillColor(white)
        c.setFont("Helvetica-Bold", 5.8)
        c.drawCentredString(18, 16, str(page_no))
        c.setFillColor(MUTED)
        c.setFont("Helvetica", 6)
        c.drawRightString(PW - 28, 16, "TeenLaunch HTML wireframes")
        c.showPage()

    c.save()
    reader = PdfReader(str(OUT))
    if len(reader.pages) != len(images):
        raise RuntimeError("PDF page count does not match capture count.")
    print(f"{OUT}\nPages: {len(reader.pages)}")


if __name__ == "__main__":
    build()
