import json
import sys
from pathlib import Path

import cv2
import numpy as np
from rapidocr_onnxruntime import RapidOCR


def normalize_text(value: str) -> str:
    return " ".join(str(value or "").split()).strip()


def analyze_text_quality(text: str) -> dict[str, float]:
    compact = "".join(text.split())
    total_chars = max(len(compact), 1)
    chinese_chars = sum(1 for ch in compact if "\u4e00" <= ch <= "\u9fff")
    word_chars = sum(1 for ch in compact if ch.isalnum() or ("\u4e00" <= ch <= "\u9fff"))
    allowed = set("()（）[]【】《》“”\"'‘’、，。！？；：:,.·-+/#& ")
    noisy_chars = sum(
        1
        for ch in compact
        if not (ch.isalnum() or ("\u4e00" <= ch <= "\u9fff") or ch in allowed)
    )
    return {
        "total_chars": float(total_chars),
        "chinese_ratio": chinese_chars / total_chars,
        "word_ratio": word_chars / total_chars,
        "noise_ratio": noisy_chars / total_chars,
    }


def score_candidate(text: str, average_confidence: float) -> float:
    quality = analyze_text_quality(text)
    score = 0.0
    score += min(120.0, quality["total_chars"] * 1.3)
    score += average_confidence * 80.0
    score += quality["word_ratio"] * 60.0
    score += quality["chinese_ratio"] * 45.0
    score -= quality["noise_ratio"] * 150.0

    keywords = [
        "学院",
        "大学",
        "学校",
        "职业",
        "竞赛",
        "大赛",
        "比赛",
        "程序设计",
        "第",
        "届",
        "年",
        "奖",
        "一等奖",
        "二等奖",
        "三等奖",
        "优秀奖",
        "证书",
        "奖状",
    ]
    score += sum(12.0 for keyword in keywords if keyword in text)
    return score


def resize_for_ocr(image: np.ndarray) -> np.ndarray:
    height, width = image.shape[:2]
    longest_side = max(height, width)
    if longest_side >= 1800:
        return image
    scale = 1800.0 / max(longest_side, 1)
    return cv2.resize(
        image,
        (max(1, int(round(width * scale))), max(1, int(round(height * scale)))),
        interpolation=cv2.INTER_CUBIC,
    )


def crop_region(image: np.ndarray, left: float, top: float, right: float, bottom: float) -> np.ndarray:
    height, width = image.shape[:2]
    x1 = max(0, min(width - 1, int(round(width * left))))
    y1 = max(0, min(height - 1, int(round(height * top))))
    x2 = max(x1 + 1, min(width, int(round(width * right))))
    y2 = max(y1 + 1, min(height, int(round(height * bottom))))
    return image[y1:y2, x1:x2].copy()


def apply_high_contrast(image: np.ndarray) -> np.ndarray:
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    gray = cv2.GaussianBlur(gray, (3, 3), 0)
    binary = cv2.adaptiveThreshold(
        gray,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        31,
        11,
    )
    return cv2.cvtColor(binary, cv2.COLOR_GRAY2BGR)


def build_variants(image: np.ndarray) -> list[tuple[str, np.ndarray]]:
    base = resize_for_ocr(image)
    variants = [
        ("原图", base),
        ("去边框", crop_region(base, 0.06, 0.08, 0.94, 0.9)),
        ("正文区", crop_region(base, 0.12, 0.24, 0.88, 0.72)),
        ("正文高对比", apply_high_contrast(crop_region(base, 0.12, 0.24, 0.88, 0.72))),
    ]
    return variants


def run_variant(engine: RapidOCR, label: str, image: np.ndarray) -> dict | None:
    result, _ = engine(image, use_cls=False)
    if not result:
        return None

    lines: list[str] = []
    scores: list[float] = []
    for item in result:
        if len(item) < 3:
            continue
        text = normalize_text(item[1])
        score = float(item[2] or 0)
        if not text:
            continue
        lines.append(text)
        scores.append(score)

    text = "\n".join(lines).strip()
    if not text:
        return None

    average_confidence = sum(scores) / max(len(scores), 1)
    return {
        "label": label,
        "text": text,
        "averageConfidence": average_confidence,
        "score": score_candidate(text, average_confidence),
    }


def load_image(image_path: Path) -> np.ndarray:
    data = np.fromfile(str(image_path), dtype=np.uint8)
    image = cv2.imdecode(data, cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError("图片读取失败")
    return image


def main() -> int:
    if len(sys.argv) < 2:
        print(json.dumps({"error": "缺少图片路径"}, ensure_ascii=False))
        return 1

    image_path = Path(sys.argv[1]).resolve()
    if not image_path.exists():
        print(json.dumps({"error": "图片文件不存在"}, ensure_ascii=False))
        return 1

    try:
        image = load_image(image_path)
        engine = RapidOCR()
        candidates = []
        for label, variant in build_variants(image):
            candidate = run_variant(engine, label, variant)
            if candidate:
                candidates.append(candidate)

        candidates.sort(key=lambda item: item["score"], reverse=True)
        print(
            json.dumps(
                {
                    "candidates": [
                        {
                            "label": item["label"],
                            "text": item["text"],
                            "averageConfidence": item["averageConfidence"],
                        }
                        for item in candidates
                    ]
                },
                ensure_ascii=False,
            )
        )
        return 0
    except Exception as error:  # noqa: BLE001
        print(json.dumps({"error": str(error)}, ensure_ascii=False))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
