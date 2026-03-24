#!/usr/bin/env python3
"""Export approved contributions from Supabase to CSV, JSONL, or Parquet."""

import argparse
import csv
import json
import os
import sys

try:
    import psycopg2
except ImportError:
    print("Install psycopg2: pip install psycopg2-binary", file=sys.stderr)
    sys.exit(1)

QUERY = """
SELECT
    id, maya_text, spanish_translation, audio_url,
    contributor_name, dialect::text, source::text, created_at
FROM contributions
WHERE status = 'approved'
  AND consent_given = true
ORDER BY created_at
"""


def get_connection():
    url = os.environ.get("DATABASE_URL")
    if not url:
        print("Set DATABASE_URL to your Supabase PostgreSQL connection string.", file=sys.stderr)
        sys.exit(1)
    return psycopg2.connect(url)


def export_csv(rows, columns, path):
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(columns)
        for row in rows:
            writer.writerow([str(v) if v is not None else "" for v in row])
    print(f"Exported {len(rows)} rows to {path}")


def export_jsonl(rows, columns, path):
    with open(path, "w", encoding="utf-8") as f:
        for row in rows:
            record = {}
            for col, val in zip(columns, row):
                if hasattr(val, "isoformat"):
                    record[col] = val.isoformat()
                else:
                    record[col] = val
            f.write(json.dumps(record, ensure_ascii=False) + "\n")
    print(f"Exported {len(rows)} rows to {path}")


def export_parquet(rows, columns, path):
    try:
        import pyarrow as pa
        import pyarrow.parquet as pq
    except ImportError:
        print("Install pyarrow: pip install pyarrow", file=sys.stderr)
        sys.exit(1)

    data = {col: [row[i] for row in rows] for i, col in enumerate(columns)}
    # Convert datetime to strings for parquet compatibility
    for col in data:
        data[col] = [
            v.isoformat() if hasattr(v, "isoformat") else v for v in data[col]
        ]
    table = pa.table(data)
    pq.write_table(table, path)
    print(f"Exported {len(rows)} rows to {path}")


def main():
    parser = argparse.ArgumentParser(description="Export maayataan corpus")
    parser.add_argument(
        "--format",
        choices=["csv", "jsonl", "parquet"],
        default="csv",
        help="Output format (default: csv)",
    )
    parser.add_argument(
        "--output",
        default=None,
        help="Output file path (default: corpus.<format>)",
    )
    args = parser.parse_args()

    output = args.output or f"corpus.{args.format}"

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(QUERY)
            columns = [desc[0] for desc in cur.description]
            rows = cur.fetchall()
    finally:
        conn.close()

    if not rows:
        print("No approved contributions to export.")
        return

    if args.format == "csv":
        export_csv(rows, columns, output)
    elif args.format == "jsonl":
        export_jsonl(rows, columns, output)
    elif args.format == "parquet":
        export_parquet(rows, columns, output)


if __name__ == "__main__":
    main()
