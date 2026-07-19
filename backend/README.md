# SK Bikes — Backend (Supabase)

This folder contains all database-related files for the SK Bikes project.
The backend is powered by **Supabase** (PostgreSQL).

## Database URL
`https://vejcwifgytitwfcdbbdl.supabase.co`

## Files

| File | Description |
|------|-------------|
| `schema.sql` | Creates the `bikes` and `helmets` tables |
| `policies.sql` | Sets up Row Level Security (RLS) policies |

## Setup Instructions

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Open your **SK Bikes** project
3. Click **SQL Editor** in the left sidebar
4. Run `schema.sql` first
5. Then run `policies.sql`
6. Go to **Authentication → Providers** → Enable **Email**
7. Go to **Authentication → Users** → Add your admin user

## Tables

### `bikes`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (auto-generated) |
| name | TEXT | Motorcycle name |
| model | TEXT | Model number/name |
| price | TEXT | Price in Rs. |
| description | TEXT | Description |
| imageUrl | TEXT | Image URL |
| advancedDetails | TEXT | Extra details |
| created_at | TIMESTAMP | Auto-generated |

### `helmets`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (auto-generated) |
| name | TEXT | Helmet name |
| model | TEXT | Model number/name |
| price | TEXT | Price in Rs. |
| description | TEXT | Description |
| imageUrl | TEXT | Image URL |
| created_at | TIMESTAMP | Auto-generated |
