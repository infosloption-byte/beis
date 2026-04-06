<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('users')->cascadeOnDelete();
            $table->string('name');
            $table->enum('type', ['Apartment', 'Commercial', 'Office', 'Warehouse', 'Other']);
            $table->string('address');
            $table->string('city');
            $table->decimal('latitude', 10, 8)->nullable(); // For GPS routing
            $table->decimal('longitude', 11, 8)->nullable(); // For GPS routing
            $table->text('emergency_info')->nullable();
            $table->text('access_instructions')->nullable();
            $table->enum('status', ['Active', 'Pending', 'Inactive'])->default('Pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
