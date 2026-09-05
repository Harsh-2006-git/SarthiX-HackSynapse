from pathlib import Path

import pandas as pd


SOURCE = Path(r"E:\Downloads\data.xlsx")
OUTPUT = Path("outputs/ujjain_crime_counts.csv")


def clean_text(value):
    if pd.isna(value):
        return None
    return " ".join(str(value).split())


def main():
    sheet = pd.read_excel(SOURCE, sheet_name="Sheet1", header=None)

    region_row = sheet[sheet.iloc[:, 1].astype(str).str.strip().eq("Ujjain")]
    if region_row.empty:
        raise ValueError("Could not find the Ujjain record in Sheet1.")
    ujjain = region_row.iloc[0]

    categories = []
    active_category = None
    for column in range(2, sheet.shape[1]):
        category = clean_text(sheet.iat[0, column])
        metric = clean_text(sheet.iat[1, column])
        value = ujjain.iat[column]

        if category:
            active_category = category
        if pd.isna(value):
            continue

        categories.append(
            {
                "region": "Ujjain",
                "crime_category": active_category,
                "crime_metric": metric or active_category,
                "reported_crime_count": int(value),
            }
        )

    result = pd.DataFrame(categories)
    if result.empty:
        raise ValueError("No crime counts were found for Ujjain in Sheet1.")

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    result.to_csv(OUTPUT, index=False, encoding="utf-8")
    print(f"Wrote {len(result)} rows to {OUTPUT.resolve()}")
    print(result.head(10).to_csv(index=False))


if __name__ == "__main__":
    main()
