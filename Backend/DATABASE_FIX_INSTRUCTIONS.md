# Database Schema Fix Instructions

## Problem
The application is failing to start because the `activities` table has a `NOT NULL` constraint on the `content` column, but the new implementation doesn't always provide this value (since we're using structured entities instead).

## Solution

### Option 1: Run SQL Script (Recommended)
1. Open your PostgreSQL client (pgAdmin, DBeaver, or psql)
2. Connect to your `filiup` database
3. Run the SQL script located at: `Backend/fix_database_schema.sql`

**Using psql command line:**
```bash
psql -U postgres -d filiup -f "d:\School\a Year4 sem1\FiliUp\Backend\fix_database_schema.sql"
```

**Using pgAdmin:**
1. Open pgAdmin
2. Connect to your PostgreSQL server
3. Select the `filiup` database
4. Open Query Tool (Tools > Query Tool)
5. Open the `fix_database_schema.sql` file
6. Execute the script

### Option 2: Drop and Recreate Database (Clean Start)
If you don't have important data:

```sql
-- Connect to postgres database first
DROP DATABASE IF EXISTS filiup;
CREATE DATABASE filiup;
```

Then restart your application. Hibernate will create all tables with the correct schema, and the DataSeedingService will populate initial content.

## What the Fix Does

1. **Makes `content` column nullable** - Since we now use structured entities (Question, DragDropItem, etc.) instead of storing everything in JSON
2. **Adds new columns to activities table**:
   - `title` - Activity title
   - `instructions` - Activity instructions
   - `story_text` - Story content for Story Comprehension activities

3. **Creates new tables**:
   - `questions` - For Multiple Choice and Story Comprehension questions
   - `drag_drop_items` - For drag and drop items
   - `drag_drop_categories` - For drag and drop categories
   - `matching_pairs` - For matching pairs activities
   - `lesson_slides` - For lesson content slides

4. **Creates indexes** - For optimal query performance

## After Running the Fix

1. Restart your Spring Boot application
2. The DataSeedingService will automatically populate the database with FiliUp content
3. Check the console logs to verify successful seeding
4. Test the new API endpoints

## Verification

After the application starts successfully, you should see:
```
Seeding database with initial FiliUp content...
Database seeding completed!
```

You can verify the data by querying:
```sql
SELECT * FROM phases;
SELECT * FROM lessons;
SELECT * FROM activities;
SELECT * FROM questions;
SELECT * FROM lesson_slides;
```

## Troubleshooting

### If you still get errors:
1. Check that all foreign key constraints are satisfied
2. Verify PostgreSQL version supports JSONB (9.4+)
3. Ensure the postgres user has proper permissions
4. Check application.properties for correct database credentials

### Common Issues:
- **Connection refused**: Make sure PostgreSQL is running
- **Authentication failed**: Check username/password in application.properties
- **Database doesn't exist**: Create the database first
- **Permission denied**: Grant necessary permissions to postgres user

## Need Help?
Check the application logs for detailed error messages and stack traces.
