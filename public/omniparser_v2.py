"""
OmniParser v2 handler for the local agent (public/agent.py).
Wire these endpoints into your FastAPI app:

    from omniparser_v2 import router as omniparser_router
    app.include_router(omniparser_router)

Install is one-shot: it clones microsoft/OmniParser into ~/.omniparser,
creates a venv, fetches YOLOv8 icon-detect weights (v2) and the
Florence-2-base icon-caption model, then exposes /parse.

Endpoints:
    POST /omniparser/install    { version: "v1" | "v2" }
    GET  /omniparser/status
    POST /omniparser/parse      { image?, version, caption_icons, ...thresholds }
"""
from __future__ import annotations
import base64, io, os, subprocess, sys, time, json, shutil
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

ROOT = Path.home() / ".omniparser"
REPO = ROOT / "OmniParser"
VENV = ROOT / "venv"
PY   = VENV / "bin" / "python"
WEIGHTS = REPO / "weights"

router = APIRouter(prefix="/omniparser", tags=["omniparser"])

# ----- state -----
_state = {"version": None, "model": None, "caption_model": None, "device": None}


def _sh(cmd: list[str], cwd: Optional[Path] = None) -> str:
    p = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    if p.returncode != 0:
        raise RuntimeError(f"{' '.join(cmd)}\n{p.stderr[-2000:]}")
    return p.stdout


class InstallReq(BaseModel):
    version: str = "v2"


@router.post("/install")
def install(req: InstallReq):
    log = []
    ROOT.mkdir(parents=True, exist_ok=True)
    if not REPO.exists():
        log.append(_sh(["git", "clone", "--depth", "1",
                        "https://github.com/microsoft/OmniParser.git", str(REPO)]))
    else:
        log.append(_sh(["git", "-C", str(REPO), "pull", "--ff-only"]))

    if not VENV.exists():
        log.append(_sh([sys.executable, "-m", "venv", str(VENV)]))

    pip = [str(PY), "-m", "pip", "install", "--upgrade"]
    log.append(_sh(pip + ["pip", "wheel"]))
    log.append(_sh(pip + [
        "torch", "torchvision", "transformers>=4.45", "ultralytics",
        "paddleocr", "paddlepaddle", "einops", "timm", "supervision",
        "accelerate", "opencv-python-headless", "pillow", "numpy",
        "huggingface_hub",
    ]))

    # ---- weights ----
    WEIGHTS.mkdir(parents=True, exist_ok=True)
    hf_dl = (
        "from huggingface_hub import snapshot_download, hf_hub_download;"
        "import os;"
    )
    if req.version == "v2":
        # YOLOv8 icon-detect v2 + Florence-2 caption
        snippet = hf_dl + (
            f"hf_hub_download('microsoft/OmniParser-v2.0','icon_detect/model.pt',"
            f"local_dir=r'{WEIGHTS}');"
            f"hf_hub_download('microsoft/OmniParser-v2.0','icon_detect/model.yaml',"
            f"local_dir=r'{WEIGHTS}');"
            f"snapshot_download('microsoft/OmniParser-v2.0',"
            f"allow_patterns=['icon_caption/*'],local_dir=r'{WEIGHTS}');"
        )
        _state.update(version="v2",
                      model=str(WEIGHTS / "icon_detect/model.pt"),
                      caption_model=str(WEIGHTS / "icon_caption"))
    else:
        snippet = hf_dl + (
            f"snapshot_download('microsoft/OmniParser',"
            f"allow_patterns=['icon_detect/*'],local_dir=r'{WEIGHTS}');"
        )
        _state.update(version="v1",
                      model=str(WEIGHTS / "icon_detect/best.pt"),
                      caption_model=None)

    log.append(_sh([str(PY), "-c", snippet]))

    # device detect
    dev = _sh([str(PY), "-c",
               "import torch;print('cuda' if torch.cuda.is_available() else "
               "('mps' if torch.backends.mps.is_available() else 'cpu'))"]).strip()
    _state["device"] = dev
    log.append(f"device={dev}")

    return {"ok": True, "log": "\n".join(log)[-4000:]}


