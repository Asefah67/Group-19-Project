#!/usr/bin/env python3
"""
generate_mock.py   – quick mock‑data generator
────────────────────────────────────────────────────────────
• One JSON file per  <location>-<yyyy-mm-dd>.json
• Time range : 08:00 → 20:00 (25 half‑hour columns)
• Rooms      : A … J   (cap 5 for A, cap 6 for B‑J)
• Busy slots : default = 0.20 (20 %)  ⇢ change with  --busy 0.25
• Locations  : default = du‑bois sel wadsworth
• Days       : default = 30   ⇢ change with  --days 14
• Start date : default = today  ⇢ or pass  2025‑05‑01

USAGE examples
──────────────
$ python generate_mock.py                # today +30 d, 3 locations
$ python generate_mock.py 2025-05-01 --days 14 --busy 0.25
$ python generate_mock.py --loc du-bois  # only Du Bois data
"""
import argparse, datetime as dt, json, os, pathlib, random, sys, textwrap

# ───────── CLI parsing ──────────────────────────────────────────────────
def pct(val: str) -> float:
    f = float(val)
    if not 0.0 <= f <= 1.0:
        raise argparse.ArgumentTypeError("percentage must be 0‒1")
    return f

p = argparse.ArgumentParser(
        formatter_class=argparse.RawDescriptionHelpFormatter,
        description=textwrap.dedent(__doc__))

p.add_argument("start", nargs="?", default=dt.date.today().isoformat(),
               help="start date (yyyy-mm-dd)")
p.add_argument("--days", "-n", type=int, default=30,
               help="how many consecutive days (default 30)")
p.add_argument("--busy", "-b", type=pct, default=0.20,
               help="per‑slot busy probability 0‒1 (default 0.20)")
p.add_argument("--loc", "--location", metavar="SLUG", nargs="*",
               help="location slug(s) to generate "
                    "(default = du‑bois sel wadsworth)")

args = p.parse_args()

try:
    START = dt.date.fromisoformat(args.start)
except ValueError as e:
    p.error(f"bad date '{args.start}': {e}")

LOCATIONS   = args.loc or ["du-bois", "sel", "wadsworth"]
DAYS        = max(1, args.days)
BUSY_CHANCE = args.busy
SEED        = 42                 # reproducible

# ───────── constants ───────────────────────────────────────────────────
ROOMS = ( [{"name": "Group Study A", "cap": 5}] +
          [{"name": f"Group Study {c}", "cap": 6} for c in "BCDEFGHIJ"] )

# 25 time‑labels 08:00 … 20:00
TIMES = []
t = dt.datetime.combine(dt.date.today(), dt.time(8, 0))
for _ in range(25):
    TIMES.append(t.strftime("%-H:%M") if os.name != "nt"
                 else t.strftime("%#H:%M"))
    t += dt.timedelta(minutes=30)

# output folder:  server/data/rooms/
ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT  = ROOT / "server" / "data" / "rooms"
OUT.mkdir(parents=True, exist_ok=True)

rng = random.Random(SEED)

# ───────── generate JSON files ─────────────────────────────────────────
for d in range(DAYS):
    day     = START + dt.timedelta(days=d)
    day_iso = day.isoformat()

    for loc in LOCATIONS:
        data = {"rooms": ROOMS, "slots": []}

        for _ in ROOMS:
            row = {t: ("busy" if rng.random() < BUSY_CHANCE else "free")
                   for t in TIMES}
            data["slots"].append(row)

        fname = f"{loc}-{day_iso}.json"
        with open(OUT / fname, "w", encoding="utf8") as f:
            json.dump(data, f, indent=2)
        print("✔︎", fname)

print(f"Done. {DAYS*len(LOCATIONS)} file(s) in  {OUT.relative_to(ROOT)}")
