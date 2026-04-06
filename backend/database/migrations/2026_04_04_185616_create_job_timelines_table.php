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
        Schema::create('job_timelines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained(); // Who made the change
            $table->string('action_type'); // e.g., 'status_change', 'comment', 'photo_uploaded'
            $table->text('description'); // e.g., 'Status changed from Scheduled to In-Progress'
            $table->decimal('recorded_latitude', 10, 8)->nullable(); // GPS at the time of action
            $table->decimal('recorded_longitude', 11, 8)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_timelines');
    }
};
