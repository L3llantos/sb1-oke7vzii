# FitQuest Database Setup

This directory contains SQL scripts to set up the Supabase database for the FitQuest application.

## Setup Instructions

1. **Create a Supabase Project**:
   - Go to [Supabase](https://supabase.com/) and create a new project
   - Note your project URL and anon key (you'll need these for your `.env.local` file)

2. **Run the SQL Scripts**:
   - Open the SQL Editor in your Supabase dashboard
   - Run the scripts in the following order:
     1. `01_master_setup.sql` - Creates all tables
     2. `02_rls_policies.sql` - Sets up Row Level Security policies
     3. `03_initial_data.sql` - Inserts initial data
     4. `04_auth_hooks.sql` - Sets up authentication hooks

3. **Set Up Storage Buckets**:
   - Go to the Storage section in your Supabase dashboard
   - Create the following buckets:
     - `profile-pictures` - For user profile pictures
     - `game-assets` - For game assets (avatars, hats, borders, etc.)

4. **Configure Storage Permissions**:
   - For the `profile-pictures` bucket:
     - Set the policy to allow authenticated users to upload, read, and delete their own files
   - For the `game-assets` bucket:
     - Set the policy to allow public read access
     - Set the policy to allow only admins to upload and delete files

5. **Upload Game Assets**:
   - Upload the game assets to the `game-assets` bucket
   - Make sure the file names match the ones referenced in the code

6. **Update Environment Variables**:
   - Add your Supabase URL and anon key to your `.env.local` file:

