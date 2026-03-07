import React from 'react';
import { Button } from '@/components/ui/button';

export default function TestShadcnPage() {
    return (
        <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center space-y-8 p-10">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold tracking-tight">Tailwind + Shadcn Verification</h1>
                <p className="text-zinc-400">If you can read this and the buttons below look good, the setup worked.</p>
            </div>

            <div className="flex gap-4 p-6 bg-zinc-900 rounded-xl border border-zinc-800">
                <Button variant="default">Default Button</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
            </div>
        </div>
    );
}
