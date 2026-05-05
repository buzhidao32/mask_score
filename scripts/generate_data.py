#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
from collections import defaultdict
from pathlib import Path


MASK_ROW_PATTERN = re.compile(r'maskName="([^"]+)",maskId="([^"]+)"')
ACHIEVEMENT_PATTERN = re.compile(
    r'\["achievement"\]=\[\[([^\]]+)\]\],\["achievementId"\]=\[\[([^\]]+)\]\],'
    r'\["demand"\]=\[\[([^\]]+)\]\],\["point"\]=(\d+)'
)
MASK_ID_PATTERN = re.compile(r"mianju\d+")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate mask score JSON data.")
    parser.add_argument("--mask-upgrade", required=True, help="Path to maskUpgrade.lua")
    parser.add_argument("--tujian", required=True, help="Path to tujian.lua")
    parser.add_argument(
        "--out",
        default="data/mask_scores.json",
        help="Output JSON path. Default: data/mask_scores.json",
    )
    return parser.parse_args()


def load_text(path_value: str) -> str:
    path = Path(path_value)
    return path.read_text(encoding="utf-8")


def build_masks(mask_upgrade_text: str) -> tuple[list[dict], dict[str, list[str]]]:
    names_by_id: dict[str, set[str]] = defaultdict(set)
    ordered_ids: list[str] = []

    for mask_name, mask_id in MASK_ROW_PATTERN.findall(mask_upgrade_text):
      if not mask_id.startswith("mianju"):
          continue
      if mask_id not in names_by_id:
          ordered_ids.append(mask_id)
      names_by_id[mask_id].add(mask_name)

    masks: list[dict] = []
    for mask_id in ordered_ids:
        ordered_names = sorted(names_by_id[mask_id])
        masks.append(
            {
                "maskId": mask_id,
                "maskName": ordered_names[0],
                "allNames": ordered_names,
                "directAchievement": None,
                "directPoint": None,
                "relatedAchievements": [],
            }
        )

    return masks, {mask["maskId"]: mask["allNames"] for mask in masks}


def build_achievements(
    tujian_text: str,
    mask_names: dict[str, list[str]],
) -> list[dict]:
    achievements: list[dict] = []

    for achievement, achievement_id, demand, point_text in ACHIEVEMENT_PATTERN.findall(
        tujian_text
    ):
        demand_ids = MASK_ID_PATTERN.findall(demand)
        if not demand_ids:
            continue

        achievements.append(
            {
                "achievement": achievement,
                "achievementId": achievement_id,
                "point": int(point_text),
                "demandIds": demand_ids,
                "demandNames": [
                    mask_names.get(mask_id, [mask_id])[0] for mask_id in demand_ids
                ],
                "type": "single" if len(demand_ids) == 1 else "combo",
            }
        )

    return achievements


def attach_scores(
    masks: list[dict],
    achievements: list[dict],
) -> None:
    mask_lookup = {mask["maskId"]: mask for mask in masks}

    for achievement in achievements:
        for mask_id in achievement["demandIds"]:
            mask = mask_lookup.get(mask_id)
            if mask is None:
                continue
            mask["relatedAchievements"].append(achievement)

        if achievement["type"] != "single":
            continue

        mask = mask_lookup.get(achievement["demandIds"][0])
        if mask is None or mask["directAchievement"] is not None:
            continue

        mask["directAchievement"] = achievement
        mask["directPoint"] = achievement["point"]


def build_payload(mask_upgrade_path: str, tujian_path: str) -> dict:
    mask_upgrade_text = load_text(mask_upgrade_path)
    tujian_text = load_text(tujian_path)
    masks, mask_names = build_masks(mask_upgrade_text)
    achievements = build_achievements(tujian_text, mask_names)
    attach_scores(masks, achievements)

    return {
        "meta": {
            "maskCount": len(masks),
            "achievementCount": len(achievements),
            "sources": {
                "maskUpgrade": str(Path(mask_upgrade_path)),
                "tujian": str(Path(tujian_path)),
            },
        },
        "masks": masks,
        "achievements": achievements,
    }


def main() -> None:
    args = parse_args()
    payload = build_payload(args.mask_upgrade, args.tujian)
    output_path = Path(args.out)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(
        f"Wrote {output_path} with {payload['meta']['maskCount']} masks and "
        f"{payload['meta']['achievementCount']} achievements."
    )


if __name__ == "__main__":
    main()
