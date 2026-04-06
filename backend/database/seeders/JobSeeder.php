<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Job;
use App\Models\Property;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth; // <-- Import Auth facade
use Faker\Factory as Faker;

class JobSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create();
        
        $properties = Property::with('client')->get(); // Eager load the client
        $technicians = User::role('Employee')->get();
        $admin = User::role('Admin')->first(); 
        
        $statuses = ['Requested', 'Unassigned', 'Scheduled', 'In-Progress', 'On-Hold', 'Completed', 'Closed'];
        $priorities = ['Low', 'Medium', 'High', 'Emergency'];
        $taskTitles = ['HVAC Maintenance', 'Plumbing Leak', 'Electrical Inspection', 'Network Cabling', 'Security Audit', 'Roof Repair', 'Elevator Service', 'Pest Control', 'Fire Alarm Testing'];

        if ($properties->isEmpty() || $technicians->isEmpty() || !$admin) {
            $this->command->info('Please run UserSeeder and PropertySeeder first.');
            return;
        }

        foreach ($properties as $property) {
            
            // 1. Temporarily log in as THIS property's client
            // So the Auditable trait logs that THEY created the Job
            if ($property->client) {
                Auth::login($property->client);
            }

            for ($i = 0; $i < rand(3, 8); $i++) {
                $status = $faker->randomElement($statuses);
                $isUnassigned = in_array($status, ['Requested', 'Unassigned']);
                $techId = $isUnassigned ? null : $technicians->random()->id;
                $createdAt = $faker->dateTimeBetween('-2 months', '-2 days');
                $updatedAt = in_array($status, ['Completed', 'Closed']) ? $faker->dateTimeBetween($createdAt, 'now') : $createdAt;

                // Creating this job will trigger the Auditable trait automatically!
                $job = Job::create([
                    'property_id' => $property->id,
                    'client_id' => $property->client_id,
                    'requested_by' => $property->client_id, 
                    'assigned_to' => $techId, 
                    'title' => $faker->randomElement($taskTitles),
                    'description' => $faker->realText(100),
                    'priority' => $faker->randomElement($priorities),
                    'status' => $status,
                    'created_at' => $createdAt,
                    'updated_at' => $updatedAt,
                ]);

                // --- Job Timelines (Manual DB inserts remain the same) ---
                DB::table('job_timelines')->insert([
                    'job_id' => $job->id,
                    'user_id' => $property->client_id,
                    'action_type' => 'created',
                    'description' => 'Work order requested and logged into the system.',
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ]);

                if ($techId) {
                    $assignedAt = clone $createdAt;
                    $assignedAt->modify('+' . rand(1, 5) . ' hours');

                    DB::table('job_timelines')->insert([
                        'job_id' => $job->id,
                        'user_id' => $admin->id,
                        'action_type' => 'assigned',
                        'description' => 'Work order assigned to field technician.',
                        'created_at' => $assignedAt,
                        'updated_at' => $assignedAt,
                    ]);
                }

                if (in_array($status, ['Completed', 'Closed'])) {
                    DB::table('job_timelines')->insert([
                        'job_id' => $job->id,
                        'user_id' => $techId,
                        'action_type' => 'status_updated',
                        'description' => "Work order marked as {$status}.",
                        'created_at' => $updatedAt,
                        'updated_at' => $updatedAt,
                    ]);
                }
            }
        }
        
        Auth::logout();
    }
}