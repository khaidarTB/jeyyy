<?php

namespace App\Http\Controllers\Api;

use App\Models\Message;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function index()
    {
        return response()->json(
            Message::orderBy('created_at', 'desc')
                ->limit(100)
                ->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'text' => 'required|string|max:1000',
            'stickers' => 'array|nullable',
            'color' => 'string|in:pink,purple,blue,green,orange,rainbow',
        ]);

        $message = Message::create([
            'text' => $validated['text'],
            'stickers' => $validated['stickers'] ?? ['💕'],
            'color' => $validated['color'] ?? 'pink',
        ]);

        return response()->json($message, 201);
    }

    public function show(Message $message)
    {
        return response()->json($message);
    }

    public function update(Request $request, Message $message)
    {
        $validated = $request->validate([
            'text' => 'string|max:1000',
            'stickers' => 'array',
            'color' => 'string|in:pink,purple,blue,green,orange,rainbow',
        ]);

        $message->update($validated);
        return response()->json($message);
    }

    public function destroy(Message $message)
    {
        $message->delete();
        return response()->json(null, 204);
    }
}
