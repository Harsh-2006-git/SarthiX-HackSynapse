from pathlib import Path

import pandas as pd


INPUT = Path("outputs/ujjain_crime_counts.csv")
OUTPUT = Path("outputs/ujjain_zone_crime_estimates.csv")

# These are the project's configured zone capacities in Frontend/src/pages/AdminPage.jsx.
ZONES = [
    (1, "Mahakaleshwar Mandir", 100),
    (2, "Ram Ghat", 50),
    (3, "Kshipra Bridge", 40),
    (4, "Harsiddhi Mandir", 80),
    (5, "Bada Ganesh Mandir", 30),
    (6, "Kal Bhairav Mandir", 60),
]


def largest_remainder(total, weights):
    """Allocate an integer total proportionally while retaining the exact total."""
    weight_total = sum(weights)
    raw = [total * weight / weight_total for weight in weights]
    allocated = [int(value) for value in raw]
    remainder = total - sum(allocated)
    order = sorted(
        range(len(weights)),
        key=lambda index: (raw[index] - allocated[index], weights[index]),
        reverse=True,
    )
    for index in order[:remainder]:
        allocated[index] += 1
    return allocated


def main():
    source = pd.read_csv(INPUT)
    weights = [zone[2] for zone in ZONES]
    rows = []

    for record in source.itertuples(index=False):
        allocations = largest_remainder(int(record.reported_crime_count), weights)
        for (zone_id, zone_name, capacity_weight), allocated_count in zip(ZONES, allocations):
            rows.append(
                {
                    "zone_id": zone_id,
                    "zone_name": zone_name,
                    "source_geography": "Ujjain district",
                    "is_estimate": True,
                    "project_capacity_weight": capacity_weight,
                    "allocation_share": round(capacity_weight / sum(weights), 6),
                    "crime_category": record.crime_category,
                    "crime_metric": record.crime_metric,
                    "district_reported_crime_count": int(record.reported_crime_count),
                    "estimated_zone_crime_count": allocated_count,
                    "allocation_method": "project-capacity-weighted largest-remainder estimate",
                }
            )

    result = pd.DataFrame(rows)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    result.to_csv(OUTPUT, index=False, encoding="utf-8")

    checks = result.groupby(["crime_category", "crime_metric"], dropna=False).agg(
        district_count=("district_reported_crime_count", "first"),
        allocated_count=("estimated_zone_crime_count", "sum"),
    )
    if not checks.district_count.equals(checks.allocated_count):
        raise ValueError("At least one zonal allocation does not reconcile to its district total.")

    print(f"Wrote {len(result)} rows to {OUTPUT.resolve()}")
    print(result[result.crime_category.eq("Total Crime against Women (IPC/BNS + SLL Crimes)")].to_csv(index=False))


if __name__ == "__main__":
    main()
