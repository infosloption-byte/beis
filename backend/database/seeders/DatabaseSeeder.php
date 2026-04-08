<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Property;
use App\Models\Job;
use App\Models\JobTimeline;
use Spatie\Permission\Models\Role;
use Carbon\Carbon;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        // 1. Create Roles
        $adminRole = Role::firstOrCreate(['name' => 'Admin']);
        $employeeRole = Role::firstOrCreate(['name' => 'Employee']);
        $clientRole = Role::firstOrCreate(['name' => 'Client']);

        // 2. Create the Admin User
        $admin = User::firstOrCreate(
            ['email' => 'admin@beis.com'],
            [
                'name' => 'System Admin',
                'password' => Hash::make('password'),
                'is_active' => true,
                'phone' => '+1 (555) 000-0001',
                'employee_number' => 'ADM-001',
                'email_verified_at' => now(),
            ]
        );
        $admin->assignRole($adminRole);

        // 3. Create 5 Specialized Employees (Field Techs)
        $employeesData = [
            ['name' => 'Marcus Johnson', 'email' => 'marcus@beis.com', 'profession' => 'HVAC Technician', 'skills' => ['HVAC', 'Cooling', 'Heating']],
            ['name' => 'Sarah Connor', 'email' => 'sarah@beis.com', 'profession' => 'Master Electrician', 'skills' => ['Electrical', 'Wiring', 'Fire Alarms']],
            ['name' => 'David Chen', 'email' => 'david@beis.com', 'profession' => 'Plumbing Specialist', 'skills' => ['Plumbing', 'Piping', 'Water Systems']],
            ['name' => 'Elena Rodriguez', 'email' => 'elena@beis.com', 'profession' => 'General Maintenance', 'skills' => ['Carpentry', 'Painting', 'Drywall']],
            ['name' => 'Michael Chang', 'email' => 'michael@beis.com', 'profession' => 'Security Systems Tech', 'skills' => ['CCTV', 'Access Control', 'Networking']],
        ];

        $employees = collect();
        foreach ($employeesData as $idx => $data) {
            $emp = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'password' => Hash::make('password'),
                    'is_active' => true,
                    'phone' => '+1 (555) 100-' . rand(1000, 9999),
                    'employee_number' => 'EMP-10' . ($idx + 1),
                    'profession' => $data['profession'],
                    'skills' => json_encode($data['skills']), // Cast to JSON
                    'email_verified_at' => now(),
                ]
            );
            $emp->assignRole($employeeRole);
            $employees->push($emp);
        }

        // 4. Create Clients
        $clientsData = [
            ['name' => 'Acme Corporation', 'email' => 'facilities@acme.com'],
            ['name' => 'Stark Industries', 'email' => 'ops@stark.com'],
            ['name' => 'Wayne Enterprises', 'email' => 'maintenance@wayne.com'],
        ];

        $clients = collect();
        foreach ($clientsData as $data) {
            $client = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'password' => Hash::make('password'),
                    'is_active' => true,
                    'phone' => '+1 (555) 200-' . rand(1000, 9999),
                    'email_verified_at' => now(),
                ]
            );
            $client->assignRole($clientRole);
            $clients->push($client);
        }

        // 5. Create Properties for Clients
        $propertyTypes = ['Apartment', 'Commercial', 'Office', 'Warehouse', 'Other'];
        $cities = ['New York', 'Chicago', 'Los Angeles', 'Seattle', 'Miami'];
        $properties = collect();

        foreach ($clients as $client) {
            // Give each client 2-4 properties
            $numProps = rand(2, 4);
            for ($i = 0; $i < $numProps; $i++) {
                $city = $cities[array_rand($cities)];
                $properties->push(Property::create([
                    'client_id' => $client->id,
                    'name' => $client->name . ' - Site ' . ($i + 1),
                    'type' => $propertyTypes[array_rand($propertyTypes)],
                    'status' => 'Active',
                    'street' => rand(100, 9999) . ' Corporate Blvd',
                    'block_number' => 'Bldg ' . chr(rand(65, 90)),
                    'floor_room' => 'Suite ' . rand(100, 900),
                    'city' => $city,
                    'state' => 'NY',
                    'postal_code' => rand(10000, 99999),
                    'address' => rand(100, 9999) . ' Corporate Blvd, ' . $city, // Composite legacy field
                    'contact_person' => 'Facility Manager ' . chr(rand(65, 90)),
                    'contact_number' => '+1 (555) 300-' . rand(1000, 9999),
                    'latitude' => rand(30000000, 45000000) / 1000000,
                    'longitude' => -(rand(70000000, 120000000) / 1000000),
                ]));
            }
        }

        // 6. Create Jobs (Work Orders) & Timelines
        $statuses = ['Requested', 'Scheduled', 'In-Progress', 'On-Hold', 'Completed', 'Closed'];
        $priorities = ['Low', 'Medium', 'High', 'Emergency'];
        $jobTitles = [
            'HVAC Filter Replacement', 'Fix Leaking Pipe', 'Reset Fire Alarm', 
            'Repair Elevator Panel', 'Monthly Generator Test', 'Replace Lobby Lighting', 
            'Security Camera Offline', 'AC Unit Not Cooling', 'Water Heater Inspection'
        ];

        foreach ($properties as $property) {
            // Create 4-7 jobs per property to generate rich dashboard data
            $numJobs = rand(4, 7);
            
            for ($i = 0; $i < $numJobs; $i++) {
                $status = $statuses[array_rand($statuses)];
                $priority = $priorities[array_rand($priorities)];
                $title = $jobTitles[array_rand($jobTitles)];
                
                // Requested jobs shouldn't have assignees. Others should.
                $assignedTo = ($status === 'Requested') ? null : $employees->random()->id;

                // Time math for Calendar & Timesheets (Ensure data falls in the current month)
                $now = Carbon::now();
                
                // Spread jobs out over the last 20 days and the next 5 days
                $daysOffset = rand(-20, 5); 
                $baseDate = (clone $now)->addDays($daysOffset)->setTime(rand(8, 15), rand(0, 59), 0); // Start between 8 AM and 3 PM

                $startDate = null;
                $endDate = null;
                $scheduledAt = null;

                if ($status !== 'Requested') {
                    $scheduledAt = (clone $baseDate)->subDays(1);
                    $startDate = clone $baseDate;
                    
                    if (in_array($status, ['Completed', 'Closed'])) {
                        // Job took between 45 minutes and 6 hours
                        $endDate = (clone $startDate)->addMinutes(rand(45, 360));
                    } elseif ($status === 'Scheduled') {
                        // Future job
                        $startDate = (clone $now)->addDays(rand(1, 5))->setTime(rand(8, 15), 0, 0);
                        $endDate = (clone $startDate)->addHours(2);
                    }
                }

                $job = Job::create([
                    'property_id' => $property->id,
                    'client_id' => $property->client_id,
                    'requested_by' => $property->client_id,
                    'assigned_to' => $assignedTo,
                    'title' => $title,
                    'description' => "System generated request for {$title}. Please inspect the facility and resolve the issue according to BEIS safety protocols.",
                    'priority' => $priority,
                    'status' => $status,
                    'scheduled_at' => $scheduledAt,
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                ]);

                // --- Build Realistic Timeline History ---
                
                // 1. Always create a "Requested" timeline event
                $job->timeline()->create([
                    'user_id' => $property->client_id,
                    'action_type' => 'created',
                    'description' => "Work order requested by client.",
                    'created_at' => (clone $baseDate)->subDays(2)
                ]);

                // 2. If assigned, add an assignment event
                if ($assignedTo) {
                    $techName = $employees->firstWhere('id', $assignedTo)->name;
                    $job->timeline()->create([
                        'user_id' => $admin->id,
                        'action_type' => 'assigned',
                        'description' => "Work order assigned to field technician: {$techName}.",
                        'created_at' => (clone $baseDate)->subDays(1)
                    ]);
                }

                // 3. If in progress, add status update
                if (in_array($status, ['In-Progress', 'Completed', 'Closed'])) {
                    $job->timeline()->create([
                        'user_id' => $assignedTo,
                        'action_type' => 'status_updated',
                        'description' => "Status updated to In-Progress. Technician arrived on site.",
                        'created_at' => $startDate
                    ]);
                }

                // 4. If completed, add completion event
                if (in_array($status, ['Completed', 'Closed'])) {
                    $job->timeline()->create([
                        'user_id' => $assignedTo,
                        'action_type' => 'status_updated',
                        'description' => "Status updated to {$status}. Work completed successfully, site left clean and secure.",
                        'created_at' => $endDate
                    ]);
                }
            }
        }
    }
}