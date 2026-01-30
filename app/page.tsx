import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            💪 Plank Challenge
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Track your month-long plank challenge with friends. Build core strength and compete on the leaderboard!
          </p>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-3">⏱️</div>
              <h3 className="text-lg font-semibold mb-2">Daily Timer</h3>
              <p className="text-gray-600 text-sm">
                Time your plank every day with our accurate timer
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-lg font-semibold mb-2">Track Progress</h3>
              <p className="text-gray-600 text-sm">
                View your stats, streaks, and personal records
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-3">🏆</div>
              <h3 className="text-lg font-semibold mb-2">Leaderboard</h3>
              <p className="text-gray-600 text-sm">
                Compete with friends and give fistbumps
              </p>
            </div>
          </div>

          <div className="mt-12 space-x-4">
            <Link
              href="/signup"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-800 px-8 py-3 rounded-lg font-semibold transition"
            >
              Log In
            </Link>
          </div>

          <div className="mt-16 p-6 bg-blue-50 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              How It Works
            </h2>
            <div className="text-left max-w-2xl mx-auto space-y-2 text-gray-700">
              <p>1. Admin creates a 30-day challenge and invites participants</p>
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
