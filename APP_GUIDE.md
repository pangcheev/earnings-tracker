# Earnings Tracker - Complete User Guide

## What is the Earnings Tracker?

The Earnings Tracker is a simple web application that helps you record and track your massage therapy sessions and earnings. Instead of writing everything down on paper, you can quickly log each session on your phone or computer, and the app automatically calculates your total earnings for the day.

Think of it like a digital notebook that organizes all your work sessions and money earned in one place.

---

## How to Use the App

### 1. **Logging In**

When you first open the app, you'll see a login screen.
- Enter the password: `earnings2026`
- Click **Login**

This password protects your personal earnings data.

---

### 2. **Which Location Are You Working At?**

After logging in, you'll see two buttons at the top:
- **Soul Bridge Healing** (for Soul Bridge sessions)
- **Halo Therapies** (for Halo sessions)

Choose which location you're working at today. Your earnings will be tracked separately for each location.

---

### 3. **Adding a Session**

A "session" is one massage appointment with a client.

**To add a session:**

1. Click the **"Add Session"** button (usually a green button)
2. Fill in the details:
   - **Date**: Pick the date of your session (defaults to today)
   - **Service Type**: Choose what type of massage you did
     - Massage
     - Deep Tissue
     - Advanced Bodywork
   - **Duration**: How long did the session last? (in minutes)
   - **Rate**: How much you charge per hour (the app will calculate the total)
   - **Add-ons**: Any extra services? (like aromatherapy, hot stones, etc.)
   - **Tips**: Did the client tip you?
   - **Review Bonus**: Did you get a client review? (Halo only - this adds $5 bonus)

3. Click **Save Session**

The session is now recorded and appears in your list below.

---

### 4. **Your Daily Earnings Summary**

At the top of the screen, you'll see cards showing:
- **Total Earnings**: All money made today (services + add-ons + tips)
- **Services + Add-ons**: Breakdown of service income
- **Tips**: Total tips received

These numbers update automatically as you add sessions.

---

### 5. **Viewing Sessions**

All your sessions for the day are listed below the summary.

For each session, you can see:
- Date and time
- Service type
- Duration
- Money earned
- Add-ons and tips

You can:
- **Edit**: Click the session to make changes
- **Delete**: Click the trash icon to remove it

---

### 6. **Navigating Between Days**

Notice the date picker at the top with arrows (← →):
- Click **←** to view yesterday
- Click **→** to view tomorrow

This lets you view, add, and manage sessions for any day.

---

### 7. **Closing Out Your Day**

When you're done working for the day and ready to lock it:

1. Click the **"Close Day"** button (purple button)
2. Confirm: "Close out this day?"
3. The day will be locked and show as "✅ CLOSED"

**Why close your day?** It prevents you from accidentally adding more sessions to a day you've already finished.

**Can you reopen it?** Yes! Click **"Reopen Day"** if you need to make changes later.

---

### 8. **Copying Your Earnings**

**At Halo Therapies**, there's a special section called "Daily Payroll Tally" that shows your earnings in text format—perfect for sending to your manager.

**Two copy options:**

1. **"Copy Detailed"** → Copies all sessions with breakdown (Session 1, Session 2, etc.)
2. **"Copy Totals Only"** → Copies just the final numbers (faster for quick reports)

**How to use it:**
- Click one of the copy buttons
- The text is ready to paste into an email, text message, or notes
- Paste it (Press Ctrl+V or Cmd+V)

Example of what gets copied:
```
HALO THERAPIES - PANG VANG
DATE: February 18, 2026
Sessions: 3

massage: $60.00
deep tissue: $90.00
add ons: $30.00
review: $5.00
tips: $20.00
total: $205.00
```

---

### 9. **Downloading Your Data**

Click the **"Export"** button (with download icon) to save a copy of your earnings to your computer as a text file.

This is useful for:
- Keeping backups
- Printing records
- Sharing with an accountant

---

### 10. **Resting Backup & Restore**

**Backup ("Backup" button):**
- Creates a backup of all your sessions
- Saves as a file you can download
- Good to do once a week as a safety backup

**Restore ("Restore" button):**
- If you lose your data or reinstall the app, you can restore from a backup file
- Choose the backup file from your computer
- All your old sessions return

---

## Meeting Two Locations

### Soul Bridge Healing (Owner)

You see:
- Your daily earnings total
- Session breakdown (services, add-ons, tips)
- Simple earnings summary

### Halo Therapies (Independent Contractor)

You see:
- More detailed breakdown (massage, deep tissue, add-ons, review bonuses, tips)
- Special "Daily Payroll Tally" section for reporting
- Designed for submitting earnings reports to Halo management

---

## How Your Data Gets Saved

### Two Ways Your Data is Protected

When you add a session, it's saved in **two places**:

#### 1. **Your Phone/Computer (Local Storage)**
- This is like a notepad on your device
- Works even without internet
- If you clear your app data, it deletes these sessions

#### 2. **Cloud Storage (Supabase)**
- This is a secure online backup
- Your data lives on secure servers
- You can access it from any device
- It never disappears unless you delete it

