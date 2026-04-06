<?php

namespace App\Traits;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;

trait Auditable
{
    /**
     * Boot the trait to listen for Eloquent events.
     */
    public static function bootAuditable()
    {
        // When a model is created
        static::created(function ($model) {
            $model->logAction('created', $model->getAttributes());
        });

        // When a model is updated
        static::updated(function ($model) {
            // Only log the fields that actually changed
            $changes = $model->getChanges();
            $model->logAction('updated', $changes);
        });

        // When a model is deleted
        static::deleted(function ($model) {
            $model->logAction('deleted', $model->getAttributes());
        });
    }

    /**
     * Write the action to the audit_logs table.
     */
    protected function logAction($action, $payload = null)
    {
        AuditLog::create([
            'user_id' => Auth::id(), // Will be null if triggered by a background job/seeder
            'action' => $action,
            'auditable_type' => static::class, // e.g., 'App\Models\Property'
            'auditable_id' => $this->id,
            'payload' => $payload, // The data that was created/changed
        ]);
    }
}