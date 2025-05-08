#!/usr/bin/env python3
"""
generate_mock.py
─────────────────────────────────────────────────────────────
Create one JSON file per <location>-<yyyy-mm-dd>.json

• Time range : 08:00 → 20:00 (every 30 min: 25 columns)
• Busy slots : ≈ 1 in 10 (“busy”), rest “free”
• Rooms      : 10 rooms  (A … J) with capacities 5/6
• CLI usage  :
      python generate_mock.py                # default (today +30 d, 3 locs)
      python generate_mock.py 2025-05-01     # start date +30 d
      python generate_mock.py 2025-05-01 --days 14 --loc sel wadsworth
"""

import argparse, datetime as dt, json, os, pathlib, random, sys, textwrap

# ─────────── argparse ────────────────────────────────────────────────────
def positive_int(value: str) -> int:
    ivalue = int(value)
    if ivalue <= 0:
        raise argparse.ArgumentTypeError("must be a positive integer")
    return ivalue

p = argparse.ArgumentParser(
    formatter_class=argparse.RawDescriptionHelpFormatter,
    description=textwrap.dedent(__doc__))

p.add_argument("start",
               nargs="?",
               default=dt.date.today().isoformat(),
               help="start date (yyyy-mm-dd)")
p.add_argument("--days", "-n",
               type=positive_int,
               default=30,
               help="how many consecutive days to create (default 30)")
p.add_argument("--loc", "--location",
               metavar="SLUG",
               nargs="*",
               help="location slug(s) like du-bois sel wadsworth "
                    "(use menu values; default = all three)")

args = p.parse_args()

try:
    START = dt.date.fromisoformat(args.start)
except ValueError as e:
    p.error(f"bad date '{args.start}': {e}")

LOCATIONS = args.loc or ["du-bois", "sel", "wadsworth"]   # menu slugs
DAYS      = args.days
BUSY_CHANCE = 0.10
SEED = 42

# ─────────── constants ───────────────────────────────────────────────────
ROOMS = (
    [{"name": "Group Study A", "cap": 5}] +
    [{"name": f"Group Study {c}", "cap": 6}
     for c in "BCDEFGHIJ"]
)

TIMES = [
    (START + dt.timedelta(minutes=30*i)). \
        replace(year=1, month=1, day=1).strftime("%-H:%M" if os.name != "nt"
                                                 else "%#H:%M")
    for i in range(25)
]

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT  = ROOT / "server" / "data" / "rooms"
OUT.mkdir(parents=True, exist_ok=True)

rng = random.Random(SEED)

# ─────────── generate ────────────────────────────────────────────────────
for d in range(DAYS):
    day = START + dt.timedelta(days=d)
    ds  = day.isoformat()

    for loc in LOCATIONS:
        data = {"rooms": ROOMS, "slots": []}

        for _ in ROOMS:
            row = {t: ("busy" if rng.random() < BUSY_CHANCE else "free")
                   for t in TIMES}
            data["slots"].append(row)

        fname = f"{loc}-{ds}.json"
        with open(OUT / fname, "w", encoding="utf8") as f:
            json.dump(data, f, indent=2)

        print("✔︎", fname)

print(f"Done. {DAYS*len(LOCATIONS)} file(s) in  {OUT.relative_to(ROOT)}")
