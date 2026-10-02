"""Build the qualifying five-season college-football panel used by the site.

The source files are public cfbfastR event files. One output row is one
college-football play, with season as time and team as the repeating group.
The browser uses the smaller team-season rollup while the compressed play file
preserves the qualifying event-level data for inspection and reproduction.
"""

from __future__ import annotations

import argparse
import csv
import gzip
import json
import tempfile
import urllib.request
from collections import defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "data"
YEARS = range(2021, 2026)
URL = "https://raw.githubusercontent.com/sportsdataverse/cfbfastR-data/main/player_stats/csv/player_stats_{year}.csv"
FIELDS = [
    "game_id", "season", "week", "team", "conference", "opponent",
    "team_score", "opponent_score", "drive_id", "play_id", "period",
    "clock_minutes", "clock_seconds", "yards_to_goal", "down", "distance",
    "rush_yds", "reception_yds", "completion_yds", "touchdown",
    "field_goal_made", "play_type",
]
NUMERIC = {
    "season", "week", "team_score", "opponent_score", "period",
    "clock_minutes", "clock_seconds", "yards_to_goal", "down", "distance",
    "rush_yds", "reception_yds", "completion_yds", "touchdown",
    "field_goal_made",
}


def number(value: str | None) -> int | float | str:
    if value in (None, "", "NA", "N/A"):
        return ""
    try:
        parsed = float(value)
    except ValueError:
        return value
    return int(parsed) if parsed.is_integer() else parsed


def nonempty(row: dict[str, str], key: str) -> bool:
    return row.get(key, "") not in ("", "NA", "N/A")


def source_file(year: int, source_dir: Path | None, cache_dir: Path) -> Path:
    if source_dir:
        for candidate in (source_dir / f"player_stats_{year}.csv", source_dir / f"nil-qualifying-player-stats-{year}.csv"):
            if candidate.exists():
                return candidate
    destination = cache_dir / f"player_stats_{year}.csv"
    if not destination.exists():
        print(f"Downloading {year} source file")
        urllib.request.urlretrieve(URL.format(year=year), destination)
    return destination


def play_type(row: dict[str, str]) -> str:
    if nonempty(row, "rush_player"):
        return "rush"
    if nonempty(row, "completion_player") or nonempty(row, "reception_player"):
        return "pass"
    if nonempty(row, "field_goal_attempt_player"):
        return "field goal"
    if nonempty(row, "punt_player"):
        return "punt"
    return "other"


def clean_play(row: dict[str, str]) -> dict[str, int | float | str]:
    touchdown = int(nonempty(row, "touchdown_player"))
    made_field_goal = int(nonempty(row, "field_goal_made_player"))
    cleaned: dict[str, int | float | str] = {}
    for field in FIELDS:
        if field == "touchdown":
            cleaned[field] = touchdown
        elif field == "field_goal_made":
            cleaned[field] = made_field_goal
        elif field == "play_type":
            cleaned[field] = play_type(row)
        elif field in NUMERIC:
            cleaned[field] = number(row.get(field))
        else:
            cleaned[field] = row.get(field, "")
    return cleaned


