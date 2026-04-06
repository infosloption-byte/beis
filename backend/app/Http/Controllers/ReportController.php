<?php

namespace App\Http\Controllers;

use App\Models\Job;
use App\Models\Property;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function workOrders(Request $request)
    {
        $total = Job::count();
        $completed = Job::whereIn('status', ['Completed', 'Closed'])->count();
        $emergencies = Job::where('priority', 'Emergency')->count();
        
        // Month over Month Growth
        $thisMonth = Job::whereMonth('created_at', now()->month)->count();
        $lastMonth = Job::whereMonth('created_at', now()->subMonth()->month)->count();
        $growth = $lastMonth > 0 ? round((($thisMonth - $lastMonth) / $lastMonth) * 100) : ($thisMonth > 0 ? 100 : 0);

        $byStatus = Job::select('status', DB::raw('count(*) as count'))->groupBy('status')->pluck('count', 'status');
        $byPriority = Job::select('priority', DB::raw('count(*) as count'))->groupBy('priority')->pluck('count', 'priority');
        
        $last30Days = Job::where('created_at', '>=', now()->subDays(30))
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->groupBy('date')->orderBy('date')->get();

        return response()->json([
            'total' => $total,
            'completed' => $completed,
            'completion_rate' => $total > 0 ? round(($completed / $total) * 100) : 0,
            'emergencies' => $emergencies,
            'this_month' => $thisMonth,
            'growth' => $growth,
            'by_status' => $byStatus,
            'by_priority' => $byPriority,
            'trend' => $last30Days
        ]);
    }

    public function technicians(Request $request)
    {
        $technicians = User::role('Employee')
            ->withCount([
                'jobs as active_jobs' => function ($query) {
                    $query->whereNotIn('status', ['Completed', 'Closed']);
                },
                'jobs as completed_jobs' => function ($query) {
                    $query->whereIn('status', ['Completed', 'Closed']);
                },
                'jobs as emergency_jobs' => function ($query) {
                    $query->whereNotIn('status', ['Completed', 'Closed'])->where('priority', 'Emergency');
                }
            ])
            ->get(['id', 'name', 'profession', 'avatar_path']);

        $totalActive = $technicians->sum('active_jobs');
        
        return response()->json([
            'total_techs' => $technicians->count(),
            'total_active_workload' => $totalActive,
            'avg_workload' => $technicians->count() > 0 ? round($totalActive / $technicians->count(), 1) : 0,
            // Sort by busiest technicians first
            'technicians' => $technicians->sortByDesc('active_jobs')->values() 
        ]);
    }

    public function clientsAndSites(Request $request)
    {
        $totalProperties = Property::count();
        $totalClients = User::role('Client')->count();

        $topProperties = Property::withCount('jobs')->orderByDesc('jobs_count')->take(8)
            ->get(['id', 'name', 'type', 'city', 'jobs_count']);

        // Identify most demanding clients
        $topClients = User::role('Client')->withCount('clientJobs')->orderByDesc('client_jobs_count')->take(5)
            ->get(['id', 'name', 'email', 'avatar_path', 'client_jobs_count']);

        $byType = Property::select('type', DB::raw('count(*) as count'))->groupBy('type')->pluck('count', 'type');

        // Active emergencies across all sites
        $activeEmergencies = Job::where('priority', 'Emergency')->whereNotIn('status', ['Completed', 'Closed'])->count();

        return response()->json([
            'total_properties' => $totalProperties,
            'total_clients' => $totalClients,
            'active_emergencies' => $activeEmergencies,
            'top_properties' => $topProperties,
            'top_clients' => $topClients,
            'by_type' => $byType
        ]);
    }
}