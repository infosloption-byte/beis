<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    protected $fillable = ['user_id', 'action', 'auditable_type', 'auditable_id', 'payload'];

    protected $casts = [
        'payload' => 'array', // Automatically cast the JSON column to a PHP array
    ];

    // Link back to the user who performed the action
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Link back to the model that was affected (Job, Property, User, etc.)
    public function auditable()
    {
        return $this->morphTo();
    }
}