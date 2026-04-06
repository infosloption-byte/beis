<?php

namespace App\Http\Controllers;

use App\Models\Job;
use App\Models\Attachment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class JobController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        $query = Job::with(['property', 'client', 'technician', 'attachments'])->latest();

        if ($user->hasRole('Client')) {
            $query->where('client_id', $user->id);
        } elseif ($user->hasRole('Employee')) {
            $query->where('assigned_to', $user->id);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'property_id' => 'required|exists:properties,id',
            'client_id' => 'required|exists:users,id',
            'assigned_to' => 'nullable|exists:users,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'priority' => 'required|in:Low,Medium,High,Emergency',
            'status' => 'required|string',
            'start_date' => 'nullable|date', // <-- Added validation
            'end_date' => 'nullable|date|after_or_equal:start_date', // <-- Added validation
            'images.*' => 'nullable|image|max:5120',
        ]);

        $validated['requested_by'] = Auth::id() ?? $request->client_id;

        $job = Job::create($validated);
        $workspacePath = "jobs/{$job->id}";
        Storage::disk('public')->makeDirectory($workspacePath);

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $path = $file->store($workspacePath, 'public');
                $job->attachments()->create([
                    'file_path' => $path,
                    'file_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getMimeType(),
                ]);
            }
        }

        return response()->json(['message' => 'Job created', 'job' => $job->load('attachments')], 201);
    }

    public function show(Job $job)
    {
        return response()->json($job->load(['property', 'client', 'technician', 'attachments', 'timeline.user']));
    }

    public function update(Request $request, Job $job)
    {
        $validated = $request->validate([
            'property_id' => 'required|exists:properties,id',
            'client_id' => 'required|exists:users,id',
            'assigned_to' => 'nullable|exists:users,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'priority' => 'required|in:Low,Medium,High,Emergency',
            'status' => 'required|string',
            'start_date' => 'nullable|date', // <-- Added validation
            'end_date' => 'nullable|date|after_or_equal:start_date', // <-- Added validation
            'images.*' => 'nullable|image|max:5120',
            'deleted_attachments' => 'nullable|array',
        ]);

        $job->update($request->except(['images', 'deleted_attachments']));
        $workspacePath = "jobs/{$job->id}";

        if ($request->has('deleted_attachments')) {
            $attachmentsToDelete = Attachment::whereIn('id', $request->deleted_attachments)->get();
            foreach ($attachmentsToDelete as $attachment) {
                Storage::disk('public')->delete($attachment->file_path);
                $attachment->delete();
            }
        }

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $path = $file->store($workspacePath, 'public');
                $job->attachments()->create([
                    'file_path' => $path,
                    'file_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getMimeType(),
                ]);
            }
        }

        return response()->json(['message' => 'Job updated', 'job' => $job->load(['property', 'client', 'technician', 'attachments'])]);
    }

    public function updateStatus(Request $request, Job $job)
    {
        $validated = $request->validate([
            'status' => 'required|string',
            'note' => 'nullable|string'
        ]);

        $job->update(['status' => $validated['status']]);

        $job->timeline()->create([
            'user_id' => Auth::id(),
            'action_type' => 'status_updated',
            'description' => "Status updated to {$validated['status']}. " . ($validated['note'] ?? '')
        ]);

        return response()->json(['message' => 'Status updated', 'job' => $job->load('timeline.user')]);
    }

    public function assignTechnician(Request $request, Job $job)
    {
        $validated = $request->validate([
            'assigned_to' => 'required|exists:users,id'
        ]);

        $job->update(['assigned_to' => $validated['assigned_to']]);
        
        $technician = \App\Models\User::find($validated['assigned_to']);

        $job->timeline()->create([
            'user_id' => Auth::id(),
            'action_type' => 'assigned',
            'description' => "Work order assigned to field technician: {$technician->name}."
        ]);

        return response()->json([
            'message' => 'Technician assigned successfully', 
            'job' => $job->load(['property', 'client', 'technician', 'attachments', 'timeline.user'])
        ]);
    }
}