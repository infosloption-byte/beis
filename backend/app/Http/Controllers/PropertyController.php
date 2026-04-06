<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Models\Attachment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage; // Added Storage facade

class PropertyController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        // Include attachments when loading lists
        if ($user->hasRole('Client')) {
            return response()->json($user->properties()->with(['attachments'])->withCount('jobs')->latest()->get());
        }
        return response()->json(Property::with(['client', 'attachments'])->withCount('jobs')->latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:Apartment,Commercial,Office,Warehouse,Other',
            'status' => 'sometimes|in:Active,Pending,Inactive',
            'client_id' => 'required|exists:users,id',
            'street' => 'nullable|string',
            'block_number' => 'nullable|string',
            'floor_room' => 'nullable|string',
            'city' => 'required|string',
            'state' => 'required|string',
            'postal_code' => 'nullable|string',
            'google_map_link' => 'nullable|url',
            'contact_person' => 'required|string',
            'contact_number' => 'required|string',
            'images.*' => 'nullable|image|max:5120',
        ]);

        $validated['address'] = $request->street . ' ' . $request->block_number;

        // 1. Create the Property first so we get its unique ID
        $property = Property::create($validated);

        // 2. Create a dedicated Workspace folder for this Job Site
        $workspacePath = "properties/{$property->id}";
        Storage::disk('public')->makeDirectory($workspacePath);

        // 3. Handle multiple new images
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $path = $file->store($workspacePath, 'public');
                $property->attachments()->create([
                    'file_path' => $path,
                    'file_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getMimeType(),
                ]);
            }
        }

        return response()->json(['message' => 'Property registered', 'property' => $property->load('attachments')], 201);
    }

    public function show(Property $property)
    {
        return response()->json($property->load(['client', 'jobs.technician', 'attachments']));
    }

    public function update(Request $request, Property $property)
    {
        // When using multipart/form-data from React, we send a POST with _method=PUT.
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:Apartment,Commercial,Office,Warehouse,Other',
            'status' => 'sometimes|in:Active,Pending,Inactive',
            'client_id' => 'required|exists:users,id',
            'street' => 'nullable|string',
            'block_number' => 'nullable|string',
            'floor_room' => 'nullable|string',
            'city' => 'required|string',
            'state' => 'required|string',
            'postal_code' => 'nullable|string',
            'google_map_link' => 'nullable|url',
            'contact_person' => 'required|string',
            'contact_number' => 'required|string',
            'images.*' => 'nullable|image|max:5120',
            'deleted_attachments' => 'nullable|array',
        ]);

        $property->update($request->except(['images', 'deleted_attachments']));
        $workspacePath = "properties/{$property->id}";

        // 1. Delete removed images
        if ($request->has('deleted_attachments')) {
            $attachmentsToDelete = Attachment::whereIn('id', $request->deleted_attachments)->get();
            foreach ($attachmentsToDelete as $attachment) {
                Storage::disk('public')->delete($attachment->file_path);
                $attachment->delete(); // This triggers the Audit Log!
            }
        }

        // 2. Add new images
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $path = $file->store($workspacePath, 'public');
                $property->attachments()->create([
                    'file_path' => $path,
                    'file_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getMimeType(),
                ]);
            }
        }

        return response()->json(['message' => 'Property updated', 'property' => $property->load(['client', 'attachments'])]);
    }
}