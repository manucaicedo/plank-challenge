import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 md:mb-6">
            💪 Plank Challenge
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8 px-2">
            Track your month-long plank challenge with friends. Build core strength and compete on the leaderboard!
          </p>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mt-8 md:mt-12">
            <div className="bg-white p-5 md:p-6 rounded-lg shadow-md">
              <div className="text-3xl md:text-4xl mb-3">⏱️</div>
              <h3 className="text-base md:text-lg font-semibold mb-2">Daily Timer</h3>
              <p className="text-gray-600 text-sm">
                Time your plank every day with our accurate timer
              </p>
            </div>

            <div className="bg-white p-5 md:p-6 rounded-lg shadow-md">
              <div className="text-3xl md:text-4xl mb-3">📊</div>
              <h3 className="text-base md:text-lg font-semibold mb-2">Track Progress</h3>
              <p className="text-gray-600 text-sm">
                View your stats, streaks, and personal records
              </p>
            </div>

            <div className="bg-white p-5 md:p-6 rounded-lg shadow-md sm:col-span-2 md:col-span-1">
              <div className="text-3xl md:text-4xl mb-3">🏆</div>
              <h3 className="text-base md:text-lg font-semibold mb-2">Leaderboard</h3>
              <p className="text-gray-600 text-sm">
                Compete with friends and give fistbumps
              </p>
            </div>
          </div>

          <div className="mt-8 md:mt-12 flex flex-col sm:flex-row gap-4 justify-center px-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition text-center"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-800 px-8 py-3 rounded-lg font-semibold transition text-center"
            >
              Log In
            </Link>
          </div>

          <div className="mt-12 md:mt-16 p-5 md:p-6 bg-blue-50 rounded-lg">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">
              How It Works
            </h2>
            <div className="text-left max-w-2xl mx-auto space-y-2 text-sm md:text-base text-gray-700">
              <p>1. Browse and join available challenges</p>
              <p>2. Record your daily plank time (one per day)</p>
              <p>3. Track your progress on your personal dashboard</p>
              <p>4. Compete on the leaderboard and encourage others</p>
              <p>5. Complete the challenge and celebrate your results!</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
