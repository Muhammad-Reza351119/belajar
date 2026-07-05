const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const envPath = path.join(root, '.env');

if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf8').split('\n').forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;

        const separator = trimmed.indexOf('=');
        if (separator === -1) return;

        const key = trimmed.slice(0, separator).trim();
        const value = trimmed.slice(separator + 1).trim();
        if (!process.env[key]) {
            process.env[key] = value;
        }
    });
}

const publicConfigPath = path.join(root, 'config.public.js');
const url = process.env.SUPABASE_URL || 'https://wjqmbuopmzgeebigiurm.supabase.co';
const anonKey = process.env.SUPABASE_ANON_KEY || '';

if (!anonKey) {
    if (fs.existsSync(publicConfigPath)) {
        console.log('SUPABASE_ANON_KEY tidak diset — memakai config.public.js yang sudah ada.');
        process.exit(0);
    }

    console.error('SUPABASE_ANON_KEY kosong. Set di Netlify → Environment variables, atau commit config.public.js.');
    process.exit(1);
}

const content = `window.SUPABASE_CONFIG = {
    url: '${url}',
    anonKey: '${anonKey}'
};
`;

fs.writeFileSync(path.join(root, 'config.js'), content);
fs.writeFileSync(publicConfigPath, content);
console.log('config.js dan config.public.js berhasil dibuat untuk deploy.');
