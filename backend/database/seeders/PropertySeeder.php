<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Property;
use App\Models\User;
use Illuminate\Support\Facades\Auth; // <-- Import Auth facade
use Faker\Factory as Faker;

class PropertySeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create();
        
        $clients = User::role('Client')->get();
        $admin = User::role('Admin')->first(); // Get the System Admin
        $types = ['Apartment', 'Commercial', 'Office', 'Warehouse', 'Other'];

        if ($clients->isEmpty() || !$admin) {
            $this->command->info('Please run UserSeeder first.');
            return;
        }

        // 1. Temporarily log in as the Admin so the Auditable trait catches their ID!
        Auth::login($admin);

        foreach ($clients as $client) {
            for ($i = 0; $i < rand(2, 4); $i++) {
                Property::create([
                    'client_id' => $client->id,
                    'name' => $faker->company() . ' Facility',
                    'type' => $faker->randomElement($types),
                    'status' => $faker->randomElement(['Active', 'Active', 'Active', 'Pending', 'Inactive']),
                    'street' => $faker->streetAddress(),
                    'block_number' => 'Bldg ' . $faker->randomLetter(),
                    'floor_room' => 'Level ' . $faker->numberBetween(1, 15),
                    'city' => $faker->city(),
                    'state' => $faker->state(),
                    'postal_code' => $faker->postcode(),
                    'google_map_link' => 'https://maps.google.com/?q=' . $faker->latitude() . ',' . $faker->longitude(),
                    'contact_person' => $faker->name(),
                    'contact_number' => $faker->phoneNumber(),
                    'address' => $faker->streetAddress() . ' Bldg ' . $faker->randomLetter(),
                ]);
            }
        }
        
        // Log out when done
        Auth::logout();
    }
}