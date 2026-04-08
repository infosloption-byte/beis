<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Job;
use Illuminate\Http\Request;
use Carbon\Carbon;

class TimesheetController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // 1. Security: Clients have no access to timesheets
        if ($user->hasRole('Client')) {
            return response()->json(['message' => 'Unauthorized access.'], 403);
        }

        $request->validate([
            'employee_id' => 'required|exists:users,id',
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer',
        ]);

        $employeeId = $request->employee_id;

        // 2. Security: Employees can ONLY view their own timesheets
        if ($user->hasRole('Employee') && !$user->hasRole('Admin')) {
            if ($employeeId != $user->id) {
                return response()->json(['message' => 'Unauthorized. You can only view your own timesheet.'], 403);
            }
        }

        $month = $request->month;
        $year = $request->year;

        // Fetch jobs for this employee that started in the requested month & year
        $jobs = Job::with('property')
            ->where('assigned_to', $employeeId)
            ->whereMonth('start_date', $month)
            ->whereYear('start_date', $year)
            ->whereNotNull('start_date')
            ->whereNotNull('end_date')
            ->orderBy('start_date', 'asc')
            ->get();

        $timesheet = [];
        $totalMinutes = 0;

        // Generate an array with ALL days of the requested month
        $daysInMonth = Carbon::createFromDate($year, $month, 1)->daysInMonth;
        
        for ($i = 1; $i <= $daysInMonth; $i++) {
            $date = Carbon::createFromDate($year, $month, $i);
            $dateKey = $date->format('Y-m-d');
            
            $timesheet[$dateKey] = [
                'date' => $date->format('M d, Y (D)'),
                'total_daily_minutes' => 0,
                'jobs' => []
            ];
        }

        // Populate the calendar with the fetched jobs
        foreach ($jobs as $job) {
            $start = Carbon::parse($job->start_date);
            $end = Carbon::parse($job->end_date);
            
            // Calculate duration in minutes
            $durationMinutes = $start->diffInMinutes($end);
            $totalMinutes += $durationMinutes;

            $dateKey = $start->format('Y-m-d');

            if (isset($timesheet[$dateKey])) {
                $timesheet[$dateKey]['total_daily_minutes'] += $durationMinutes;
                $timesheet[$dateKey]['jobs'][] = [
                    'id' => $job->id,
                    'title' => $job->title,
                    'property' => $job->property->name ?? 'Unknown',
                    'start_time' => $start->format('h:i A'),
                    'end_time' => $end->format('h:i A'),
                    'duration_formatted' => floor($durationMinutes / 60) . 'h ' . ($durationMinutes % 60) . 'm',
                    'status' => $job->status
                ];
            }
        }

        // Format total time for the month
        $totalHours = floor($totalMinutes / 60);
        $remainingMinutes = $totalMinutes % 60;

        return response()->json([
            'employee' => User::find($employeeId)->only(['id', 'name', 'profession', 'avatar_path']),
            'period' => Carbon::createFromDate($year, $month, 1)->format('F Y'),
            'summary' => [
                'total_jobs' => $jobs->count(),
                'total_time' => "{$totalHours}h {$remainingMinutes}m",
                'total_hours_decimal' => round($totalMinutes / 60, 2)
            ],
            'daily_logs' => array_values($timesheet)
        ]);
    }
}