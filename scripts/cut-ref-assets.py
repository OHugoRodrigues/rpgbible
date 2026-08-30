"""Recorta uma variante de cada folha de referência e salva o sprite final.

As folhas em `ref/` trazem o mesmo item em duas ou três variantes sobre fundo
branco ou preto chapado. Aqui o fundo vira transparência por preenchimento a
partir das bordas (o que preserva branco e preto internos da arte), as
variantes são separadas pela projeção do alfa no eixo indicado, e a escolhida
é recortada, redimensionada e gravada em `public/assets/`.
"""

from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image

REF = Path(r"C:\Users\gugar\OneDrive\Documentos\ChatGPT\RPJesus\ref")
OUT = Path(r"C:\Users\gugar\OneDrive\Documentos\ChatGPT\RPJesus\public\assets")

# origem, destino, eixo de separação, índice da variante, tolerância do fundo
JOBS = [
    ("13.png", "items/crown.png", "x", 3, 1, 40),
    ("14.png", "items/harp.png", "x", 3, 1, 40),
    ("15.png", "items/stones.png", "x", 3, 0, 40),
    ("16.png", "items/sling.png", "x", 3, 0, 40),
    ("17.png", "rewards/gemstones.png", "x", 1, 0, 40),
    ("18.png", "rewards/gold.png", "x", 3, 1, 40),
    ("19.png", "rewards/silver.png", "x", 3, 1, 40),
    ("20.png", "rewards/wood.png", "x", 2, 1, 40),
    ("21.png", "rewards/straw.png", "x", 2, 1, 40),
    ("22.png", "rewards/grass.png", "x", 2, 1, 40),
    ("24.png", "items/shield.png", "x", 3, 0, 40),
    ("25.png", "items/helmet.png", "x", 3, 0, 40),
    ("26.png", "items/belt.png", "x", 3, 0, 40),
    ("27.png", "items/breastplate.png", "x", 3, 0, 40),
    ("28.png", "items/shoes.png", "x", 3, 0, 40),
    ("29.png", "items/sword.png", "y", 3, 2, 40),
]

MAX_EDGE = 256
# Vãos menores que isto pertencem ao mesmo item (as duas botas, por exemplo).
MERGE_GAP_MAX = 420


def background_alpha(rgb: np.ndarray, tolerance: int) -> np.ndarray:
    """Alfa por preenchimento a partir das bordas, preservando o miolo da arte."""
    height, width, _ = rgb.shape
    corners = [rgb[0, 0], rgb[0, -1], rgb[-1, 0], rgb[-1, -1]]
    base = np.median(np.stack(corners), axis=0)

    close = (np.abs(rgb.astype(np.int16) - base.astype(np.int16)).max(axis=2) <= tolerance)

    visited = np.zeros((height, width), dtype=bool)
    queue = deque()

    for x in range(width):
        for y in (0, height - 1):
            if close[y, x] and not visited[y, x]:
                visited[y, x] = True
                queue.append((y, x))
    for y in range(height):
        for x in (0, width - 1):
            if close[y, x] and not visited[y, x]:
                visited[y, x] = True
                queue.append((y, x))

    while queue:
        y, x = queue.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < height and 0 <= nx < width and close[ny, nx] and not visited[ny, nx]:
                visited[ny, nx] = True
                queue.append((ny, nx))

    return np.where(visited, 0, 255).astype(np.uint8)


def group(filled: np.ndarray, gap: int) -> list[tuple[int, int]]:
    found: list[list[int]] = []
    for index, value in enumerate(filled):
        if value:
            if found and index - found[-1][1] <= gap:
                found[-1][1] = index
            else:
                found.append([index, index])
    return [(a, b) for a, b in found if b - a > 12]


def spans(mask: np.ndarray, axis: str, expected: int) -> list[tuple[int, int]]:
    """Faixas com conteúdo ao longo do eixo, separadas em `expected` variantes.

    Partes de um mesmo item (as duas botas, por exemplo) ficam mais próximas
    entre si do que duas variantes vizinhas, então o maior vão que ainda produz
    a contagem esperada é o que separa variantes sem partir um item ao meio.
    """
    profile = mask.sum(axis=0 if axis == "x" else 1)
    filled = profile > max(profile.max() * 0.005, 1)

    for gap in range(MERGE_GAP_MAX, 4, -4):
        found = group(filled, gap)
        if len(found) == expected:
            return found
    return group(filled, 8)


def run() -> None:
    for source, target, axis, expected, wanted, tolerance in JOBS:
        image = Image.open(REF / source).convert("RGBA")
        rgb = np.array(image)[:, :, :3]
        existing = np.array(image)[:, :, 3]

        alpha = background_alpha(rgb, tolerance)
        # Respeita a transparência que a arte já trazia.
        alpha = np.minimum(alpha, existing) if existing.min() < 255 else alpha

        found = spans(alpha, axis, expected)
        if not found:
            print(f"  !! {source}: nenhuma variante encontrada")
            continue
        index = min(wanted, len(found) - 1)
        start, end = found[index]

        cut = alpha[:, start : end + 1] if axis == "x" else alpha[start : end + 1, :]
        rows = np.where(cut.sum(axis=1) > 0)[0]
        cols = np.where(cut.sum(axis=0) > 0)[0]
        if rows.size == 0 or cols.size == 0:
            print(f"  !! {source}: variante vazia")
            continue

        if axis == "x":
            box = (start + cols[0], rows[0], start + cols[-1] + 1, rows[-1] + 1)
        else:
            box = (cols[0], start + rows[0], cols[-1] + 1, start + rows[-1] + 1)

        out = Image.fromarray(np.dstack([rgb, alpha]), "RGBA").crop(box)
        scale = MAX_EDGE / max(out.size)
        if scale < 1:
            out = out.resize(
                (max(1, round(out.width * scale)), max(1, round(out.height * scale))),
                Image.NEAREST,
            )

        destination = OUT / target
        destination.parent.mkdir(parents=True, exist_ok=True)
        out.save(destination, optimize=True)
        print(f"  {source} -> {target}  {out.width}x{out.height}  ({len(found)} variantes)")


if __name__ == "__main__":
    run()
