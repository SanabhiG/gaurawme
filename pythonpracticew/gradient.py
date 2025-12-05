import numpy as np
import math

# Parameters
text = "THANK YOU"
width, height = 800, 800
sr = 44100
duration_per_letter = 0.4

freqs = {
    'T': (3, 2),
    'H': (5, 4),
    'A': (4, 3),
    'N': (5, 6),
    'K': (6, 3),
    'Y': (2, 5),
    'O': (3, 3),
    'U': (4, 5)
}

# Generate waveform coordinates
points = []
t = np.linspace(0, duration_per_letter, int(sr * duration_per_letter), endpoint=False)

for ch in text:
    if ch == ' ':
        # brief gap (zero points)
        points.append(np.zeros((100, 2)))
        continue
    fx, fy = freqs.get(ch.upper(), (3, 2))
    phase_x = math.pi / (ord(ch) % 4 + 1)
    phase_y = math.pi / (ord(ch) % 5 + 1)
    X = np.sin(2 * np.pi * fx * t + phase_x)
    Y = np.sin(2 * np.pi * fy * t + phase_y)
    points.append(np.column_stack((X, Y)))

data = np.vstack(points)
data /= np.max(np.abs(data))

# Map normalized XY to image pixels
x_pix = ((data[:, 0] + 1) * 0.5 * (width - 1)).astype(int)
y_pix = ((1 - (data[:, 1] + 1) * 0.5) * (height - 1)).astype(int)

# Create blank black canvas
img = np.zeros((height, width, 3), dtype=np.uint8)

# Draw points as white pixels
for x, y in zip(x_pix, y_pix):
    if 0 <= x < width and 0 <= y < height:
        img[y, x] = [255, 255, 255]

# Save as PPM (simple text-based format)
with open("thank_you_sine_xy.ppm", "wb") as f:
    header = f"P6\n{width} {height}\n255\n"
    f.write(header.encode("ascii"))
    f.write(img.tobytes())

print("Created thank_you_sine_xy.ppm — open it with any image viewer or convert it to PNG.")
