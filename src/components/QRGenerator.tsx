import { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import { Download, Link as LinkIcon } from 'lucide-react';

export function QRGenerator() {
    const [url, setUrl] = useState('https://www.google.com');
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        generateQR();
    }, [url]);

    const generateQR = () => {
        if (!url) {
            setQrCodeDataUrl('');
            return;
        }
        // Genera para el canvas (mayor calidad para descarga)
        QRCode.toCanvas(canvasRef.current, url, { width: 300, margin: 2, color: { dark: '#000000', light: '#FFFFFF' } }, (error) => {
            if (error) console.error(error);
        });
        // Genera para la vista previa <img>
        QRCode.toDataURL(url, { width: 300, margin: 2, color: { dark: '#000000', light: '#FFFFFF' } }, (err, dataUrl) => {
            if (err) console.error(err);
            setQrCodeDataUrl(dataUrl);
        });
    };

    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const pngUrl = canvas
                .toDataURL("image/png")
                .replace("image/png", "image/octet-stream");
            let downloadLink = document.createElement("a");
            downloadLink.href = pngUrl;
            downloadLink.download = "mi-codigo-qr.png";
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    };

    return (
        <div className="container max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-10 grid md:grid-cols-2 gap-10">
            {/* Columna de Controles */}
            <div className="flex flex-col">
                <h1 className="text-3xl font-bold text-dark-text mb-2">Generador de QR</h1>
                <p className="text-gray-500 mb-6">Crea y personaliza tus códigos QR fácilmente.</p>

                <div className="bg-light-bg p-4 rounded-lg border">
                    <h2 className="font-semibold text-lg mb-4">Contenido del QR</h2>
                    <label htmlFor="url-input" className="font-medium text-gray-700 mb-2 block">
                        Introduce tu URL
                    </label>
                    <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            id="url-input"
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://ejemplo.com"
                            className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-brand-primary outline-none"
                        />
                    </div>
                </div>

                 {/* Aquí irían más opciones de personalización (colores, logo, etc.) */}
            </div>

            {/* Columna de Vista Previa */}
            <div className="bg-light-bg rounded-lg p-6 flex flex-col items-center justify-center border-2 border-dashed">
                <h2 className="text-xl font-bold text-dark-text mb-4">Vista Previa</h2>
                <div className="w-64 h-64 bg-white p-4 rounded-lg shadow-md mb-6 flex items-center justify-center">
                    {qrCodeDataUrl ? (
                        <img src={qrCodeDataUrl} alt="Generated QR Code" />
                    ) : (
                        <div className="text-gray-400 text-center">Introduce datos para generar el QR</div>
                    )}
                </div>
                {/* Canvas oculto para descarga de alta calidad */}
                <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                
                <button
                    onClick={handleDownload}
                    disabled={!url}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Download size={20} />
                    Descargar PNG
                </button>
            </div>
        </div>
    );
}