'use client';

interface PlankCalendarProps {
  planks: { date: string; duration: number }[];
  startDate: string;
  endDate: string;
}

export default function PlankCalendar({ planks, startDate, endDate }: PlankCalendarProps) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Create a map of dates with planks
  const plankMap = new Map<string, number>();
  planks.forEach((plank) => {
    plankMap.set(plank.date, plank.duration);
  });

  // Generate calendar days
  const days: { date: Date; status: 'completed' | 'missed' | 'future' | 'today' }[] = [];
  const current = new Date(start);

  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    const duration = plankMap.get(dateStr);

    let status: 'completed' | 'missed' | 'future' | 'today';

    if (current.getTime() === today.getTime()) {
      status = duration ? 'completed' : 'today';
    } else if (current > today) {
      status = 'future';
    } else {
      status = duration ? 'completed' : 'missed';
    }

    days.push({ date: new Date(current), status });
    current.setDate(current.getDate() + 1);
  }

  // Get month name
  const monthName = start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Format time
  function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{monthName}</h3>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Add empty cells for days before start of challenge */}
        {Array.from({ length: start.getDay() }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {/* Render challenge days */}
        {days.map((day, i) => {
          const dateStr = day.date.toISOString().split('T')[0];
          const duration = plankMap.get(dateStr);

          return (
            <div
              key={i}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-medium transition-all cursor-pointer group relative ${
                day.status === 'completed'
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : day.status === 'missed'
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : day.status === 'today'
                  ? 'bg-blue-500 text-white ring-2 ring-blue-600 hover:bg-blue-600'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              <span className="text-xs">{day.date.getDate()}</span>

              {/* Tooltip on hover */}
              {duration !== undefined && (
                <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                  {formatDuration(duration)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4 text-xs text-gray-600">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
          <span>Completed</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-100 rounded mr-2"></div>
          <span>Missed</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
          <span>Today</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-100 rounded mr-2"></div>
          <span>Future</span>
        </div>
      </div>
    </div>
  );
}
