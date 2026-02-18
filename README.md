# Earnings Tracker Application

A modern web application for tracking daily earnings across multiple massage therapy businesses, designed specifically for tax reporting and business tracking.

## Features

### 📍 Multi-Location Support
- **Soul Bridge Healing**: Your own massage therapy business
- **Halo Therapies**: Independent contractor work

### 💼 Service Tracking
- **Massage**: Standard massage services
- **Deep Tissue**: Specialized deep tissue massage
- Custom hourly rates per service type
- Flexible session durations (15-minute increments)

### ➕ Add-ons
- Track additional services (aromatherapy, hot stones, etc.)
- Custom pricing for each add-on
- Multiple add-ons per session

### 💰 Earnings Tracking
- Automatic calculation of session earnings
- Tips tracking
- Real-time earnings summary by location
- Total earnings, average per session

### ⭐ Reviews & Ratings
- Customer review notes
- Star ratings (1-5 stars)
- Historical record of customer feedback

### 📊 Tax Reporting
- Daily earnings records stored locally
- Organized by business location
- Easy export capability for tax purposes
- Breakdown of earnings vs. tips

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Storage**: Browser localStorage

## Getting Started

### Prerequisites
- Node.js 16+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Usage

1. **Select a Business Location**: Choose between Soul Bridge Healing or Halo Therapies using the navigation buttons
2. **Add a Session**: Click "Add Session" to record a new earnings session
3. **Track Services**: Add massage or deep tissue services with duration and hourly rate
4. **Add Extra Items**: Include add-ons and tips
5. **Add Customer Feedback**: Optional review and star rating
6. **View Earnings**: See your total earnings and breakdown by category

## Data Storage

All earnings data is stored in your browser's localStorage, so your data persists between sessions. You can back up your data by exporting it.

## Tax Considerations

This application helps you track:
- Gross income from services
- Tips received
- Add-on sales
- Customer reviews for quality assurance

**Note**: Consult with a tax professional about your specific reporting requirements.

## Future Enhancements

- Export data to CSV/PDF for tax purposes
- Monthly and yearly reports
- Expense tracking
- Tax deduction calculator
- Multiple contractor profiles

## License

MIT