**Why two places?** One is fast (local), one is secure and shareable (cloud).

---

## Understanding Supabase (Where Your Data Lives Online)

### What is Supabase?

Supabase is a **secure online storage service** for your data. Think of it like a bank vault for your information—it's stored safely online where you can access it anytime, from anywhere.

### What Gets Uploaded to Supabase?

Every time you:
- Add a session ✅ Uploaded
- Edit a session ✅ Uploaded
- Delete a session ✅ Removed from cloud

Your data automatically syncs to Supabase. You don't have to do anything—it's automatic.

### Why Use Supabase?

1. **Backup**: If you lose your phone, your data is safe in the cloud
2. **Access from anywhere**: Log in from your phone, computer, or tablet—you see the same sessions
3. **Security**: Your data is encrypted and protected
4. **No data loss**: Sessions are never lost if you reinstall the app

### How Does the App Know to Upload?

The app is programmed to check:
1. Do I have login credentials for Supabase? ✅
2. Is there internet connection? ✅
3. Did something change (new session, edit, delete)? ✅

If all three are yes, it automatically uploads. If not, it saves locally and tries again later.

---

## Understanding Vercel (Where the App Lives Online)

### What is Vercel?

Vercel is a **hosting service** that makes your app available on the internet. Instead of running the app only on your computer, Vercel hosts it on internet servers so you can access it from anywhere using a web link.

Think of it like this:
- Your app code = a book
- Your computer = your bookshelf at home
- Vercel = a library that's open 24/7 for everyone to visit

### What is the App URL?

You access the app at:
```
https://earnings-tracker-tawny.vercel.app
```

This is your app's address on the internet. Anyone with this link can open the app (after logging in).

### How Vercel Helps Your App Work

1. **Always Online**: Your app runs on Vercel's servers, not just on your computer
2. **Fast**: Vercel serves your app from servers close to you (reduced lag)
3. **Automatic Updates**: When you make code changes, Vercel automatically updates the app
4. **Secure**: Vercel handles security, backups, and technical stuff

### The App Journey (Step-by-Step)

When you open your app:

1. **You type the URL** → `https://earnings-tracker-tawny.vercel.app`
2. **Vercel sends the app to your phone/computer**
3. **The app loads and asks: Do you have internet?**
4. **You log in** → App verifies your password
5. **You add a session**
6. **App saves locally** (so it works offline)
7. **App checks internet** → Finds it's connected
8. **App uploads to Supabase** ☁️ (your data syncs online)
9. **You're all set!** ✅

### What Happens If You Don't Have Internet?

Don't worry! The app still works offline:
- ✅ You can add sessions
- ✅ You can view sessions
- ✅ Everything saves locally
- ⏸️ Cloud sync waits for internet
- **Once connected**, it automatically uploads to Supabase

---

## The Complete Flow (Your First Week)

### Day 1: Monday
1. Open app on your phone
2. Log in with password
3. Add 3 massage sessions
4. Sessions show immediately
5. Earnings calculated
6. Cloud backup happens automatically ☁️

### Day 2: Tuesday
1. Open app on your computer instead
2. Same login
3. **You see Monday's sessions** (they synced from the cloud!)
4. Add today's sessions on computer
5. Everything syncs to Supabase

### Day 3: Wednesday
1. Go back to phone
2. **All previous sessions are there** (from cloud backup)
3. Add today's sessions
4. See all 3 days of work

### End of Week: Friday
1. Click "Close Day" on Friday
2. Click "Copy Totals"
3. Paste into email to send to manager
4. Everything is backed up online

---

## Troubleshooting

### "App won't load"
- Check your internet connection
- Try refreshing the page
- Clear your browser cache (Settings → Clear History)

### "Sessions not saving to Supabase"
- Make sure you have internet connection
- Check the console (the warning message explains the issue)
- Try logging out and back in

### "I lost my sessions!"
- Don't panic! They're backed up on Supabase
- Open the app from any device
- Log in and they'll appear
- Or restore from your backup file

### "I can't see old sessions"
- Try clicking the **←** arrow to go to previous days
- Sessions are organized by date
- Scroll down to see older sessions

---

## Quick Tips

✅ **Do This:**
- Close out your day when done to prevent accidents
- Back up your data once a week
- Use "Copy Totals" for quick manager reports

❌ **Don't Do This:**
- Don't close your day if you might add more sessions later
- Don't clear your app data without backing up first
- Don't share your login password

---

## Summary

**The Earnings Tracker helps you:**
1. ✅ Log every massage session
2. ✅ Calculate daily earnings automatically
3. ✅ Generate payroll reports for managers
4. ✅ Back up your data safely in the cloud
5. ✅ Access your records from any device

**Behind the scenes:**
- **Supabase** = Your secure online backup
- **Vercel** = The server that hosts your app so you can access it online
- **Your app** = The easy-to-use interface you interact with

**Bottom line:** You have a powerful tool that tracks your work, calculates your pay, and keeps your data safe, all from your phone or computer! 📱💰
