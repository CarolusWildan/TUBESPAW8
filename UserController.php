<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'nama'=>'required|string|max:255',
            'email'=>'required|string|email|max:255|unique:users',
            'password'=>'required|string|max:255|min:8',
            'role'     => 'required|in:admin,user',
        ]);

        $user = User::create([
            'nama'  => $request->nama,
            'email' => $request->email,
            'password' => $request->password,
            'role' => $request->role,
        ]);

        return response()->json([
            'user'=> $user,
            'message' => 'user registered successfully'
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email'=>'required|string|email',
            'password'=>'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if(!$user || !Hash::check($request->password, $user->password)){
            return response()->json(['message' => 'input invalid'],401);
        }

        $token = $user->createToken('Personal Access Token')->plainTextToken;

        return response()->json([
            'detail' => $user,
            'token' => $token
        ]);
    }


    //read
    public function index()
    {
        $authUser = Auth::user();

        if ($authUser->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $allUsers = User::all();
        return response()->json($allUsers);
    }

    public function showSelf()
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Not authenticated'], 401);
        }

        return response()->json($user);
    }

    public function show($id)
    {
        $authUser = Auth::user();

        if ($authUser->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        return response()->json($user);
    }

    // Update
    public function update(Request $request)
    {
        $validatedData = $request->validate([
            'password' => 'required|string|min:8',
        ]);

        $user = Auth::user();
        $user->update([
            'password' => Hash::make($validatedData['password']),
        ]);

        return response()->json([
            'message' => 'Password updated successfully',
        ]);
    }

    // Delete
    public function delete()
    {
        $user = Auth::user();

        $user->delete();

        return response()->json([
            'message' => 'Account deleted successfully',
        ], 200);
    }

}
