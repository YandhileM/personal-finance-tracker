# Personal Finance Tracker

A personal finance tracking web app built with Vue 3, Vuetify 3, and Google Sheets as the backend. Track your savings, investments, and daily expenses — all in one place, completely free to host.

---

## Features

- **Investment Dashboard** — track balances across 3 buckets (Savings, TFSA, Normal investment)
- **Progress bar** toward your R25,000 emergency fund goal
- **Weekly growth graphs** per bucket and total wealth
- **Monthly contribution reminder** if you haven't logged anything yet
- **Expense tracking** — log daily expenses by category
- **Category breakdown** with donut chart
- **Monthly spending vs salary** bar chart and trend line chart
- **True Remaining** — salary minus expenses minus contributions = actual cash left
- **Settings** — update salary and manage your own expense categories
- **Light/dark theme toggle**
- **Mobile friendly**

---

## Tech Stack

- Vue 3 with `<script setup>` Composition API
- Vuetify 3 (UI components)
- Pinia (state management)
- Vue Router
- Chart.js + vue-chartjs (graphs)
- Netlify Functions (serverless backend)
- Google Sheets API (data storage)
- Hosted free on Netlify

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- A [GitHub](https://github.com) account
- A [Netlify](https://netlify.com) account (free)
- A [Google](https://google.com) account

---

## Step 1 — Google Sheets Setup

Go to [sheets.google.com](https://sheets.google.com) and create a new blank spreadsheet. Name it anything you like (e.g. `Finance document`).

Create **6 tabs** at the bottom by clicking the `+` icon and renaming each one exactly as shown below.

---

### Tab 1 — `Transactions`

This is where all investment entries are written by the app. No formulas needed.

| Cell | Value    |
| ---- | -------- |
| A1   | `Date`   |
| B1   | `Bucket` |
| C1   | `Type`   |
| D1   | `Amount` |
| E1   | `Note`   |

---

### Tab 2 — `Summary`

This tab auto-calculates balances per investment bucket using SUMIFS formulas.

**Type these labels:**

| Cell | Value             |
| ---- | ----------------- |
| A1   | `Bucket`          |
| B1   | `Total In`        |
| C1   | `Total Out`       |
| D1   | `Current Balance` |
| A2   | `Savings`         |
| A3   | `TFSA`            |
| A4   | `Normal`          |

**Paste these formulas:**

| Cell | Formula                                                                                |
| ---- | -------------------------------------------------------------------------------------- |
| B2   | `=SUMIFS(Transactions!D:D,Transactions!B:B,"Savings",Transactions!C:C,"Contribution")` |
| C2   | `=SUMIFS(Transactions!D:D,Transactions!B:B,"Savings",Transactions!C:C,"Withdrawal")`   |
| D2   | `=B2-C2`                                                                               |
| B3   | `=SUMIFS(Transactions!D:D,Transactions!B:B,"TFSA",Transactions!C:C,"Contribution")`    |
| C3   | `=SUMIFS(Transactions!D:D,Transactions!B:B,"TFSA",Transactions!C:C,"Withdrawal")`      |
| D3   | `=B3-C3`                                                                               |
| B4   | `=SUMIFS(Transactions!D:D,Transactions!B:B,"Normal",Transactions!C:C,"Contribution")`  |
| C4   | `=SUMIFS(Transactions!D:D,Transactions!B:B,"Normal",Transactions!C:C,"Withdrawal")`    |
| D4   | `=B4-C4`                                                                               |

---

### Tab 3 — `WeeklySnapshots`

This tab tracks your running investment balance week by week for the growth graphs.

**Type these labels:**

| Cell | Value             |
| ---- | ----------------- |
| A1   | `Week Ending`     |
| B1   | `Savings Balance` |
| C1   | `TFSA Balance`    |
| D1   | `Normal Balance`  |
| E1   | `Total Wealth`    |

**In cell A2**, type your first week-end date, e.g. `2026-03-23` (use the Sunday of the current week).

**Paste these formulas in row 2:**

| Cell | Formula                                                                                                                                                                                                                                                                                                  |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B2   | `=SUMPRODUCT((Transactions!B$2:B$10000="Savings")*(Transactions!C$2:C$10000="Contribution")*(Transactions!A$2:A$10000<=$A2)*Transactions!D$2:D$10000)-SUMPRODUCT((Transactions!B$2:B$10000="Savings")*(Transactions!C$2:C$10000="Withdrawal")*(Transactions!A$2:A$10000<=$A2)*Transactions!D$2:D$10000)` |
| C2   | `=SUMPRODUCT((Transactions!B$2:B$10000="TFSA")*(Transactions!C$2:C$10000="Contribution")*(Transactions!A$2:A$10000<=$A2)*Transactions!D$2:D$10000)-SUMPRODUCT((Transactions!B$2:B$10000="TFSA")*(Transactions!C$2:C$10000="Withdrawal")*(Transactions!A$2:A$10000<=$A2)*Transactions!D$2:D$10000)`       |
| D2   | `=SUMPRODUCT((Transactions!B$2:B$10000="Normal")*(Transactions!C$2:C$10000="Contribution")*(Transactions!A$2:A$10000<=$A2)*Transactions!D$2:D$10000)-SUMPRODUCT((Transactions!B$2:B$10000="Normal")*(Transactions!C$2:C$10000="Withdrawal")*(Transactions!A$2:A$10000<=$A2)*Transactions!D$2:D$10000)`   |
| E2   | `=B2+C2+D2`                                                                                                                                                                                                                                                                                              |

**Select B2:E2**, then drag the blue square down to **row 210** to pre-fill formulas for ~4 years of weekly data. You will manually add dates in column A each Sunday going forward.

---

### Tab 4 — `Expenses`

This is where all expense entries are written by the app. No formulas needed.

| Cell | Value         |
| ---- | ------------- |
| A1   | `Date`        |
| B1   | `Description` |
| C1   | `Category`    |
| D1   | `Amount`      |

---

### Tab 5 — `ExpenseSummary`

This tab tracks monthly expense totals over time.

**Left section — category reference (not used by app directly):**

| Cell | Value                             |
| ---- | --------------------------------- |
| A1   | `Month`                           |
| B1   | `Category`                        |
| C1   | `Total Spent`                     |
| A2   | `2026-03` _(your starting month)_ |
| B2   | `Groceries`                       |

Formula in C2:

```
=SUMPRODUCT((LEFT(Expenses!A$2:A$10000,7)=A2)*(Expenses!C$2:C$10000=B2)*Expenses!D$2:D$10000)
```

**Right section — monthly totals (used by the app):**

| Cell | Value                             |
| ---- | --------------------------------- |
| E1   | `Month`                           |
| F1   | `Total Spent`                     |
| G1   | `Remaining`                       |
| E2   | `2026-03` _(your starting month)_ |

Formula in F2:

```
=SUMPRODUCT((LEFT(Expenses!A$2:A$10000,7)=E2)*Expenses!D$2:D$10000)
```

Formula in G2:

```
=Settings!$B$2-F2
```

**In cell E3**, paste this formula to auto-generate future months:

```
=TEXT(DATE(LEFT(E2,4),MID(E2,6,2)+1,1),"YYYY-MM")
```

Select E3 and drag it down to **E89** — months will auto-fill all the way through.

Then select **F2:G2** and drag down to **F89:G89**.

---

### Tab 6 — `Settings`

| Cell | Value                                                 |
| ---- | ----------------------------------------------------- |
| A1   | `Key`                                                 |
| B1   | `Value`                                               |
| A2   | `Salary`                                              |
| B2   | `your monthly salary as a number, e.g. 15000`         |
| A3   | `Categories`                                          |
| B3   | `Groceries,Transport,Utilities,Entertainment,Medical` |

---

### Verify the Sheet is working

Go to the **Transactions** tab and add a test row:

| A2           | B2        | C2             | D2     |
| ------------ | --------- | -------------- | ------ |
| `2026-03-21` | `Savings` | `Contribution` | `1000` |

Then check:

- **Summary** D2 should show `1000`
- **WeeklySnapshots** B2 should show `1000`

Delete the test row once confirmed.

---

## Step 2 — Google Cloud Setup

### 2.1 Create a project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click the project dropdown at the top → **New Project**
3. Name it `personal-finance-tracker` → **Create**
4. Make sure the new project is selected in the dropdown

### 2.2 Enable the Google Sheets API

1. In the search bar type `Google Sheets API`
2. Click it → click **Enable**

### 2.3 Create a Service Account

1. In the left sidebar go to **APIs & Services → Credentials**
2. Click **+ Create Credentials → Service account**
3. Name: `finance-tracker` → **Create and continue**
4. Skip the optional steps → **Done**

### 2.4 Download the JSON key

1. Click the service account email in the list
2. Go to the **Keys** tab
3. Click **Add Key → Create new key → JSON → Create**
4. A `.json` file downloads — keep this safe, it contains your credentials

### 2.5 Share your Google Sheet with the service account

1. Open your Google Sheet
2. Click **Share**
3. Paste the service account email (looks like `finance-tracker@your-project.iam.gserviceaccount.com`)
4. Set role to **Editor** → **Send** → **Share anyway**

---

## Step 3 — Project Setup

### 3.1 Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/personal-finance-tracker.git
cd personal-finance-tracker
npm install
```

### 3.2 Create your `.env` file

Create a file called `.env` in the root of the project:

```
VITE_SPREADSHEET_ID=your_spreadsheet_id_here
GOOGLE_SERVICE_ACCOUNT_EMAIL=finance-tracker@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n
APP_USERNAME=your_username_here
APP_PASSWORD=your_password_here
```

**Where to find each value:**

- `VITE_SPREADSHEET_ID` — the long string in your Google Sheet URL between `/d/` and `/edit`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` — the `client_email` field in your downloaded JSON file
- `GOOGLE_PRIVATE_KEY` — the `private_key` field in your downloaded JSON file (keep `\n` as literal characters, paste everything on one line)

---

## Step 4 — Local Development

```bash
npx netlify dev
```

Open [http://localhost:8888](http://localhost:8888)

> **Note:** Use `npx netlify dev` not `npm run dev`. The Netlify CLI runs both the Vite dev server and the serverless functions together. Without it, API calls will fail.

---

## Step 5 — Deploy to Netlify

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com) → **Add new site → Import an existing project → GitHub**
3. Select your repository
4. Build settings will auto-detect from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`
5. Click **Show advanced → Add environment variables**
6. Add all 5 environment variables:
   - `VITE_SPREADSHEET_ID`
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`
   - `APP_USERNAME`
   - `APP_PASSWORD`
7. Click **Deploy**

Every time you push to `main`, Netlify will automatically redeploy.

---

## How to Use the App

### Dashboard

- View current balances for Savings, TFSA, and Normal investment buckets
- Track progress toward the R25,000 emergency fund goal
- Log a contribution or withdrawal using the form
- View weekly growth graphs (appear after 2 weeks of data)
- Dismiss the monthly reminder banner once you've logged your contributions

### Expenses

- Log daily expenses with description, category, date, and amount
- View this month's total spent vs salary with a progress bar
- See True Remaining (salary − expenses − contributions)
- View category breakdown with a donut chart
- Monthly trends graphs appear after 2 months of data

### Settings

- Update your salary (reflects everywhere immediately)
- Add or remove expense categories (updates the expense form dropdown live)

---

## Ongoing Maintenance

### Adding weekly snapshot dates

Each Sunday, go to the **WeeklySnapshots** tab and type the date (e.g. `2026-03-30`) in the next empty cell in column A. The balance formulas in B–E will calculate automatically.

### The expense monthly totals

Column E in **ExpenseSummary** auto-generates month labels from your starting month using a formula — you don't need to do anything. New months appear automatically.

### Updating salary

Go to **Settings** in the app and edit the salary field. It writes directly to `Settings!B2` in your sheet.

---

## Currency

All amounts are displayed in **ZAR (South African Rand)** with the `R` prefix. To adapt for another currency, update the `formatZAR` helper functions in the Vue components to use your locale and currency symbol.

---

## Security Notes

- Never commit your `.env` file — it's in `.gitignore` by default
- Never commit your Google service account JSON key file — add `*.json` to `.gitignore` (with exceptions for `package.json`, `package-lock.json`, `jsconfig.json`)
- Your Netlify environment variables are encrypted at rest
- The service account only has access to the specific Sheet you shared with it

---

## Authentication

The app is protected by a username and password. Credentials are stored as environment variables — never in your code or GitHub.

### How it works

- A login page appears before you can access any part of the app
- On login, a token is issued and stored in your browser with a **24-hour expiry**
- Every API call to Google Sheets includes the token — requests without a valid token are rejected with a 401 and you are redirected to login
- After 24 hours you will be automatically logged out on your next page load or API call
- A logout button is available at the bottom of the navigation drawer at any time

### Setting your credentials

Add these two variables to your `.env` file:

```
APP_USERNAME=your_username_here
APP_PASSWORD=your_password_here
```

Choose any username and password you like. Also add both to your Netlify environment variables before deploying (see Step 5).

### Changing your password

Update `APP_USERNAME` or `APP_PASSWORD` in Netlify under **Site configuration → Environment variables**, then trigger a redeploy. Any existing token will still work until it naturally expires (max 24 hours).
