import { useEffect, useRef } from 'react';
import Script from 'next/script';

interface AddressSearchProps {
  onComplete: (data: any) => void;
}

declare global {
  interface Window {
    daum: any;
  }
}

const AddressSearch = ({ onComplete }: AddressSearchProps) => {
  const postcodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      new window.daum.Postcode({
        oncomplete: onComplete,
        width: '100%',
        height: '100%',
      }).embed(postcodeRef.current);
    };

    return () => {
      document.head.removeChild(script);
    };
  }, [onComplete]);

  return (
    <div 
      ref={postcodeRef} 
      style={{ width: '100%', height: '400px' }}
    />
  );
};

export default AddressSearch; 