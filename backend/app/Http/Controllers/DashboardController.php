<?php

namespace App\Http\Controllers;

use App\Models\Job;
use App\Models\User;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        // 1. Detailed KPIs
        $kpis = [
            'total_jobs' => Job::count(),
            'completed_jobs' => Job::where('status', 'Completed')->count(),
            'requested_jobs' => Job::where('status', 'Requested')->count(),
            'unassigned_jobs' => Job::where('status', 'Unassigned')->count(),
            'pending_jobs' => Job::whereIn('status', ['Scheduled', 'In-Progress', 'On-Hold'])->count(),
        ];

        // 2. Employee Summary with Live Status
        $employees = User::role('Employee')->get()->map(function ($emp) {
            $assigned = Job::where('assigned_to', $emp->id)->count();
            $completed = Job::where('assigned_to', $emp->id)->where('status', 'Completed')->count();
            $activeJobs = Job::where('assigned_to', $emp->id)->where('status', 'In-Progress')->count();
            
            return [
                'id' => $emp->id,
                'name' => $emp->name,
                'assigned' => $assigned,
                'completed' => $completed,
                'status' => $activeJobs > 0 ? 'Working' : 'Available',
            ];
        });

        // 3. Job Alignments (Created vs Finished) Data
        $trend7Days = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $trend7Days[] = [
                'name' => $date->format('D'),
                'created' => Job::whereDate('created_at', $date)->count(),
                'completed' => Job::whereDate('updated_at', $date)->where('status', 'Completed')->count(),
            ];
        }

        $trendMonth = [];
        $daysInMonth = now()->daysInMonth;
        for ($i = 1; $i <= $daysInMonth; $i++) {
            $date = now()->startOfMonth()->addDays($i - 1);
            $trendMonth[] = [
                'name' => $date->format('d'),
                'created' => Job::whereDate('created_at', $date)->count(),
                'completed' => Job::whereDate('updated_at', $date)->where('status', 'Completed')->count(),
            ];
        }

        $trendYear = [];
        for ($i = 1; $i <= 12; $i++) {
            $trendYear[] = [
                'name' => date("M", mktime(0, 0, 0, $i, 1)),
                'created' => Job::whereYear('created_at', date('Y'))->whereMonth('created_at', $i)->count(),
                'completed' => Job::whereYear('updated_at', date('Y'))->whereMonth('updated_at', $i)->where('status', 'Completed')->count(),
            ];
        }

        // 4. Calendar Data (All jobs from the current month to plot on the widget)
        $calendarJobs = Job::whereMonth('created_at', now()->month)
                           ->whereYear('created_at', now()->year)
                           ->select('id', 'title', 'status', 'created_at')
                           ->get();

        return response()->json([
            'kpis' => $kpis,
            'employees' => $employees,
            'charts' => [
                'trend_7_days' => $trend7Days,
                'trend_month' => $trendMonth,
                'trend_year' => $trendYear,
            ],
            'calendar' => $calendarJobs,
        ]);
    }
}