'use client';

import { useState, type ReactNode } from 'react';
import Image from 'next/image';
import { LoaderCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export function ReferenceImagePreview({ source, title, children }: { source: string; title: string; children: ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);

  return <Dialog onOpenChange={open => { if (open) setStatus('loading'); }}>
    <DialogTrigger asChild>{children}</DialogTrigger>
    <DialogContent className="reference-dialog" showCloseButton={false}>
      <DialogHeader>
        <div className="reference-dialog-heading">
          <DialogTitle>{title}</DialogTitle>
          <DialogClose asChild><Button variant="outline" size="icon" aria-label="關閉圖片預覽"><X /></Button></DialogClose>
        </div>
        <DialogDescription>可捲動查看圖片，關閉後繼續作答。</DialogDescription>
      </DialogHeader>
      <div className="reference-image-scroll" role="region" aria-label="圖片內容" tabIndex={0} aria-busy={status === 'loading'}>
        {status === 'loading' && <p className="reference-image-status" role="status"><LoaderCircle className="animate-spin" />正在載入圖片</p>}
        {status === 'error' && <div className="reference-image-status" role="alert"><p>圖片暫時無法載入。</p><Button variant="outline" onClick={() => { setStatus('loading'); setAttempt(value => value + 1); }}>重新載入圖片</Button></div>}
        <Image key={attempt} src={source} alt={title} width={1600} height={1000} unoptimized loading="eager" hidden={status !== 'ready'} className="reference-dialog-image" onLoad={() => setStatus('ready')} onError={() => setStatus('error')} />
      </div>
    </DialogContent>
  </Dialog>;
}
