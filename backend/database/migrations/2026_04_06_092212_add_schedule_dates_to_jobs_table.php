<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('jobs', function (Blueprint $table) {
            // Add schedule dates after status
            $table->dateTime('start_date')->nullable()->after('status');
            $table->dateTime('end_date')->nullable()->after('start_date');
        });
    }

    public function down(): void
    {
        Schema::table('jobs', function (Blueprint $table) {
            $table->dropColumn(['start_date', 'end_date']);
        });
    }
};