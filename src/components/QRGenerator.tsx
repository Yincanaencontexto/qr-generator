import { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import { Download, Link as LinkIcon, Type } from 'lucide-react';

// <-- NUEVO: Definimos los tipos de QR que soportaremos
type QRType = 'url' | 'text' | 'phone' | 'email';

export function QRGenerator() {
    // <-- NUEVO: Estado para saber qué tipo de QR está seleccionado
    const [qrType, setQrType] = useState<QRType>('url');
    
    // <-- NUEVO: Estado para guardar el valor de entrada, sea cual sea
    const [inputValue, setInputValue] = useState('https://www.google.com');

    const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Este efecto se ejecuta cada vez que el valor de entrada cambia
    useEffect(() => {
        if (!inputValue.trim()) {
            setQrCodeDataUrl('');
            return;
        }
        generateQR(inputValue);
    }, [inputValue]);

    const generateQR = (data: string) => {
        QRCode.toCanvas(canvasRef.current, data, { width: 300, margin: 2, color: { dark: '#000000', light: '#FFFFFF' } }, (error) => {
            if (error) console.error(error);
        });
        QRCode.toDataURL(data, { width: 300, margin: 2 }, (err, dataUrl) => {
            if (err) console.error(err);
            setQrCodeDataUrl(dataUrl);
        });
    };

    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
            const downloadLink = document.createElement("a");
            downloadLink.href = pngUrl;
            downloadLink.download = `qr-code-${qrType}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    };
    
    // <-- NUEVO: Función para cambiar el tipo de QR y reiniciar el input
    const handleTypeChange = (type: QRType) => {
        setQrType(type);
        // Reiniciamos el valor con un ejemplo apropiado
        if (type === 'url') setInputValue('https://');
        if (type === 'text') setInputValue('¡Hola mundo!');
        if (type === 'phone') setInputValue('');
        if (type === 'email') setInputValue('');
    }

    // <-- NUEVO: Componente pequeño para el formulario de cada tipo
    const renderForm = () => {
        switch (qrType) {
            case 'url':
                return (
                    <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="url"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="https://ejemplo.com"
                            className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-brand-primary outline-none"
                        />
                    </div>
                );
            case 'text':
                return (
                     <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Escribe tu texto aquí..."
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-brand-primary outline-none"
                        rows={4}
                    />
                );
            // Aquí añadiremos más 'case' para Teléfono, Email, etc. en el futuro
            default:
                return null;
        }
    }

    return (
        <div className="container max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-10 grid md:grid-cols-2 gap-10">
            {/* Columna de Controles */}
            <div className="flex flex-col">
                <h1 className="text-3xl font-bold text-dark-text mb-2">Generador de QR Profesional</h1>
                <p className="text-gray-500 mb-6">Crea y personaliza tus códigos QR fácilmente.</p>

                {/* <-- NUEVO: Selector de tipo de QR --> */}
                <div className="flex flex-wrap gap-2 border-b pb-4 mb-4">
                    <button onClick={() => handleTypeChange('url')} className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${qrType === 'url' ? 'bg-brand-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                        <LinkIcon size={18}/> URL
                    </button>
                    <button onClick={() => handleTypeChange('text')} className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${qrType === 'text' ? 'bg-brand-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                        <Type size={18}/> Texto
                    </button>
                    {/* Botones para futuras funcionalidades */}
                </div>
                
                <div className="bg-light-bg p-4 rounded-lg border">
                    <h2 className="font-semibold text-lg mb-4">Contenido del QR</h2>
                    {renderForm()}
                </div>

                 {/* Aquí irían las opciones de personalización (colores, logo, etc.) */}
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
                <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                
                <button
                    onClick={handleDownload}
                    disabled={!inputValue.trim()}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Download size={20} />
                    Descargar PNG
                </button>
            </div>
        </div>
    );
}
