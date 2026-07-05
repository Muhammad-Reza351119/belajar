<?php
/**
 * Generate config.js dari file .env
 * Jalankan: php generate-config.php
 */

$envFile = __DIR__ . '/.env';

if (!file_exists($envFile)) {
    fwrite(STDERR, "File .env tidak ditemukan. Salin .env.example ke .env lalu isi kredensialnya.\n");
    exit(1);
}

$vars = [];
foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
    $line = trim($line);

    if ($line === '' || str_starts_with($line, '#')) {
        continue;
    }

    $parts = explode('=', $line, 2);
    if (count($parts) === 2) {
        $vars[trim($parts[0])] = trim($parts[1]);
    }
}

$url = $vars['SUPABASE_URL'] ?? '';
$key = $vars['SUPABASE_ANON_KEY'] ?? '';

if ($url === '' || $key === '') {
    fwrite(STDERR, "SUPABASE_URL dan SUPABASE_ANON_KEY wajib diisi di .env\n");
    exit(1);
}

$content = <<<JS
window.SUPABASE_CONFIG = {
    url: '{$url}',
    anonKey: '{$key}'
};

JS;

file_put_contents(__DIR__ . '/config.js', $content);
file_put_contents(__DIR__ . '/config.public.js', $content);
echo "config.js dan config.public.js berhasil dibuat dari .env\n";
