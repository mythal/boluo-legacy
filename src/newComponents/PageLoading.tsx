import React, { useRef } from 'react';
import { useLottie } from '../hooks';
import { cls } from '../classname';
// https://lottiefiles.com/3357-paper
import paper from './paper.json';

interface Props {
  className?: string;
}

function PageLoading({ className }: Props) {
  const container = useRef<HTMLDivElement | null>(null);
  useLottie(container, paper);
  return <div className={cls('w-32 h-32', className)} ref={container} />;
}

export default React.memo(PageLoading);
