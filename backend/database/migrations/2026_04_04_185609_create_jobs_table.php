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
        Schema::create('jobs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained()->cascadeOnDelete();
            $table->foreignId('requested_by')->constrained('users'); // The client
            $table->foreignId('assigned_to')->nullable()->constrained('users'); // The technician
            $table->string('title');
            $table->text('description');
            $table->enum('status', ['Requested', 'Unassigned', 'Scheduled', 'In-Progress', 'On-Hold', 'Completed', 'Closed'])->default('Requested');
            $table->enum('priority', ['Low', 'Medium', 'High', 'Emergency'])->default('Medium');
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('started_at')->nullable(); // Track real start time
            $table->timestamp('completed_at')->nullable(); // Track real end time
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jobs');
    }
};
