<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create the 3 core roles
        Role::create(['name' => 'Admin', 'guard_name' => 'web']); // or 'api' if strictly API
        Role::create(['name' => 'Employee', 'guard_name' => 'web']);
        Role::create(['name' => 'Client', 'guard_name' => 'web']);
    }
}
