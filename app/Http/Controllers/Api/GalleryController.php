<?php

namespace App\Http\Controllers\Api;

use App\Models\Gallery;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class GalleryController extends Controller
{
    public function index()
    {
        return response()->json(
            Gallery::orderBy('created_at', 'desc')
                ->limit(100)
                ->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'file' => 'required|file|mimes:jpeg,png,jpg,mp4,webm,mov,avi|max:20480',
            'caption' => 'string|nullable|max:500',
        ]);

        $file = $validated['file'];
        $filename = 'gallery_' . time() . '_' . $file->getClientOriginalName();
        $path = $file->storeAs('gallery', $filename, 'public');

        $gallery = Gallery::create([
            'url' => Storage::url($path),
            'type' => $file->getMimeType(),
            'caption' => $validated['caption'] ?? null,
            'filename' => $filename,
        ]);

        return response()->json($gallery, 201);
    }

    public function show(Gallery $gallery)
    {
        return response()->json($gallery);
    }

    public function update(Request $request, Gallery $gallery)
    {
        $validated = $request->validate([
            'caption' => 'string|max:500',
        ]);

        $gallery->update($validated);
        return response()->json($gallery);
    }

    public function destroy(Gallery $gallery)
    {
        Storage::disk('public')->delete('gallery/' . $gallery->filename);
        $gallery->delete();
        return response()->json(null, 204);
    }
}
