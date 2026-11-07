import sqlite3
from pathlib import Path

# Database file location
DATABASE_PATH = Path(__file__).resolve().parent / "threat_intelligence.db"


# Connect to database
def get_connection():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


# Create threat database table
def create_table():
    connection = get_connection()

    connection.execute("""
        CREATE TABLE IF NOT EXISTS threat_domains (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            domain TEXT UNIQUE NOT NULL,
            threat_type TEXT NOT NULL,
            confidence INTEGER NOT NULL,
            source TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    connection.commit()
    connection.close()


# Add a domain to database
def add_domain(domain, threat_type, confidence, source="Community"):

    if not isinstance(confidence, int) or not 0 <= confidence <= 100:
        raise ValueError("Confidence must be between 0 and 100")

    domain = domain.strip().lower().rstrip(".")

    if not domain:
        raise ValueError("Domain cannot be empty")

    connection = get_connection()

    try:
        connection.execute("""
            INSERT INTO threat_domains
            (domain, threat_type, confidence, source)
            VALUES (?, ?, ?, ?)
        """, (domain, threat_type, confidence, source))

        connection.commit()
        return "Domain added successfully"

    except sqlite3.IntegrityError:
        return "Domain already exists"

    finally:
        connection.close()


# Retrieve all stored domains
def get_all_domains():

    connection = get_connection()

    rows = connection.execute("""
        SELECT * FROM threat_domains
        ORDER BY created_at DESC
    """).fetchall()

    connection.close()

    return [dict(row) for row in rows]
