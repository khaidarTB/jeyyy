<?php

namespace App\Http\Controllers;

use App\Models\Gallery;
use App\Models\Message;
use App\Models\Playlist;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class RealtimeController extends Controller
{
    public function stream(Request $request): StreamedResponse
    {
        $initialVersion = (string) $request->query('since', '');

        return response()->stream(function () use ($initialVersion) {
            $startedAt = time();
            $knownVersion = $initialVersion;

            while (true) {
                if (connection_aborted()) {
                    break;
                }

                $currentVersion = $this->stateVersion();

                if ($currentVersion !== $knownVersion) {
                    $this->emit('sync', ['version' => $currentVersion]);
                    $knownVersion = $currentVersion;
                } else {
                    $this->emit('ping', ['ok' => true]);
                }

                if ((time() - $startedAt) >= 20) {
                    break;
                }

                sleep(1);
            }
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache, no-transform',
            'Connection' => 'keep-alive',
            'X-Accel-Buffering' => 'no',
        ]);
    }

    private function stateVersion(): string
    {
        $messageMax = Message::max('updated_at');
        $galleryMax = Gallery::max('updated_at');
        $playlistMax = Playlist::max('updated_at');

        return implode('|', [
            optional($messageMax)->format('Uu') ?? '0',
            optional($galleryMax)->format('Uu') ?? '0',
            optional($playlistMax)->format('Uu') ?? '0',
            (string) Message::count(),
            (string) Gallery::count(),
            (string) Playlist::count(),
        ]);
    }

    private function emit(string $event, array $data): void
    {
        echo "event: {$event}\n";
        echo 'data: ' . json_encode($data) . "\n\n";

        @ob_flush();
        flush();
    }
}
