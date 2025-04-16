# Admin Access Setup Guide

This guide explains how to set up and use the admin features in Data Analysis Dojo.

## Prerequisites

Before setting up admin access, make sure you have:

1. PostgreSQL database installed and running
2. The application set up with the database connection

## Database Migration

To add the admin role to the database schema, run the following command:

```bash
npx prisma migrate dev --name add_admin_role
```

This will create a migration that adds the `isAdmin` field to the User model.

## Creating an Admin User

There are two ways to create an admin user:

### 1. Using the Seed Script

The seed script already includes an admin user with the following credentials:

- Email: admin@example.com
- Password: admin123

To run the seed script:

```bash
npx prisma db seed
```

### 2. Manually Updating a User

You can also manually update an existing user to be an admin using the Prisma CLI:

```bash
npx prisma studio
```

This will open the Prisma Studio interface in your browser. From there:

1. Navigate to the "User" model
2. Find the user you want to make an admin
3. Set the `isAdmin` field to `true`
4. Save the changes

## Accessing Admin Features

Once you have an admin user:

1. Log in with the admin credentials
2. Click on your profile in the top right corner
3. Select "Admin Dashboard" from the dropdown menu

## Admin Features

The admin dashboard provides access to:

1. **Dashboard**: Overview of the platform with key metrics
2. **Users**: Manage user accounts
3. **Modules**: Create, edit, and delete learning modules
4. **Activities**: Manage learning activities
5. **Skills**: Define and organize skills

## Security Considerations

- Admin access is protected by middleware that checks for the `isAdmin` flag
- Only users with the `isAdmin` flag set to `true` can access admin routes
- All admin actions are logged for security purposes

## Troubleshooting

If you encounter issues with admin access:

1. Check that the user has the `isAdmin` flag set to `true` in the database
2. Ensure that the NextAuth session includes the `isAdmin` property
3. Verify that the middleware is correctly configured to protect admin routes

## Next Steps

After setting up admin access, you can:

1. Create and organize learning modules
2. Add activities to modules
3. Define skills and associate them with activities
4. Monitor user progress and engagement
