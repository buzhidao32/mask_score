#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
from collections import defaultdict
from pathlib import Path


ACHIEVEMENT_PATTERN = re.compile(
    r'\["achievement"\]=\[\[([^\]]+)\]\],\["achievementId"\]=\[\[([^\]]+)\]\],'
    r'\["demand"\]=\[\[([^\]]+)\]\],\["point"\]=(\d+)'
)
MASK_ID_PATTERN = re.compile(r"mianju\d+")
ROW_START_PATTERN = re.compile(r'\["([^"]+)"\]=\{')
ITEM_ATTR_FILES = (
    "Items.lua",
    "mask.lua",
    "equipment.lua",
    "homeland.lua",
    "appearance.lua",
)
CONDITION_ATTR_NAMES = {
    4: "师门声望",
    5: "碎银",
    6: "银票",
    7: "饰品材料",
    8: "雪矾",
    11: "付费面具制作材料",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate mask score JSON data.")
    parser.add_argument("--mask-upgrade", required=True, help="Path to maskUpgrade.lua")
    parser.add_argument("--tujian", required=True, help="Path to tujian.lua")
    parser.add_argument(
        "--item-attrs",
        nargs="*",
        default=None,
        help="Optional mapItemAttr lua files used to resolve item ids to names.",
    )
    parser.add_argument(
        "--family-special",
        default=None,
        help="Optional path to familyspecial.lua used to resolve servant material traits.",
    )
    parser.add_argument(
        "--out",
        default="data/mask_scores.json",
        help="Output JSON path. Default: data/mask_scores.json",
    )
    return parser.parse_args()


def load_text(path_value: str) -> str:
    path = Path(path_value)
    return path.read_text(encoding="utf-8")


def find_matching_brace(text: str, start_index: int) -> int:
    depth = 0
    index = start_index
    in_string = False

    while index < len(text):
        char = text[index]

        if in_string:
            if char == "\\":
                index += 2
                continue
            if char == '"':
                in_string = False
            index += 1
            continue

        if text.startswith("[[", index):
            end = text.find("]]", index + 2)
            if end == -1:
                return len(text) - 1
            index = end + 2
            continue

        if char == '"':
            in_string = True
        elif char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                return index

        index += 1

    raise ValueError("Unclosed lua table body.")


def iter_lua_keyed_rows(text: str):
    index = 0

    while True:
        match = ROW_START_PATTERN.search(text, index)
        if match is None:
            break

        key = match.group(1)
        body_start = match.end()
        body_end = find_matching_brace(text, body_start - 1)
        yield key, text[body_start:body_end]
        index = body_end + 1


def extract_string_field(body: str, field_name: str) -> str | None:
    match = re.search(rf'{re.escape(field_name)}="([^"]*)"', body)
    return match.group(1) if match else None


def extract_number_field(body: str, field_name: str) -> int | None:
    match = re.search(rf"{re.escape(field_name)}=(\d+)", body)
    return int(match.group(1)) if match else None


def extract_lua_text_field(body: str, field_name: str) -> str | None:
    match = re.search(rf'\["{re.escape(field_name)}"\]=\[\[([^\]]*)\]\]', body)
    if match:
        return match.group(1)

    return extract_string_field(body, field_name)


def extract_lua_number_field(body: str, field_name: str) -> int | None:
    match = re.search(rf'\["{re.escape(field_name)}"\]=(-?\d+)', body)
    if match:
        return int(match.group(1))

    return extract_number_field(body, field_name)


def extract_braced_field(body: str, field_name: str) -> str:
    marker = f"{field_name}="
    marker_index = body.find(marker)
    if marker_index == -1:
        return "{}"

    start = body.find("{", marker_index + len(marker))
    if start == -1:
        return "{}"

    end = find_matching_brace(body, start)
    return body[start : end + 1]


def parse_mask_upgrade_rows(mask_upgrade_text: str) -> list[dict]:
    rows: list[dict] = []

    for grade_id, body in iter_lua_keyed_rows(mask_upgrade_text):
        mask_name = extract_string_field(body, "maskName")
        mask_id = extract_string_field(body, "maskId")
        mask_level = extract_number_field(body, "maskLevel")
        if mask_name is None or mask_id is None or mask_level is None:
            continue

        rows.append(
            {
                "gradeId": grade_id,
                "maskName": mask_name,
                "maskId": mask_id,
                "maskLevel": mask_level,
                "upgradeCondition": extract_braced_field(body, "upgradeCondition"),
                "canDeal": extract_number_field(body, "canDeal") or 0,
                "cailiao": extract_number_field(body, "cailiao") or 0,
                "canUpgrade": extract_number_field(body, "canUpgrade") or 0,
            }
        )

    return rows


def split_lua_args(raw: str) -> list[str]:
    args: list[str] = []
    start = 0
    depth = 0
    in_string = False
    index = 0

    while index < len(raw):
        char = raw[index]

        if in_string:
            if char == "\\":
                index += 2
                continue
            if char == '"':
                in_string = False
            index += 1
            continue

        if char == '"':
            in_string = True
        elif char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
        elif char == "," and depth == 0:
            args.append(raw[start:index].strip())
            start = index + 1

        index += 1

    tail = raw[start:].strip()
    if tail:
        args.append(tail)

    return args


def parse_lua_scalar(raw: str):
    value = raw.strip()
    if value.startswith('"') and value.endswith('"'):
        return value[1:-1]
    if re.fullmatch(r"-?\d+", value):
        return int(value)
    return value


def parse_condition_tuples(raw: str) -> list[list]:
    if raw == "{}":
        return []

    tuples: list[list] = []
    depth = 0
    in_string = False
    tuple_start: int | None = None
    index = 0

    while index < len(raw):
        char = raw[index]

        if in_string:
            if char == "\\":
                index += 2
                continue
            if char == '"':
                in_string = False
            index += 1
            continue

        if char == '"':
            in_string = True
        elif char == "{":
            depth += 1
            if depth == 2:
                tuple_start = index + 1
        elif char == "}":
            if depth == 2 and tuple_start is not None:
                tuple_text = raw[tuple_start:index]
                tuples.append([parse_lua_scalar(arg) for arg in split_lua_args(tuple_text)])
                tuple_start = None
            depth -= 1

        index += 1

    return tuples


def infer_item_attr_paths(mask_upgrade_path: str) -> list[Path]:
    source_path = Path(mask_upgrade_path)
    map_item_attr_dir = source_path.parent.parent / "map" / "mapItemAttr"
    return [map_item_attr_dir / file_name for file_name in ITEM_ATTR_FILES]


def extract_item_name(body: str) -> str | None:
    match = re.search(r'\["name"\]=\[\[([^\]]+)\]\]', body)
    if match:
        return match.group(1)

    match = re.search(r'name="([^"]+)"', body)
    return match.group(1) if match else None


def load_item_names(paths: list[str | Path]) -> dict[str, str]:
    item_names: dict[str, str] = {}

    for path_value in paths:
        path = Path(path_value)
        if not path.exists():
            continue

        for item_id, body in iter_lua_keyed_rows(path.read_text(encoding="utf-8")):
            item_name = extract_item_name(body)
            if item_name:
                item_names[item_id] = item_name

    return item_names


def build_condition(condition: list, item_names: dict[str, str]) -> dict:
    condition_type = int(condition[0])

    if condition_type == 1:
        item_id = str(condition[1])
        amount = int(condition[2])
        name = item_names.get(item_id, item_id)
        return {
            "type": "item",
            "itemId": item_id,
            "name": name,
            "amount": amount,
            "text": f"{name}*{amount}",
        }

    amount = int(condition[1])
    name = CONDITION_ATTR_NAMES.get(condition_type, f"条件{condition_type}")
    return {
        "type": "currency",
        "conditionType": condition_type,
        "name": name,
        "amount": amount,
        "text": f"{name}*{amount}",
    }


def build_upgrade_cost(raw_condition: str, item_names: dict[str, str]) -> tuple[list[dict], str]:
    conditions = [
        build_condition(condition, item_names)
        for condition in parse_condition_tuples(raw_condition)
    ]
    text = "、".join(condition["text"] for condition in conditions) if conditions else "无消耗"
    return conditions, text


def build_masks(
    mask_upgrade_text: str,
    item_names: dict[str, str],
) -> tuple[list[dict], dict[str, list[str]]]:
    names_by_id: dict[str, set[str]] = defaultdict(set)
    grades_by_id: dict[str, list[dict]] = defaultdict(list)
    ordered_ids: list[str] = []

    for row in parse_mask_upgrade_rows(mask_upgrade_text):
        mask_id = row["maskId"]
        if not mask_id.startswith("mianju"):
            continue
        if mask_id not in names_by_id:
            ordered_ids.append(mask_id)
        names_by_id[mask_id].add(row["maskName"])
        grades_by_id[mask_id].append(row)

    masks: list[dict] = []
    for mask_id in ordered_ids:
        ordered_names = sorted(names_by_id[mask_id])
        grades = sorted(grades_by_id[mask_id], key=lambda row: row["maskLevel"])
        max_level = max(row["maskLevel"] for row in grades)
        can_decompose = any(row["canDeal"] == 1 for row in grades)
        decompose_material = max(row["cailiao"] for row in grades)
        upgrade_costs = []

        for row in grades:
            if row["maskLevel"] <= 1:
                continue

            conditions, text = build_upgrade_cost(row["upgradeCondition"], item_names)
            upgrade_costs.append(
                {
                    "level": row["maskLevel"],
                    "conditions": conditions,
                    "text": text,
                }
            )

        masks.append(
            {
                "maskId": mask_id,
                "maskName": ordered_names[0],
                "allNames": ordered_names,
                "canUpgrade": any(row["canUpgrade"] == 1 for row in grades) or max_level > 1,
                "maxLevel": max_level,
                "upgradeCosts": upgrade_costs,
                "canDecompose": can_decompose,
                "decomposeMaterial": decompose_material if can_decompose else 0,
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


def clean_color_codes(text: str) -> str:
    return re.sub(
        r"(HIR|HIG|HIY|HIB|HIM|HIC|HIW|RED|GRN|YEL|BLU|MAG|CYN|WHT|BLK|NOR)",
        "",
        text,
    )


def parse_servant_material_traits(family_special_text: str) -> list[dict]:
    traits: list[dict] = []

    def append_trait(trait_id: str, body: str) -> None:
        raw_name = extract_lua_text_field(body, "CharacteristicName") or ""
        description = extract_lua_text_field(body, "Characteristic") or ""
        if "烛阴" not in raw_name or "重复饰品处理产量" not in description:
            return

        clean_name = clean_color_codes(raw_name)
        name_match = re.search(r"【([^】]+)】", clean_name)
        level_match = re.search(r"烛阴(\d+)", clean_name)
        bonus_percent = extract_lua_number_field(body, "CharacteristicValue")
        if level_match is None or bonus_percent is None:
            return

        traits.append(
            {
                "id": trait_id,
                "name": name_match.group(1) if name_match else f"烛阴{level_match.group(1)}",
                "level": int(level_match.group(1)),
                "bonusPercent": bonus_percent,
                "description": description,
            }
        )

    for row_id, body in iter_lua_keyed_rows(family_special_text):
        append_trait(row_id, body)

        for nested_id, nested_body in iter_lua_keyed_rows(body):
            append_trait(nested_id, nested_body)

    return sorted(traits, key=lambda trait: trait["level"])


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


def build_payload(
    mask_upgrade_path: str,
    tujian_path: str,
    item_attr_paths: list[str | Path] | None = None,
    family_special_path: str | None = None,
) -> dict:
    mask_upgrade_text = load_text(mask_upgrade_path)
    tujian_text = load_text(tujian_path)
    family_special_traits: list[dict] = []
    if family_special_path:
        family_special_path_value = Path(family_special_path)
        if family_special_path_value.exists():
            family_special_traits = parse_servant_material_traits(
                family_special_path_value.read_text(encoding="utf-8")
            )

    resolved_item_attr_paths = (
        [Path(path) for path in item_attr_paths]
        if item_attr_paths is not None
        else infer_item_attr_paths(mask_upgrade_path)
    )
    item_names = load_item_names(resolved_item_attr_paths)
    masks, mask_names = build_masks(mask_upgrade_text, item_names)
    achievements = build_achievements(tujian_text, mask_names)
    attach_scores(masks, achievements)

    return {
        "meta": {
            "maskCount": len(masks),
            "achievementCount": len(achievements),
            "sources": {
                "maskUpgrade": str(Path(mask_upgrade_path)),
                "tujian": str(Path(tujian_path)),
                "itemAttrs": [str(path) for path in resolved_item_attr_paths if path.exists()],
                "familySpecial": str(Path(family_special_path))
                if family_special_path
                else None,
            },
        },
        "masks": masks,
        "achievements": achievements,
        "servantMaterialTraits": family_special_traits,
    }


def main() -> None:
    args = parse_args()
    payload = build_payload(
        args.mask_upgrade,
        args.tujian,
        args.item_attrs,
        args.family_special,
    )
    output_path = Path(args.out)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(payload, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    print(
        f"Wrote {output_path} with {payload['meta']['maskCount']} masks and "
        f"{payload['meta']['achievementCount']} achievements."
    )


if __name__ == "__main__":
    main()
