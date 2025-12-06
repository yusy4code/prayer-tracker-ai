# Prayer Tracker

A modern, responsive web application for tracking your five daily prayers (Salah) with comprehensive statistics and history management.

App live at [https://prayer-tracking-ai.netlify.app/](https://prayer-tracking-ai.netlify.app/)

## Features

### Today's Prayer Tracking

- Track all 5 daily prayers: Fajr, Dhuhr, Asr, Maghrib, and Isha
- One-click toggle to mark prayers as complete/incomplete
- Visual progress bar showing daily completion percentage
- Beautiful card-based interface with color-coded completion status

### History Management

- View all past prayer records in chronological order
- Interactive checkboxes to quickly update individual prayers
- Filter records by month and/or year
- Add new records for any past date
- Edit multiple prayers at once using the Edit button
- All 5 prayers displayed in order for each day

### Comprehensive Statistics

- **Current Streak**: Track consecutive days with at least 3 prayers completed
- **Longest Streak**: View your best performance streak
- **Completion Rates**:
  - Overall (all-time)
  - This week
  - This month
- **Prayer Analysis**: Bar chart showing completion rate for each prayer
- **Calendar View**: Visual monthly calendar with color-coded days
  - Green: All 5 prayers completed
  - Yellow: Some prayers completed
  - Red: No prayers completed
  - Gray: No data recorded

### Data Persistence

- Uses IndexedDB for permanent local storage
- Data persists across browser sessions
- No server required - all data stored locally
- Complete privacy - your data never leaves your device

## Installation

1. Clone or download this repository
2. Open `index.html` in a modern web browser
3. Start tracking your prayers!

No build process, dependencies, or server setup required.

## Usage

### Tracking Today's Prayers

1. Navigate to the "Today" tab (default view)
2. Click on any prayer card to mark it as complete
3. Click again to mark it as incomplete
4. Progress bar updates automatically

### Viewing History

1. Navigate to the "History" tab
2. View all your prayer records
3. Click checkboxes to quickly toggle individual prayers
4. Use the Edit button for bulk editing a day's prayers
5. Filter by month/year using the dropdown menus
6. Click "Clear Filters" to view all records

### Adding Past Records

1. Go to the "History" tab
2. Click the "+ Add Record" button
3. Select a date (cannot be future dates)
4. Check the prayers you completed
5. Click "Save Changes"

### Viewing Statistics

1. Navigate to the "Statistics" tab
2. View your streaks and completion rates
3. Analyze which prayers you complete most consistently
4. Browse the calendar view and click any day to edit

## Technical Details

### Technologies Used

- **HTML5**: Structure and semantic markup
- **CSS3**: Modern styling with Flexbox and Grid
- **Vanilla JavaScript**: No frameworks or libraries
- **IndexedDB**: Browser-based database for data storage

### File Structure

```
prayer-tracker-ai/
├── index.html      # Main HTML structure
├── styles.css      # All styling and responsive design
├── app.js          # Application logic and IndexedDB operations
└── README.md       # This file
```

### Browser Compatibility

- Chrome/Edge (recommended): Full support
- Firefox: Full support
- Safari: Full support
- Opera: Full support

Requires a modern browser with IndexedDB support (all browsers from 2015+).

### Data Schema

Each prayer record is stored with:

- `date`: String in YYYY-MM-DD format (primary key)
- `prayers`: Array of completed prayer names

Example:

```javascript
{
  date: "2024-12-05",
  prayers: ["fajr", "dhuhr", "asr", "maghrib", "isha"]
}
```

## Features Breakdown

### Responsive Design

- Mobile-friendly layout
- Touch-optimized controls
- Adapts to all screen sizes
- No horizontal scrolling

### User Experience

- Smooth animations and transitions
- Clear visual feedback
- Intuitive navigation
- No page reloads

### Data Management

- Automatic saving on every change
- No manual save button needed
- Instant updates across all views
- Export/import capability (future enhancement)

## Privacy & Security

- All data stored locally in your browser
- No data transmitted to any server
- No tracking or analytics
- No account or login required
- Complete offline functionality

## Future Enhancements

Potential features for future versions:

- Prayer time notifications
- Data export/import (backup/restore)
- Custom prayer time schedules
- Additional statistics and insights
- Dark mode toggle
- Multi-language support
- Qibla direction finder

## Contributing

Feel free to fork this project and submit pull requests for any enhancements.

## License

This project is open source and available for personal and educational use.

## Support

For issues or questions, please open an issue on the project repository.

---

**Note**: This application is designed to help track your prayers. Remember that the most important thing is performing the prayers with sincerity and on time.
