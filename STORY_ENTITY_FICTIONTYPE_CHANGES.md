# Story Entity - Fiction Type Field Addition

## Summary
Added a new `fictionType` field to the `StoryEntity` and updated all related DTOs, Services, and Controllers to support this new field.

## Changes Made

### 1. Entity Changes
**File:** `backend/filiup/src/main/java/edu/cit/filiup/entity/StoryEntity.java`
- Added `fictionType` field with `@Column(name = "fiction_type")` (nullable to support existing data)
- Added getter and setter methods for `fictionType`
- Updated constructor to include `fictionType` parameter
- Updated `toString()` method to include `fictionType`

### 2. DTO Changes

#### StoryCreateDTO
**File:** `backend/filiup/src/main/java/edu/cit/filiup/dto/StoryCreateDTO.java`
- Added `fictionType` field (optional for now to support migration)
- Added getter and setter methods

#### StoryResponseDTO
**File:** `backend/filiup/src/main/java/edu/cit/filiup/dto/StoryResponseDTO.java`
- Added `fictionType` field
- Updated constructor to include `fictionType` parameter
- Added getter and setter methods

#### StoryUpdateDto
**File:** `backend/filiup/src/main/java/edu/cit/filiup/dto/StoryUpdateDto.java`
- Added `fictionType` field
- Added getter and setter methods

#### StoryGenerationRequest
**File:** `backend/filiup/src/main/java/edu/cit/filiup/dto/StoryGenerationRequest.java`
- Added `fictionType` field
- Added getter and setter methods
- Updated `toString()` method

#### ClassDetailsDTO.StoryDTO
**File:** `backend/filiup/src/main/java/edu/cit/filiup/dto/ClassDetailsDTO.java`
- Added `fictionType` field to nested `StoryDTO` class
- Added getter and setter methods
- Updated `fromEntity()` method to map `fictionType`

### 3. Mapper Changes
**File:** `backend/filiup/src/main/java/edu/cit/filiup/mapper/StoryMapper.java`
- Updated `toEntity()` method to map `fictionType` from DTO to entity with null checks
- Updated `toResponseDTO()` method to map `fictionType` from entity to DTO

### 4. Service Changes
**File:** `backend/filiup/src/main/java/edu/cit/filiup/service/StoryService.java`
- Updated `updateStory()` method to handle `fictionType` updates with null checks
- Added new method `getStoriesByFictionType(String fictionType)`

### 5. Repository Changes
**File:** `backend/filiup/src/main/java/edu/cit/filiup/repository/StoryRepository.java`
- Added `findByFictionType(String fictionType)` method
- Added `findByFictionTypeAndIsActiveTrue(String fictionType)` method

### 6. Controller Changes
**File:** `backend/filiup/src/main/java/edu/cit/filiup/controller/StoryController.java`
- Updated logging in `createStory()` method to include `fictionType`
- Updated `getAllStories()` response mapping to include `fictionType`
- Updated `getAllStoriesWithTeacherInfo()` response mapping to include `fictionType`
- Added new endpoint `@GetMapping("/fiction-type/{fictionType}")` to get stories by fiction type

### 7. Database Changes
**IMPORTANT:** Due to existing data in the database, manual migration is required.

#### Migration Steps:
1. **Run the migration script:** Execute `database_migration_fiction_type.sql` on your database before starting the application
2. **Automatic schema update:** The `spring.jpa.hibernate.ddl-auto=update` configuration will handle the column addition if no existing data conflicts

#### Migration Script: `database_migration_fiction_type.sql`
```sql
-- Add the fiction_type column as nullable first
ALTER TABLE stories ADD COLUMN fiction_type VARCHAR(255) NULL;

-- Update existing records with a default value
UPDATE stories SET fiction_type = 'General Fiction' WHERE fiction_type IS NULL;

-- Optionally make the column NOT NULL after data migration
-- ALTER TABLE stories MODIFY COLUMN fiction_type VARCHAR(255) NOT NULL;
```

## New API Endpoints
- `GET /api/story/fiction-type/{fictionType}` - Retrieves all active stories with the specified fiction type

## Validation
- The `fictionType` field is currently optional for story creation (to support migration)
- The field is optional for story updates (can be updated if provided)
- **Note:** You can make this field required later by adding `@NotBlank` validation after migration

## Troubleshooting

### Error: Database constraint violation
If you encounter errors when creating stories, it's likely due to database constraints. Follow these steps:

1. **Stop the application**
2. **Run the migration script** `database_migration_fiction_type.sql` on your database
3. **Restart the application**

### Error: Column already exists
If you get "Column already exists" error, it means Hibernate already tried to create the column. In this case:
1. Check if existing records have `fiction_type` values
2. Run only the UPDATE part of the migration script if needed

## Future Enhancements
- After successful migration, you can make `fictionType` required by:
  - Adding `@NotBlank(message = "Fiction type is required")` to `StoryCreateDTO`
  - Changing the entity column to `@Column(name = "fiction_type", nullable = false)`

## Database Schema Impact
```sql
ALTER TABLE stories ADD COLUMN fiction_type VARCHAR(255) NOT NULL;
```

Note: The actual SQL may vary depending on the database dialect, but Hibernate will handle the column addition automatically. 