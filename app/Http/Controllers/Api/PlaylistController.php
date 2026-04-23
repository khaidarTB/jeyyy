<?php

namespace App\Http\Controllers\Api;

use App\Models\Playlist;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PlaylistController extends Controller
{
    public function index()
    {
        return response()->json(
            Playlist::orderBy('created_at', 'asc')
                ->limit(100)
                ->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'file' => 'required|file|mimes:mp3,wav,ogg,m4a|max:10240',
            'name' => 'required|string|max:100',
        ]);

        $file = $validated['file'];
        $filename = 'playlist_' . time() . '_' . $file->getClientOriginalName();
        $path = $file->storeAs('playlist', $filename, 'public');

        $playlist = Playlist::create([
            'url' => Storage::url($path),
            'name' => $validated['name'],
            'filename' => $filename,
        ]);

        return response()->json($playlist, 201);
    }

    public function show(Playlist $playlist)
    {
        return response()->json($playlist);
    }

    public function update(Request $request, Playlist $playlist)
    {
        $validated = $request->validate([
            'name' => 'string|max:100',
        ]);

        $playlist->update($validated);
        return response()->json($playlist);
    }

    public function destroy(Playlist $playlist)
    {
        Storage::disk('public')->delete('playlist/' . $playlist->filename);
        $playlist->delete();
        return response()->json(null, 204);
    }
}
