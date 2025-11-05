import sqlite3
from pathlib import Path


def main():
    # Compute path to backend/instance/app.db relative to this script
    repo_root = Path(__file__).resolve().parents[1]
    db_path = repo_root / "instance" / "app.db"

    if not db_path.exists():
        print(f"Database file not found at {db_path}. Run the app once to create it.")
        return

    print(f"Opening database: {db_path}")
    conn = sqlite3.connect(str(db_path))
    try:
        cur = conn.cursor()
        # Check if column already exists
        cur.execute("PRAGMA table_info(products);")
        cols = [row[1] for row in cur.fetchall()]
        if "image_url" in cols:
            print("Column image_url already exists. Nothing to do.")
            return

        print("Adding column image_url to products table...")
        cur.execute("ALTER TABLE products ADD COLUMN image_url VARCHAR(2048);")
        conn.commit()
        print("Migration completed successfully.")
    except Exception as e:
        print(f"Migration failed: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    main()

