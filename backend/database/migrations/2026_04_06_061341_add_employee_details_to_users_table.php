<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('employee_number')->nullable()->after('phone');
            $table->string('passport_number')->nullable()->after('employee_number');
            $table->string('profession')->nullable()->after('passport_number');
            $table->json('skills')->nullable()->after('profession'); // Save as JSON array
            $table->string('avatar_path')->nullable()->after('skills');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['employee_number', 'passport_number', 'profession', 'skills', 'avatar_path']);
        });
    }
};