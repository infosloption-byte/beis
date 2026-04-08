<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Property;
use App\Models\Job;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    // --- 1. ADMIN DASHBOARD ---
    public function index(Request $request)
    {
        $employees = User::role('Employee')->withCount([
            'jobs as active_jobs' => function ($query) {
                $query->whereNotIn('status', ['Completed', 'Closed']);
            }
        ])->get(['id', 'name', 'email', 'avatar_path', 'profession', 'is_active']);

        $airTable = $employees->where('active_jobs', 0)->where('is_active', true)->values();
        $fillTable = $employees->where('active_jobs', '>', 0)->where('is_active', true)->sortByDesc('active_jobs')->values();

        $allProperties = Property::with('client')
            ->withCount(['jobs as active_jobs' => function ($query) {
                $query->whereNotIn('status', ['Completed', 'Closed']);
            }])->latest()->get();

        $activeWithJobs = $allProperties->where('status', 'Active')->where('active_jobs', '>', 0)->sortByDesc('active_jobs')->values();
        $closedProperties = $allProperties->where('status', 'Inactive')->values();

        $unassignedJobs = Job::with(['property', 'client'])
            ->whereNull('assigned_to')
            ->whereNotIn('status', ['Completed', 'Closed'])
            ->latest()->get();

        return response()->json([
            'employees' => [
                'total' => $employees->count(),
                'air_count' => $airTable->count(),
                'fill_count' => $fillTable->count(),
                'air_table' => $airTable->take(5), 
                'fill_table' => $fillTable->take(5),
            ],
            'properties' => [
                'total' => $allProperties->count(),
                'active_with_jobs_count' => $activeWithJobs->count(),
                'closed_count' => $closedProperties->count(),
                'all_table' => $allProperties->take(5),
                'active_with_jobs_table' => $activeWithJobs->take(5),
                'closed_table' => $closedProperties->take(5)
            ],
            'jobs' => [
                'unassigned_count' => $unassignedJobs->count(),
                'unassigned_table' => $unassignedJobs->take(5)
            ]
        ]);
    }

    // --- 2. EMPLOYEE DASHBOARD ---
    public function employee(Request $request)
    {
        $user = $request->user();
        $now = Carbon::now();

        // 1. Count basic personal stats
        $activeJobsCount = Job::where('assigned_to', $user->id)
            ->whereNotIn('status', ['Completed', 'Closed'])
            ->count();

        $completedJobsCount = Job::where('assigned_to', $user->id)
            ->whereIn('status', ['Completed', 'Closed'])
            ->count();

        $emergencyJobsCount = Job::where('assigned_to', $user->id)
            ->whereNotIn('status', ['Completed', 'Closed'])
            ->where('priority', 'Emergency')
            ->count();

        // 2. Active Sites (Unique properties currently being worked on)
        $activeSitesCount = Job::where('assigned_to', $user->id)
            ->whereNotIn('status', ['Completed', 'Closed'])
            ->distinct('property_id')
            ->count('property_id');

        // 3. Current Month Total Work Hours
        $monthJobs = Job::where('assigned_to', $user->id)
            ->whereMonth('start_date', $now->month)
            ->whereYear('start_date', $now->year)
            ->whereNotNull('start_date')
            ->whereNotNull('end_date')
            ->get();

        $totalMinutes = 0;
        foreach ($monthJobs as $job) {
            $start = Carbon::parse($job->start_date);
            $end = Carbon::parse($job->end_date);
            $totalMinutes += $start->diffInMinutes($end);
        }
        $monthHours = floor($totalMinutes / 60);
        $monthMinutes = $totalMinutes % 60;
        $formattedMonthHours = "{$monthHours}h {$monthMinutes}m";

        // 4. Get personal work queue
        $myQueue = Job::with(['property', 'client'])
            ->where('assigned_to', $user->id)
            ->whereNotIn('status', ['Completed', 'Closed'])
            ->orderByRaw("FIELD(priority, 'Emergency', 'High', 'Medium', 'Low')")
            ->orderBy('start_date', 'asc')
            ->take(10)->get();

        // 5. Get jobs for the mini calendar
        $calendarJobs = Job::with(['property'])
            ->where('assigned_to', $user->id)
            ->whereNotNull('start_date')
            ->orderBy('start_date', 'asc')
            ->get();

        return response()->json([
            'stats' => [
                'active_jobs' => $activeJobsCount,
                'completed_jobs' => $completedJobsCount,
                'emergency_jobs' => $emergencyJobsCount,
                'active_sites' => $activeSitesCount,
                'month_hours' => $formattedMonthHours,
            ],
            'my_queue' => $myQueue,
            'calendar_jobs' => $calendarJobs
        ]);
    }

    // --- 3. CLIENT DASHBOARD ---
    public function client(Request $request)
    {
        $user = $request->user();

        $propertiesCount = Property::where('client_id', $user->id)->count();
        $activeJobsCount = Job::where('client_id', $user->id)->whereNotIn('status', ['Completed', 'Closed'])->count();
        
        $recentJobs = Job::with(['property', 'technician'])
            ->where('client_id', $user->id)
            ->latest()->take(10)->get();

        return response()->json([
            'stats' => [
                'properties' => $propertiesCount,
                'active_jobs' => $activeJobsCount,
            ],
            'recent_jobs' => $recentJobs
        ]);
    }

    // OLD Dashboard (Used in Reports)
    public function general(Request $request)
    {
        return response()->json([
            'total_users' => User::count(),
            'total_properties' => Property::count(),
            'total_jobs' => Job::count(),
            'recent_activity' => Job::with('client')->latest()->take(5)->get()
        ]);
    }
}