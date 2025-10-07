# Quick Fix Steps - Run This Now!

## Step 1: Start Your Application
Your application should now start successfully (DataSeedingService is temporarily disabled).

## Step 2: Fix Database Schema

### Option A: Using pgAdmin (Easiest)
1. Open **pgAdmin**
2. Connect to your PostgreSQL server
3. Right-click on **filiup** database → **Query Tool**
4. Copy and paste this SQL:

```sql
-- Make content column nullable
ALTER TABLE activities ALTER COLUMN content DROP NOT NULL;

-- Add new columns if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='activities' AND column_name='title') THEN
        ALTER TABLE activities ADD COLUMN title VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='activities' AND column_name='instructions') THEN
        ALTER TABLE activities ADD COLUMN instructions TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='activities' AND column_name='story_text') THEN
        ALTER TABLE activities ADD COLUMN story_text TEXT;
    END IF;
END $$;
```

5. Click **Execute** (F5)
6. You should see: "Query returned successfully"

### Option B: Using DBeaver
1. Open **DBeaver**
2. Connect to your **filiup** database
3. Click **SQL Editor** (or press Ctrl+])
4. Paste the SQL from Option A
5. Click **Execute SQL Statement** (Ctrl+Enter)

### Option C: Using Command Line (if psql is in PATH)
```bash
cd "d:\School\a Year4 sem1\FiliUp\Backend"
psql -U postgres -d filiup -f fix_database_schema.sql
```

## Step 3: Enable Data Seeding

After running the SQL, go back to `DataSeedingService.java` and uncomment the seeding code:

**Change this:**
```java
@Override
@Transactional
public void run(String... args) throws Exception {
    // TEMPORARILY DISABLED
    log.warn("DataSeedingService is DISABLED...");
    /*
    if (phaseRepository.count() == 0) {
        log.info("Seeding database...");
        seedDatabase();
    }
    */
}
```

**To this:**
```java
@Override
@Transactional
public void run(String... args) throws Exception {
    if (phaseRepository.count() == 0) {
        log.info("Seeding database with initial FiliUp content...");
        seedDatabase();
        log.info("Database seeding completed!");
    }
}
```

## Step 4: Restart Application
Restart your Spring Boot application. You should see:
```
Seeding database with initial FiliUp content...
Database seeding completed!
```

## Verification
Check your database:
```sql
SELECT COUNT(*) FROM phases;      -- Should return 2
SELECT COUNT(*) FROM lessons;     -- Should return 4
SELECT COUNT(*) FROM activities;  -- Should return multiple
```

## Still Having Issues?

### If you can't access pgAdmin or DBeaver:
1. Download and install **pgAdmin** from: https://www.pgadmin.org/download/
2. Or use **DBeaver** from: https://dbeaver.io/download/

### If the SQL fails:
Make sure you're connected to the **filiup** database, not the **postgres** database.

### Need to start fresh?
```sql
DROP DATABASE filiup;
CREATE DATABASE filiup;
```
Then restart your application - Hibernate will create all tables automatically.
