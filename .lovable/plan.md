

# Spendly — Expense Tracker App

## Overview
A full-featured expense tracking web app with Supabase backend, user authentication, income/expense management, savings tracking, analytics dashboard, and PDF export.

## Authentication & Profiles
- Email/password signup and login with Supabase Auth
- User profile page with display name and avatar upload (Supabase Storage bucket)
- Protected routes — redirect unauthenticated users to login

## Database Schema (Supabase)
- **profiles** table: id, user_id, display_name, avatar_url, created_at
- **categories** table: id, user_id (nullable for defaults), name, type (income/expense), icon, is_default
- **transactions** table: id, user_id, category_id, amount, type (income/expense), description, date, created_at
- Preset default categories (Food, Transport, Bills, Entertainment, Shopping, Health, Salary, Freelance, etc.) + users can add custom ones
- RLS policies so users only see their own data

## Core Features

### Add Transaction
- Quick-add form: amount, type (income/expense), category picker, description, date
- Floating "+" button for fast entry on mobile

### Transaction List
- View all transactions with filters: date range, type, category
- Search by description
- Edit and delete transactions

### Dashboard & Analytics
- **Summary cards**: Total income, total expenses, net savings (current month)
- **Pie chart**: Expense breakdown by category
- **Bar chart**: Monthly income vs. expenses (last 6 months)
- **Line chart**: Savings trend over time
- Built with Recharts library

### Categories Management
- View preset + custom categories
- Add/edit/delete custom categories with icon selection

### Monthly PDF Export
- Select a month → generate a downloadable PDF report
- Report includes: summary totals, category breakdown, full transaction list
- Generated client-side using jsPDF

## UI & Design
- Clean, modern design with the Spendly brand (green primary accent for money theme)
- Fully responsive — mobile-first layout
- Bottom navigation on mobile, sidebar on desktop
- Light mode with polished card-based layout
- shadcn/ui components throughout

## Pages
1. **Login / Signup** — auth forms with toggle
2. **Dashboard** — summary cards + charts
3. **Transactions** — full list with filters
4. **Add/Edit Transaction** — form dialog
5. **Categories** — manage categories
6. **Profile** — user info and avatar
7. **Export** — month picker + PDF download

