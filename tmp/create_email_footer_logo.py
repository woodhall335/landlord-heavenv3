from pathlib import Path

from PIL import Image


source = Path("public/images/logo.png")
output = Path("public/images/landlord-heaven-email-footer-logo-201x30.png")

image = Image.open(source).convert("RGBA")
resized = image.resize((201, 30), Image.Resampling.LANCZOS)
resized.save(output, optimize=True)
print(output)
