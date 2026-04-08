<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Property;
use App\Models\Job;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    public function index(Request $request)
    {
        if (!$request->user()->hasRole('Admin')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        // ADDED: withCount for active_jobs so the React frontend can filter the Air/Fill tables!
        $users = User::with('roles')
            ->withCount(['jobs as active_jobs' => function ($query) {
                $query->whereNotIn('status', ['Completed', 'Closed']);
            }])
            ->latest()->get();

        return response()->json($users);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string|max:20',
            'role' => ['required', Rule::in(['Admin', 'Employee', 'Client'])],
            'employee_number' => 'nullable|string',
            'passport_number' => 'nullable|string',
            'profession' => 'nullable|string',
            'skills' => 'nullable|string', 
            'avatar' => 'nullable|image|max:2048',
        ]);

        $userData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'] ?? null,
            'is_active' => true, // Default to active
        ];

        if ($validated['role'] !== 'Client') {
            $userData['employee_number'] = $validated['employee_number'] ?? null;
            $userData['passport_number'] = $validated['passport_number'] ?? null;
            $userData['profession'] = $validated['profession'] ?? null;
            $userData['skills'] = $validated['skills'] ? array_map('trim', explode(',', $validated['skills'])) : null;
        }

        if ($request->hasFile('avatar')) {
            $userData['avatar_path'] = $request->file('avatar')->store('avatars', 'public');
        }

        $user = User::create($userData);
        $user->assignRole($validated['role']);

        return response()->json(['message' => 'User created successfully', 'user' => $user->load('roles')], 201);
    }

    public function show(User $user)
    {
        $user->load('roles');
        
        $stats = [];
        
        // Generate Stats based on Role
        if ($user->hasRole('Client')) {
            $properties = Property::where('client_id', $user->id)->withCount('jobs')->get();
            $recentJobs = Job::where('client_id', $user->id)->with('property', 'technician')->latest()->take(5)->get();
            
            $stats = [
                'total_properties' => $properties->count(),
                'total_jobs' => Job::where('client_id', $user->id)->count(),
                'active_jobs' => Job::where('client_id', $user->id)->whereNotIn('status', ['Completed', 'Closed'])->count(),
            ];
            
            $user->properties_data = $properties;
            $user->recent_jobs = $recentJobs;
            $user->stats = $stats;
            
        } elseif ($user->hasRole('Employee') || $user->hasRole('Admin')) {
            $recentJobs = Job::where('assigned_to', $user->id)->with('property', 'client')->latest()->take(5)->get();
            
            $stats = [
                'total_assigned' => Job::where('assigned_to', $user->id)->count(),
                'completed_jobs' => Job::where('assigned_to', $user->id)->where('status', 'Completed')->count(),
                'active_jobs' => Job::where('assigned_to', $user->id)->whereNotIn('status', ['Completed', 'Closed'])->count(),
            ];
            
            $user->recent_jobs = $recentJobs;
            $user->stats = $stats;
        }

        return response()->json($user);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => ['sometimes', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'phone' => 'nullable|string|max:20',
            'is_active' => 'sometimes|boolean', // Added to support toggling
            'role' => ['sometimes', Rule::in(['Admin', 'Employee', 'Client'])],
            'employee_number' => 'nullable|string',
            'passport_number' => 'nullable|string',
            'profession' => 'nullable|string',
            'skills' => 'nullable|string',
            'avatar' => 'nullable|image|max:2048',
            'password' => 'nullable|string|min:8', // Added to support direct password resets
        ]);

        $updateData = $request->only(['name', 'email', 'phone', 'is_active']);

        // Handle Password Reset if provided
        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($request->password);
        }

        if (isset($validated['role']) && $validated['role'] !== 'Client') {
            $updateData['employee_number'] = $validated['employee_number'] ?? null;
            $updateData['passport_number'] = $validated['passport_number'] ?? null;
            $updateData['profession'] = $validated['profession'] ?? null;
            $updateData['skills'] = isset($validated['skills']) ? array_map('trim', explode(',', $validated['skills'])) : null;
        } else if (isset($validated['role']) && $validated['role'] === 'Client') {
            $updateData['employee_number'] = null;
            $updateData['passport_number'] = null;
            $updateData['profession'] = null;
            $updateData['skills'] = null;
        }

        if ($request->hasFile('avatar')) {
            if ($user->avatar_path) {
                Storage::disk('public')->delete($user->avatar_path);
            }
            $updateData['avatar_path'] = $request->file('avatar')->store('avatars', 'public');
        }

        $user->update($updateData);

        if ($request->has('role')) {
            $user->syncRoles([$request->role]);
        }

        return response()->json(['message' => 'User updated', 'user' => $user->load('roles')]);
    }

    public function destroy(User $user)
    {
        // Deletes the user (soft delete if configured)
        $user->delete();
        return response()->json(['message' => 'User deleted successfully']);
    }
}