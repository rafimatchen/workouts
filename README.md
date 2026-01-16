# Alpha Class Workout Tracker

A Vue 3 web application for tracking exercises from Lifetime Gym Alpha class workouts. Data is stored locally in your browser using localStorage.

## Features

- **Add Workouts**: Easily log multiple exercises with weight, sets, reps, and notes
- **View History**: Browse all past workouts sorted by date
- **Edit & Delete**: Modify or remove workouts as needed
- **Search**: Filter workouts by exercise name or date
- **Export Data**: Backup your workout data as JSON
- **Mobile Responsive**: Works great on phones for use at the gym
- **Offline Ready**: All data stored locally, no internet required after initial load

## Tech Stack

- Vue 3 (Composition API)
- Vite
- Vanilla CSS
- localStorage for data persistence

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd workouts
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit `http://localhost:5173`

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run deploy` - Build and deploy to GitHub Pages

## Deployment to GitHub Pages

### Initial Setup

1. Create a new repository on GitHub

2. Update the base path in `vite.config.js` if your repository name is not "workouts":
```javascript
base: process.env.NODE_ENV === 'production' ? '/your-repo-name/' : '/',
```

3. Push your code to GitHub:
```bash
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

### Deploy

Run the deployment script:
```bash
npm run deploy
```

This will:
1. Build the production bundle
2. Deploy to the `gh-pages` branch
3. Make your site available at `https://your-username.github.io/your-repo-name/`

### Enable GitHub Pages

1. Go to your repository on GitHub
2. Navigate to Settings > Pages
3. Under "Source", select the `gh-pages` branch
4. Click Save
5. Your site will be published at the URL shown

## Data Storage

All workout data is stored in your browser's localStorage. This means:

- Data persists across browser sessions
- Data is specific to this browser/device
- Clearing browser data will delete your workouts
- Use the Export feature to backup your data regularly

## Data Format

Workouts are stored in the following format:

```javascript
{
  id: "unique-id",
  date: "2024-01-16T00:00:00.000Z",
  exercises: [
    {
      name: "Bench Press",
      weight: 185,
      sets: 3,
      reps: 10,
      notes: "Felt strong today"
    }
  ]
}
```

## Project Structure

```
workouts/
├── src/
│   ├── App.vue                      # Main app container
│   ├── main.js                      # App entry point
│   ├── components/
│   │   ├── WorkoutForm.vue          # Add new workout form
│   │   └── WorkoutHistory.vue       # View/edit workout history
│   ├── composables/
│   │   └── useWorkouts.js           # Workout data management
│   └── assets/
│       └── vue.svg
├── index.html
├── vite.config.js
└── package.json
```

## Contributing

Feel free to open issues or submit pull requests with improvements!

## License

MIT
