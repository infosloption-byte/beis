<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            // WHO did it (nullable because system tasks might not have a logged-in user)
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            
            // WHAT they did (e.g., 'created', 'updated', 'deleted')
            $table->string('action');
            
            // WHAT they did it TO (creates auditable_type and auditable_id columns)
            $table->morphs('auditable'); 
            
            // OPTIONAL: Store the exact data that was changed
            $table->json('payload')->nullable(); 
            
            // WHEN they did it
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};