@router.get("/status")
def status():
    if not REPO.exists() or not VENV.exists():
        return {"available": False, "error": "not installed — click Install"}
    if not _state["version"]:
        # infer from weights on disk
        if (WEIGHTS / "icon_caption").exists():
            _state.update(version="v2",
                          model=str(WEIGHTS / "icon_detect/model.pt"),
                          caption_model=str(WEIGHTS / "icon_caption"))
        elif (WEIGHTS / "icon_detect").exists():
            _state.update(version="v1",
                          model=str(WEIGHTS / "icon_detect/best.pt"))
        else:
            return {"available": False, "error": "weights missing"}
    return {"available": True, **_state}


class ParseReq(BaseModel):
    image: Optional[str] = None  # base64 png; if None, grab screen
    version: str = "v2"
    caption_icons: bool = True
    box_threshold: float = 0.05
    iou_threshold: float = 0.1
    use_paddleocr: bool = True


@router.post("/parse")
def parse(req: ParseReq):
    if not REPO.exists():
        raise HTTPException(400, "OmniParser not installed")

    # grab screen if no image supplied
    if not req.image:
        try:
            from PIL import ImageGrab
            buf = io.BytesIO()
            ImageGrab.grab().save(buf, format="PNG")
            req.image = base64.b64encode(buf.getvalue()).decode()
        except Exception as e:
            raise HTTPException(500, f"screenshot failed: {e}")

    # write image + run parser in the venv (isolated deps)
    tmp_img = ROOT / "_frame.png"
    tmp_out = ROOT / "_out.json"
    tmp_img.write_bytes(base64.b64decode(req.image))

    runner = ROOT / "_run.py"
    runner.write_text(_RUNNER)

    t0 = time.time()
    env = os.environ.copy()
    env["OMNI_WEIGHTS"] = str(WEIGHTS)
    env["OMNI_REPO"] = str(REPO)
    _sh([str(PY), str(runner),
         str(tmp_img), str(tmp_out),
         req.version, str(req.caption_icons).lower(),
         str(req.box_threshold), str(req.iou_threshold),
         str(req.use_paddleocr).lower()])
    result = json.loads(tmp_out.read_text())
    result["latency_ms"] = int((time.time() - t0) * 1000)
    return result


# runner executed inside the omniparser venv
_RUNNER = r'''
import sys, json, base64, io, os
from pathlib import Path
img_path, out_path, version, caption, boxt, iout, ocr = sys.argv[1:8]
caption = caption == "true"; ocr = ocr == "true"
boxt = float(boxt); iout = float(iout)

sys.path.insert(0, os.environ["OMNI_REPO"])
from PIL import Image
from util.utils import check_ocr_box, get_yolo_model, get_som_labeled_img

WEIGHTS = Path(os.environ["OMNI_WEIGHTS"])
if version == "v2":
    yolo = get_yolo_model(model_path=str(WEIGHTS / "icon_detect/model.pt"))
    if caption:
        from util.utils import get_caption_model_processor
        cap_proc = get_caption_model_processor(
            model_name="florence2",
            model_name_or_path=str(WEIGHTS / "icon_caption"))
    else:
        cap_proc = None
else:
    yolo = get_yolo_model(model_path=str(WEIGHTS / "icon_detect/best.pt"))
    cap_proc = None

img = Image.open(img_path).convert("RGB")
W, H = img.size
ocr_bbox_rslt, _ = check_ocr_box(
    img_path, display_img=False, output_bb_format="xyxy",
    goal_filtering=None, easyocr_args={"paragraph": False, "text_threshold": 0.9},
    use_paddleocr=ocr)
text, ocr_bbox = ocr_bbox_rslt

annotated_b64, coords, parsed = get_som_labeled_img(
    img_path, yolo, BOX_TRESHOLD=boxt,
    output_coord_in_ratio=False, ocr_bbox=ocr_bbox, draw_bbox_config=None,
    caption_model_processor=cap_proc, ocr_text=text, iou_threshold=iout,
    imgsz=640)

elements = []
for i, p in enumerate(parsed):
    b = p.get("bbox") or [0,0,0,0]
    kind = "text" if p.get("type") == "text" else (
           "icon" if p.get("type") == "icon" else "other")
    elements.append({
        "id": i,
        "type": kind,
        "content": p.get("content") or "",
        "caption": p.get("caption"),
        "bbox": [float(x) for x in b],
        "interactable": kind != "text",
        "confidence": float(p.get("confidence", 0.0)),
    })

Path(out_path).write_text(json.dumps({
    "version": version, "width": W, "height": H,
    "elements": elements, "annotated_image": annotated_b64,
}))
'''
