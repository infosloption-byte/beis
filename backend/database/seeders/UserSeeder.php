<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth; // <-- Import Auth facade
use Spatie\Permission\Models\Role;
use Faker\Factory as Faker;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create();

        // 1. Ensure the roles exist in the database before assigning them
        $roles = ['Admin', 'Employee', 'Client'];
        foreach ($roles as $roleName) {
            Role::firstOrCreate(['name' => $roleName]);
        }

        $defaultPassword = Hash::make('password');

        // ==========================================
        // 2. Create the FIRST Admin User
        // ==========================================
        $admin1 = User::create([
            'name' => 'System Admin',
            'email' => 'admin@beis.com', 
            'password' => $defaultPassword,
            'phone' => '+1 (555) 000-0001',
        ]);
        $admin1->assignRole('Admin');

        // 🔥 LOG IN AS THE ADMIN 🔥
        // From this point forward, the Auditable trait will record that 
        // 'System Admin' created all the following users!
        Auth::login($admin1);

        // Create 4 more Admins
        for ($i = 0; $i < 4; $i++) {
            $user = User::create([
                'name' => $faker->name(),
                'email' => $faker->unique()->safeEmail(),
                'password' => $defaultPassword,
                'phone' => $faker->phoneNumber(),
            ]);
            $user->assignRole('Admin');
        }

        // ==========================================
        // 3. Create 5 Employee (Technician) Users
        // ==========================================
        $emp1 = User::create([
            'name' => 'Lead Technician',
            'email' => 'tech@beis.com', 
            'password' => $defaultPassword,
            'phone' => '+1 (555) 000-0002',
        ]);
        $emp1->assignRole('Employee');

        for ($i = 0; $i < 4; $i++) {
            $user = User::create([
                'name' => $faker->name(),
                'email' => $faker->unique()->safeEmail(),
                'password' => $defaultPassword,
                'phone' => $faker->phoneNumber(),
            ]);
            $user->assignRole('Employee');
        }

        // ==========================================
        // 4. Create 5 Client Users
        // ==========================================
        $client1 = User::create([
            'name' => 'Acme Corp Facilities',
            'email' => 'client@acme.com', 
            'password' => $defaultPassword,
            'phone' => '+1 (555) 000-0003',
        ]);
        $client1->assignRole('Client');

        for ($i = 0; $i < 4; $i++) {
            $user = User::create([
                'name' => $faker->company() . ' Management', 
                'email' => $faker->unique()->companyEmail(),
                'password' => $defaultPassword,
                'phone' => $faker->phoneNumber(),
            ]);
            $user->assignRole('Client');
        }

        // Log out at the end of the seeder to keep things clean
        Auth::logout();
    }
}