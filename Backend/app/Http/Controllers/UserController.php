<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    public function register(Request $request)
    {
        // Gunakan Validator untuk error handling yang lebih baik
        $validator = Validator::make($request->all(), [
            'nama' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|max:255',
            'role' => 'required|in:admin,user',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors(),
                'message' => 'Validation failed'
            ], 422);
        }

        try {
            $user = User::create([
                'nama' => $request->nama,
                'email' => $request->email,
                'password' => Hash::make($request->password), // ✅ PERBAIKAN: HASH PASSWORD
                'role' => $request->role,
            ]);

            // Buat token untuk auto-login setelah registrasi (opsional)
            $token = $user->createToken('Personal Access Token')->plainTextToken;

            return response()->json([
                'success' => true,
                'user' => $user,
                'token' => $token, // Opsional: kirim token untuk auto-login
                'message' => 'User registered successfully'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to register user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors(),
                'message' => 'Validation failed'
            ], 422);
        }

        // Cari user berdasarkan email
        $user = User::where('email', $request->email)->first();

        // Cek jika user tidak ditemukan atau password salah
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials'
            ], 401);
        }

        // Hapus semua token lama (optional)
        $user->tokens()->delete();

        // Buat token baru
        $token = $user->createToken('Personal Access Token')->plainTextToken;

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'nama' => $user->nama,
                'email' => $user->email,
                'role' => $user->role,
                'created_at' => $user->created_at,
            ],
            'token' => $token,
            'message' => 'Login successful'
        ]);
    }

    // Read semua user
    public function index()
    {
        try {
            $allUsers = User::all();
            return response()->json([
                'success' => true,
                'data' => $allUsers,
                'message' => 'Users retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve users',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Update user
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'nama' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $id,
            'password' => 'sometimes|string|min:8',
            'role' => 'sometimes|in:admin,user',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors(),
                'message' => 'Validation failed'
            ], 422);
        }

        try {
            $user = User::find($id);
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            // Update hanya field yang ada di request
            if ($request->has('nama')) {
                $user->nama = $request->nama;
            }
            
            if ($request->has('email')) {
                $user->email = $request->email;
            }
            
            if ($request->has('password')) {
                $user->password = Hash::make($request->password);
            }
            
            if ($request->has('role')) {
                $user->role = $request->role;
            }

            $user->save();

            return response()->json([
                'success' => true,
                'user' => $user,
                'message' => 'User updated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Delete user
    public function delete($id)
    {
        try {
            $user = User::find($id);
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            // Cek jika user mencoba menghapus dirinya sendiri
            $currentUser = Auth::user();
            if ($currentUser && $currentUser->id == $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'You cannot delete your own account'
                ], 403);
            }

            $user->delete();

            return response()->json([
                'success' => true,
                'message' => 'User deleted successfully'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete user',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}