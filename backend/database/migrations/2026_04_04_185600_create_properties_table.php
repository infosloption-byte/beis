<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('users')->cascadeOnDelete();
            $table->string('name');
            $table->enum('type', ['Apartment', 'Commercial', 'Office', 'Warehouse', 'Other']);
            
            // Location Data
            $table->string('address')->nullable();
            $table->string('street')->nullable();
            $table->string('block_number')->nullable();
            $table->string('floor_room')->nullable();
            $table->string('city');
            $table->string('state')->nullable();
            $table->string('postal_code')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->string('google_map_link')->nullable();
            
            // Contact & Info
            $table->string('contact_person')->nullable();
            $table->string('contact_number')->nullable();
            $table->text('emergency_info')->nullable();
            $table->text('access_instructions')->nullable();
            $table->string('image_path')->nullable();
            
            $table->enum('status', ['Active', 'Pending', 'Inactive'])->default('Pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};