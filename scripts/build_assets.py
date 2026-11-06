import os
import sys
from PIL import Image, ImageOps, ImageDraw, ImageFilter
from rembg import remove

RAW_DIR = "e:/code/AshiVsZombie/raw_assets/ashi"
OUT_DIR = "e:/code/AshiVsZombie/assets/sprites"
os.makedirs(OUT_DIR, exist_ok=True)

def safe_open(name):
    path = os.path.join(RAW_DIR, name)
    return Image.open(path).convert("RGBA")

def fit_contain(im, size=(180, 180)):
    im.thumbnail(size, Image.Resampling.LANCZOS)
    return im

def circular_crop(im, pad=0):
    w, h = im.size
    dim = min(w, h)
    left = (w - dim) // 2
    top = (h - dim) // 2
    im = im.crop((left, top, left + dim, top + dim))
    mask = Image.new("L", (dim, dim), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((pad, pad, dim - pad, dim - pad), fill=255)
    result = Image.new("RGBA", (dim, dim), (0, 0, 0, 0))
    result.paste(im, (0, 0), mask)
    return result

print("Starting sprite generation...")

# 1. Sun Ashi (Sunflower) - Bikini Ashi
try:
    print("Processing Sun Ashi...")
    im = safe_open("qwen_edit_20261004_234512.png")
    # crop upper body
    im = im.crop((60, 20, 450, 480))
    out = remove(im)
    out = fit_contain(out, (180, 200))
    out.save(os.path.join(OUT_DIR, "plant_sunflower.png"))
    print(" -> Saved plant_sunflower.png")
except Exception as e:
    print("Error sun:", e)

# 2. Peashooter - Gekko Ashi
try:
    print("Processing Peashooter...")
    im = safe_open("ed9e7aa4-dc13-498d-971e-040f8962f4d0.jpeg")
    # crop middle Gekko figure
    im = im.crop((320, 20, 600, 500))
    out = remove(im)
    out = fit_contain(out, (180, 200))
    out.save(os.path.join(OUT_DIR, "plant_peashooter.png"))
    print(" -> Saved plant_peashooter.png")
except Exception as e:
    print("Error peashooter:", e)

# 3. Wallnut - Chubby Big Ashi
try:
    print("Processing Wallnut...")
    im = safe_open("Gemini_Generated_Image_t2e45ct2e45ct2e4.jpeg")
    im = im.crop((50, 180, 850, 1050))
    out = remove(im)
    out = fit_contain(out, (180, 200))
    out.save(os.path.join(OUT_DIR, "plant_wallnut.png"))
    print(" -> Saved plant_wallnut.png")
except Exception as e:
    print("Error wallnut:", e)

# 4. Cherry Bomb - Bomb Bird Ashi
try:
    print("Processing Bomb Bird Ashi...")
    im = safe_open("Gemini_Generated_Image_w62h0zw62h0zw62h.jpg")
    im = im.crop((180, 20, 950, 890))
    out = remove(im)
    out = fit_contain(out, (180, 200))
    out.save(os.path.join(OUT_DIR, "plant_bomb.png"))
    print(" -> Saved plant_bomb.png")
except Exception as e:
    print("Error bomb:", e)

# 5. Jalapeno - Chuck Yellow Bird Ashi
try:
    print("Processing Chuck Bird Ashi...")
    im = safe_open("Gemini_Generated_Image_r2mua9r2mua9r2mu.jpg")
    im = im.crop((150, 10, 850, 880))
    out = remove(im)
    out = fit_contain(out, (180, 200))
    out.save(os.path.join(OUT_DIR, "plant_jalapeno.png"))
    print(" -> Saved plant_jalapeno.png")
except Exception as e:
    print("Error jalapeno:", e)

# 6. Gatling Pea - Four Arms Ashi
try:
    print("Processing Four Arms Ashi...")
    im = safe_open("Gemini_Generated_Image_980u6n980u6n980u.jpeg")
    im = im.crop((10, 0, 820, 950))
    out = remove(im)
    out = fit_contain(out, (180, 200))
    out.save(os.path.join(OUT_DIR, "plant_gatling.png"))
    print(" -> Saved plant_gatling.png")
except Exception as e:
    print("Error gatling:", e)

# 7. Snow Pea - Tokyo Ghoul Ashi
try:
    print("Processing Tokyo Ghoul Ashi...")
    im = safe_open("Gemini_Generated_Image_ovar5lovar5lovar.jpeg")
    # Face crop
    im = im.crop((100, 0, 1100, 896))
    out = circular_crop(im)
    out = fit_contain(out, (180, 180))
    out.save(os.path.join(OUT_DIR, "plant_icepea.png"))
    print(" -> Saved plant_icepea.png")
except Exception as e:
    print("Error icepea:", e)

# 8. Squash - Shrek Ashi
try:
    print("Processing Shrek Ashi...")
    im = safe_open("Gemini_Generated_Image_9bccp39bccp39bcc.jpeg")
    im = im.crop((0, 80, 1100, 896))
    out = circular_crop(im)
    out = fit_contain(out, (180, 180))
    out.save(os.path.join(OUT_DIR, "plant_squash.png"))
    print(" -> Saved plant_squash.png")
except Exception as e:
    print("Error squash:", e)

# 9. Chomper - Nina Chimera Dog Ashi
try:
    print("Processing Nina Dog Ashi...")
    im = safe_open("IMG_0333.JPG")
    im = im.crop((350, 60, 1400, 1300))
    out = remove(im)
    out = fit_contain(out, (180, 200))
    out.save(os.path.join(OUT_DIR, "plant_chomper.png"))
    print(" -> Saved plant_chomper.png")
except Exception as e:
    print("Error chomper:", e)

# 10. Hypno-Shroom - Bald Bucktooth Ashi
try:
    print("Processing Hypno Bald Ashi...")
    im = safe_open("1000003143.jpg")
    out = remove(im)
    out = fit_contain(out, (180, 200))
    out.save(os.path.join(OUT_DIR, "plant_hypno.png"))
    print(" -> Saved plant_hypno.png")
except Exception as e:
    print("Error hypno:", e)

# 11. Spikeweed - Larva Ashi
try:
    print("Processing Larva Ashi...")
    im = safe_open("Gemini_Generated_Image_kwy6itkwy6itkwy6.jpeg")
    im = im.crop((50, 340, 800, 1150))
    out = remove(im)
    out = fit_contain(out, (180, 180))
    out.save(os.path.join(OUT_DIR, "plant_spikeweed.png"))
    print(" -> Saved plant_spikeweed.png")
except Exception as e:
    print("Error spikeweed:", e)

# 12. Catapult - Spider-Man Ashi
try:
    print("Processing Spidey Ashi...")
    im = safe_open("IMG_0335.JPG")
    im = im.crop((200, 80, 1600, 1500))
    out = remove(im)
    out = fit_contain(out, (180, 200))
    out.save(os.path.join(OUT_DIR, "plant_catapult.png"))
    print(" -> Saved plant_catapult.png")
except Exception as e:
    print("Error catapult:", e)

# 13. Repeater - Pucker Face Double Shooter Ashi
try:
    print("Processing Repeater Pucker Ashi...")
    im = safe_open("2.jpeg")
    im = circular_crop(im)
    im = fit_contain(im, (180, 180))
    im.save(os.path.join(OUT_DIR, "plant_repeater.png"))
    print(" -> Saved plant_repeater.png")
except Exception as e:
    print("Error repeater:", e)

# 14. Lawnmower - Skydiving Ashi
try:
    print("Processing Lawnmower Flying Ashi...")
    im = safe_open("6.jpeg")
    im = im.crop((80, 100, 1150, 750))
    out = remove(im)
    out = fit_contain(out, (200, 140))
    out.save(os.path.join(OUT_DIR, "mower_ashi.png"))
    print(" -> Saved mower_ashi.png")
except Exception as e:
    print("Error mower:", e)

# --- ZOMBIES ---
# 15. Basic Zombie - Torn Shirt Ashi
try:
    print("Processing Basic Zombie...")
    im = safe_open("Gemini_Generated_Image_nkpk4ynkpk4ynkpk.jpeg")
    im = im.crop((180, 330, 820, 1050))
    out = remove(im)
    out = fit_contain(out, (180, 220))
    out.save(os.path.join(OUT_DIR, "zombie_basic.png"))
    print(" -> Saved zombie_basic.png")
except Exception as e:
    print("Error basic zombie:", e)

# 16. Shield / Pizza Box Zombie
try:
    print("Processing Pizza Box Zombie...")
    im = safe_open("1792547722853.jpg")
    im = im.crop((300, 60, 2100, 1750))
    out = remove(im)
    out = fit_contain(out, (180, 220))
    out.save(os.path.join(OUT_DIR, "zombie_shield.png"))
    print(" -> Saved zombie_shield.png")
except Exception as e:
    print("Error shield zombie:", e)

# 17. GigaChad Zombie (Runner / Pole Vaulter)
try:
    print("Processing GigaChad Zombie...")
    im = safe_open("3.jpeg")
    im = circular_crop(im)
    im = fit_contain(im, (180, 180))
    im.save(os.path.join(OUT_DIR, "zombie_gigachad.png"))
    print(" -> Saved zombie_gigachad.png")
except Exception as e:
    print("Error gigachad:", e)

# 18. Couch Potato Zombie (Tank / Gargantuar mini-boss)
try:
    print("Processing Couch Zombie...")
    im = safe_open("4.jpeg")
    im = im.crop((0, 150, 1100, 750))
    out = remove(im)
    out = fit_contain(out, (240, 180))
    out.save(os.path.join(OUT_DIR, "zombie_couch.png"))
    print(" -> Saved zombie_couch.png")
except Exception as e:
    print("Error couch zombie:", e)

# 19. Boss Zombie - Choking Ashi
try:
    print("Processing Boss Zombie...")
    im = safe_open("1000010497.jpg")
    im = im.crop((0, 0, 2400, 3200))
    out = remove(im)
    out = fit_contain(out, (280, 280))
    out.save(os.path.join(OUT_DIR, "zombie_boss.png"))
    print(" -> Saved zombie_boss.png")
except Exception as e:
    print("Error boss zombie:", e)

print("Asset generation complete!")

