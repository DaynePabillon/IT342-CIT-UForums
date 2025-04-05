# Password Storage Changes

## Overview
This project has been configured to store passwords as plain text instead of using BCrypt encoding. This change was made to simplify development and testing, but **should not be used in a production environment** as it poses significant security risks.

## Changes Made

1. Updated `MemberServiceImpl` to store passwords directly without encoding
2. Modified `WebSecurityConfig` to use `NoOpPasswordEncoder` instead of `BCryptPasswordEncoder`
3. Updated SQL scripts to store plain text passwords
4. Created a schema update script to handle database migrations

## Implementation Instructions

1. Run the database schema update script to modify any existing data:
   ```sql
   psql -U your_username -d your_database -f src/main/resources/schema_update.sql
   ```
   
   Or execute the script directly in your database management tool.

2. Restart the Spring Boot application to apply the configuration changes.

3. Test login with the following credentials:
   - Username: admin123
   - Password: admin123
   
   Or:
   - Username: Dayne2
   - Password: password123

## Security Considerations

**WARNING**: Storing passwords in plain text is a serious security risk and should **never** be used in production environments. This configuration is provided only for development and testing purposes.

Before deploying to production, ensure you:

1. Revert to using `BCryptPasswordEncoder` in `WebSecurityConfig`
2. Update `MemberServiceImpl` to encode passwords before storage
3. Update any test data to use properly encoded passwords

## Troubleshooting

If you encounter login issues after these changes:

1. Check the database to ensure passwords are stored in plain text
2. Verify the SQL update script has run successfully
3. Check application logs for authentication errors
4. Ensure the `NoOpPasswordEncoder` is properly configured in Spring Security 