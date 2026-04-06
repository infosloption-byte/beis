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
        Schema::table('properties', function (Blueprint $table) {
            $table->string('street')->nullable();
            $table->string('state')->nullable();
            $table->string('block_number')->nullable();
            $table->string('floor_room')->nullable();
            $table->string('postal_code')->nullable();
            $table->string('google_map_link')->nullable();
            $table->string('contact_person')->nullable();
            $table->string('contact_number')->nullable();
            $table->string('image_path')->nullable();
            
            // If you don't already have a client_id column, add this line:
            // $table->foreignId('client_id')->nullable()->constrained('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropColumn([
                'street', 'state', 'block_number', 'floor_room', 'postal_code', 
                'google_map_link', 'contact_person', 'contact_number', 'image_path'
            ]);
        });
    }
};
