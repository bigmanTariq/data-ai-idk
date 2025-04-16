# Data Analysis Dojo - Admin Guide

This guide explains how to use the admin features in Data Analysis Dojo.

## Accessing the Admin Dashboard

1. Log in with an admin account (email: admin@example.com, password: admin123)
2. Click on your profile in the top right corner
3. Select "Admin Dashboard" from the dropdown menu

## Admin Dashboard Overview

The admin dashboard provides a central hub for managing all aspects of the Data Analysis Dojo platform:

- **Dashboard**: View key metrics and recent activity
- **Users**: Manage user accounts and progress
- **Modules**: Create and organize learning modules
- **Activities**: Create and manage learning activities
- **Skills**: Define and organize skills

## Managing Modules

Modules are the main organizational units for learning content. Each module represents a chapter or section of the curriculum.

### Creating a Module

1. Go to Admin > Modules
2. Click "Add module"
3. Fill in the following information:
   - **Title**: The name of the module
   - **Description**: A brief description of the module
   - **Order**: The position of the module in the learning path (1, 2, 3, etc.)
4. Click "Create Module"

### Editing a Module

1. Go to Admin > Modules
2. Find the module you want to edit
3. Click "Edit"
4. Update the module information
5. Click "Update Module"

### Deleting a Module

1. Go to Admin > Modules
2. Find the module you want to delete
3. Click "Delete"
4. Confirm the deletion

Note: You cannot delete a module that contains activities. You must first delete or move all activities in the module.

## Managing Skills

Skills represent the specific competencies that users can develop through the platform.

### Creating a Skill

1. Go to Admin > Skills
2. Click "Add skill"
3. Fill in the following information:
   - **Skill Name**: A unique identifier for the skill (e.g., "pandas-filtering")
   - **Description**: A brief description of the skill
   - **Category**: The category the skill belongs to (e.g., "Pandas", "NumPy")
4. Click "Create Skill"

### Editing a Skill

1. Go to Admin > Skills
2. Find the skill you want to edit
3. Click "Edit"
4. Update the skill information
5. Click "Update Skill"

### Deleting a Skill

1. Go to Admin > Skills
2. Find the skill you want to delete
3. Click "Delete"
4. Confirm the deletion

Note: You cannot delete a skill that is associated with activities or user proficiencies.

## Managing Activities

Activities are the learning exercises that users complete to develop their skills.

### Activity Types

There are four types of activities:

1. **Learn Quiz**: Multiple-choice quizzes to test understanding of concepts
2. **Practice Drill**: Focused coding exercises targeting specific skills
3. **Apply Challenge**: Multi-step challenges that integrate multiple skills
4. **Assess Test**: Comprehensive tests to demonstrate mastery

### Creating an Activity

1. Go to Admin > Activities
2. Click "Add activity"
3. Fill in the basic information:
   - **Title**: The name of the activity
   - **Description**: A brief description of the activity
   - **Activity Type**: The type of activity (Learn Quiz, Practice Drill, etc.)
   - **Module**: The module the activity belongs to
   - **Order**: The position of the activity within the module
   - **XP Reward**: The amount of XP awarded for completing the activity
4. Select the skills associated with the activity
5. Create the activity content in JSON format (use the "Generate Template" button for guidance)
6. Click "Create Activity"

### Activity Content Format

Each activity type has a specific JSON format:

#### Learn Quiz

```json
{
  "questions": [
    {
      "id": "1",
      "text": "Question text goes here",
      "options": [
        { "id": "a", "text": "Option A" },
        { "id": "b", "text": "Option B" },
        { "id": "c", "text": "Option C" },
        { "id": "d", "text": "Option D" }
      ]
    }
  ],
  "correctAnswers": {
    "1": "a"
  }
}
```

#### Practice Drill

```json
{
  "instructions": "<p>Instructions for the practice drill go here.</p>",
  "initialCode": "# Your code here\n\n",
  "testCases": [
    {
      "input": "example input",
      "expectedOutput": "example output"
    }
  ]
}
```

#### Apply Challenge

```json
{
  "steps": [
    {
      "id": "1",
      "title": "Step 1",
      "instructions": "<p>Instructions for step 1 go here.</p>",
      "initialCode": "# Your code here\n\n"
    },
    {
      "id": "2",
      "title": "Step 2",
      "instructions": "<p>Instructions for step 2 go here.</p>",
      "initialCode": "# Your code here\n\n"
    }
  ],
  "expectedOutputs": {
    "1": "expected output for step 1",
    "2": "expected output for step 2"
  }
}
```

#### Assess Test

```json
{
  "instructions": "<p>Instructions for the assessment test go here.</p>",
  "initialCode": "# Your code here\n\n",
  "assessmentCriteria": [
    {
      "name": "Functionality",
      "description": "Code correctly implements the required functionality",
      "weight": 0.5
    },
    {
      "name": "Efficiency",
      "description": "Solution is efficient",
      "weight": 0.3
    },
    {
      "name": "Code Quality",
      "description": "Code is well-structured and follows best practices",
      "weight": 0.2
    }
  ]
}
```

### Editing an Activity

1. Go to Admin > Activities
2. Find the activity you want to edit
3. Click "Edit"
4. Update the activity information
5. Click "Update Activity"

### Deleting an Activity

1. Go to Admin > Activities
2. Find the activity you want to delete
3. Click "Delete"
4. Confirm the deletion

Note: You cannot delete an activity that has user progress associated with it.

## Managing Users

The Users section allows you to view and manage user accounts.

### User Information

For each user, you can see:

- Name and email
- Role (User or Admin)
- Level and XP
- Join date

### Making a User an Admin

To make a user an admin, you need to update the database directly:

1. Use Prisma Studio: `npx prisma studio`
2. Navigate to the User model
3. Find the user you want to make an admin
4. Set the `isAdmin` field to `true`
5. Save the changes

## Best Practices

### Content Organization

- Organize modules in a logical progression from basic to advanced concepts
- Within each module, follow the Learn -> Practice -> Apply -> Assess cycle
- Ensure each activity is associated with relevant skills
- Use consistent naming conventions for skills and categories

### Activity Design

- Write clear, concise instructions
- Provide appropriate initial code for coding exercises
- Create comprehensive test cases for auto-grading
- Balance difficulty to maintain engagement without frustration

### Skill Management

- Create granular skills that represent specific competencies
- Group related skills into meaningful categories
- Ensure skills are consistently applied across activities

## Troubleshooting

### Common Issues

- **Cannot delete a module**: Ensure all activities in the module are deleted first
- **Cannot delete a skill**: Check if the skill is associated with any activities or user proficiencies
- **Cannot delete an activity**: Check if any users have progress for this activity

### Error Handling

If you encounter errors:

1. Check the browser console for error messages
2. Verify that your JSON content is correctly formatted
3. Ensure all required fields are filled in
4. Check for duplicate order numbers within modules

For persistent issues, check the server logs or contact the development team.
