<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jobs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained()->cascadeOnDelete();
            $table->foreignId('client_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('requested_by')->constrained('users'); 
            $table->foreignId('assigned_to')->nullable()->constrained('users'); 
            
            $table->string('title');
            $table->text('description');
            
            $table->enum('status', ['Requested', 'Unassigned', 'Scheduled', 'In-Progress', 'On-Hold', 'Completed', 'Closed'])->default('Requested');
            $table->dateTime('start_date')->nullable();
            $table->dateTime('end_date')->nullable();
            $table->enum('priority', ['Low', 'Medium', 'High', 'Emergency'])->default('Medium');
            
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('started_at')->nullable(); 
            $table->timestamp('completed_at')->nullable(); 
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jobs');
    }
};