def build(source_dir: Path | None) -> None:
    OUTPUT.mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="cfbfastR-cache-") as cache:
        cache_dir = Path(cache)
        play_output = OUTPUT / "football_plays_2021_2025.csv.gz"
        team_games: dict[tuple[int, str, str], dict[str, dict[str, int | float | str]]] = defaultdict(dict)
        team_totals: dict[tuple[int, str, str], dict[str, int | float]] = defaultdict(lambda: {"plays": 0, "rush_yds": 0, "reception_yds": 0, "completion_yds": 0, "touchdowns": 0, "field_goals": 0})
        play_type_totals: dict[tuple[int, str, str, str], dict[str, int | float]] = defaultdict(lambda: {"plays": 0, "rush_yds": 0, "reception_yds": 0, "completion_yds": 0, "touchdowns": 0, "field_goals": 0})
        rows_written = 0
        with gzip.open(play_output, "wt", newline="", encoding="utf-8") as output_file:
            writer = csv.DictWriter(output_file, fieldnames=FIELDS)
            writer.writeheader()
            for year in YEARS:
                source = source_file(year, source_dir, cache_dir)
                with source.open(newline="", encoding="utf-8", errors="replace") as input_file:
                    reader = csv.DictReader(input_file)
                    for raw in reader:
                        cleaned = clean_play(raw)
                        if not cleaned["team"] or not cleaned["game_id"]:
                            continue
                        writer.writerow(cleaned)
                        rows_written += 1
                        key = (int(cleaned["season"]), str(cleaned["team"]), str(cleaned["conference"]))
                        game_key = str(cleaned["game_id"])
                        current = team_games[key].get(game_key)
                        if current is None:
                            team_games[key][game_key] = {
                                "team_score": number(str(cleaned["team_score"])),
                                "opponent_score": number(str(cleaned["opponent_score"])),
                            }
                        else:
                            current["team_score"] = max(float(current["team_score"] or 0), float(cleaned["team_score"] or 0))
                            current["opponent_score"] = max(float(current["opponent_score"] or 0), float(cleaned["opponent_score"] or 0))
                        totals = team_totals[key]
                        totals["plays"] += 1
                        type_key = (int(cleaned["season"]), str(cleaned["team"]), str(cleaned["conference"]), str(cleaned["play_type"]))
                        play_type_totals[type_key]["plays"] += 1
                        for stat in ("rush_yds", "reception_yds", "completion_yds"):
                            value = cleaned[stat]
                            if isinstance(value, (int, float)):
                                totals[stat] += value
                                play_type_totals[type_key][stat] += value
                        totals["touchdowns"] += int(cleaned["touchdown"] or 0)
                        totals["field_goals"] += int(cleaned["field_goal_made"] or 0)

    team_rows = []
    for (season, team, conference), games in sorted(team_games.items()):
        wins = losses = ties = points_for = points_against = 0
        for game in games.values():
            scored = float(game["team_score"] or 0)
            allowed = float(game["opponent_score"] or 0)
            points_for += scored
            points_against += allowed
            if scored > allowed:
                wins += 1
            elif scored < allowed:
                losses += 1
            else:
                ties += 1
        totals = team_totals[(season, team, conference)]
        games_count = len(games)
        team_rows.append({
            "season": season,
            "team": team,
            "conference": conference,
            "games": games_count,
            "wins": wins,
            "losses": losses,
            "ties": ties,
            "win_pct": round((wins + ties * 0.5) / games_count, 4) if games_count else 0,
            "points_for": points_for,
            "points_against": points_against,
            "point_diff": points_for - points_against,
            "plays": totals["plays"],
            "yards": round(totals["rush_yds"] + totals["reception_yds"] + totals["completion_yds"], 1),
            "touchdowns": totals["touchdowns"],
            "field_goals": totals["field_goals"],
        })

    panel_output = OUTPUT / "football_team_seasons.json"
    panel_output.write_text(json.dumps({
        "source": {
            "name": "cfbfastR-data college football event files",
            "url_template": URL,
            "seasons": list(YEARS),
            "event_unit": "one team-attributed play in one college football game",
            "rollup_unit": "one team in one season",
        },
        "rows": team_rows,
    }, indent=2) + "\n", encoding="utf-8")

    play_type_rows = []
    for (season, team, conference, kind), totals in sorted(play_type_totals.items()):
        play_type_rows.append({
            "season": season,
            "team": team,
            "conference": conference,
            "play_type": kind,
            "plays": totals["plays"],
            "yards": round(totals["rush_yds"] + totals["reception_yds"] + totals["completion_yds"], 1),
            "touchdowns": totals["touchdowns"],
            "field_goals": totals["field_goals"],
        })
    (OUTPUT / "football_play_types.json").write_text(json.dumps({"rows": play_type_rows}, indent=2) + "\n", encoding="utf-8")

    manifest = {
        "dataset": "College football event panel, 2021–2025",
        "source": "sportsdataverse/cfbfastR-data",
        "source_url": "https://github.com/sportsdataverse/cfbfastR-data",
        "source_file_pattern": URL,
        "event_file": "data/football_plays_2021_2025.csv.gz",
        "browser_rollup": "data/football_team_seasons.json",
        "browser_play_type_rollup": "data/football_play_types.json",
        "rows": rows_written,
        "columns": len(FIELDS),
        "time_column": "season",
        "group_columns": ["team", "conference", "opponent"],
        "categorical_columns": ["team", "conference", "opponent", "play_type"],
        "numeric_columns": [field for field in FIELDS if field in NUMERIC],
        "periods": list(YEARS),
        "groups": len({row["team"] for row in team_rows}),
        "rows_in_browser_rollup": len(team_rows),
        "rows_in_play_type_rollup": len(play_type_rows),
        "note": "The compressed event file is the qualifying dataset. The browser uses a reproducible team-season aggregation for responsive filtering.",
    }
    (OUTPUT / "football_dataset_manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    if rows_written < 50000 or len(team_rows) < 10:
        raise ValueError("The qualifying panel did not meet the assignment thresholds.")
    print(json.dumps({"event_rows": rows_written, "columns": len(FIELDS), "team_season_rows": len(team_rows), "play_type_rows": len(play_type_rows), "teams": manifest["groups"], "periods": list(YEARS)}, indent=2))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-dir", type=Path, help="Directory containing player_stats_YYYY.csv files")
    args = parser.parse_args()
    build(args.source_dir)
