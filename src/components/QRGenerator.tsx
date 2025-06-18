import { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
// <-- CORRECCIÓN #1: Eliminado 'ImageIcon' porque no se usa en el HTML.
import { Download, Link as LinkIcon, Type, Palette } from 'lucide-react';

type QRType = 'url' | 'text';
// <-- CORRECCIÓN #2: Le decimos a TypeScript cuáles son los niveles válidos.
type QRErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export function QRGenerator() {
    const [qrType, setQrType] = useState<QRType>('url');
    const [inputValue, setInputValue] = useState('https://www.google.com');
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [colorDark, setColorDark] = useState('#000000');
    const [colorLight, setColorLight] = useState('#FFFFFF');
    const [logo, setLogo] = useState<string | null>(null);

    useEffect(() => {
        generateQR();
    }, [inputValue, colorDark, colorLight, logo]);

    const generateQR = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        if (!inputValue.trim()) {
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
            setQrCodeDataUrl('');
            return;
        }

        const options = {
            width: 300,
            margin: 2,
            // <-- CORRECCIÓN #2 (Aplicación): Le decimos que 'H' es de tipo QRErrorCorrectionLevel
            errorCorrectionLevel: 'H' as QRErrorCorrectionLevel, 
            color: { dark: colorDark, light: colorLight },
        };

        QRCode.toCanvas(canvas, inputValue, options, (error) => {
            if (error) {
                console.error(error);
                return;
            }

            if (logo) {
                const ctx = canvas.getContext('2d');
                if (!ctx) return;
                const logoImg = new Image();
                logoImg.src = logo;
                logoImg.onload = () => {
                    const logoSize = canvas.width * 0.25;
                    const x = (canvas.width - logoSize) / 2;
                    const y = (canvas.height - logoSize) / 2;
                    const borderSize = 5;
                    ctx.fillStyle = colorLight;
                    ctx.fillRect(x - borderSize, y - borderSize, logoSize + borderSize * 2, logoSize + borderSize * 2);
                    ctx.drawImage(logoImg, x, y, logoSize, logoSize);
                    setQrCodeDataUrl(canvas.toDataURL());
                };
            } else {
                setQrCodeDataUrl(canvas.toDataURL());
            }
        });
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setLogo(event.target?.result as string);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
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

    const handleTypeChange = (newType: QRType) => {
        setQrType(newType);
        if (newType === 'url') setInputValue('https://');
        if (newType === 'text') setInputValue('¡Hola mundo!');
    };

    const renderForm = () => {
        switch (qrType) {
            case 'url':
                return (
                    <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input type="url" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="https://ejemplo.com" className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-brand-primary outline-none" />
                    </div>
                );
            case 'text':
                return <textarea value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Escribe tu texto aquí..." className="w-full p-2 border rounded-md focus:ring-2 focus:ring-brand-primary outline-none" rows={4} />;
            default:
                return null;
        }
    };

    return (
        <div className="container max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-10 grid md:grid-cols-2 gap-10">
            <div className="flex flex-col space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-dark-text mb-2">Generador de QR Profesional</h1>
                    <p className="text-gray-500">Crea y personaliza tus códigos QR fácilmente.</p>
                </div>
                <div className="flex flex-wrap gap-2 border-b pb-4">
                    <button onClick={() => handleTypeChange('url')} className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${qrType === 'url' ? 'bg-brand-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}><LinkIcon size={18} /> URL</button>
                    <button onClick={() => handleTypeChange('text')} className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${qrType === 'text' ? 'bg-brand-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}><Type size={18} /> Texto</button>
                </div>
                <div className="bg-light-bg p-4 rounded-lg border">
                    <h2 className="font-semibold text-lg mb-4">Contenido del QR</h2>
                    {renderForm()}
                </div>
                <div className="bg-light-bg p-4 rounded-lg border">
                    <h2 className="font-semibold text-lg mb-4 flex items-center gap-2"><Palette size={20} /> Personalización</h2>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label htmlFor="color-dark" className="block text-sm font-medium text-gray-700 mb-1">Color Puntos</label>
                            <input id="color-dark" type="color" value={colorDark} onChange={(e) => setColorDark(e.target.value)} className="w-full h-10 p-1 border rounded-md cursor-pointer" />
                        </div>
                        <div>
                            <label htmlFor="color-light" className="block text-sm font-medium text-gray-700 mb-1">Color Fondo</label>
                            <input id="color-light" type="color" value={colorLight} onChange={(e) => setColorLight(e.target.value)} className="w-full h-10 p-1 border rounded-md cursor-pointer" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="logo-upload" className="block text-sm font-medium text-gray-700 mb-1">Logo (opcional)</label>
                        <input id="logo-upload" type="file" accept="image/png, image/jpeg, image/svg+xml" onChange={handleLogoUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20 cursor-pointer" />
                        {logo && <button onClick={() => setLogo(null)} className="text-xs text-red-500 hover:underline mt-2">Quitar logo</button>}
                    </div>
                </div>
            </div>
            <div className="bg-light-bg rounded-lg p-6 flex flex-col items-center justify-center border-2 border-dashed">
                <h2 className="text-xl font-bold text-dark-text mb-4">Vista Previa</h2>
                <div className="w-64 h-64 bg-white p-4 rounded-lg shadow-md mb-6 flex items-center justify-center" style={{ backgroundColor: colorLight }}>
                    {qrCodeDataUrl ? <img src={qrCodeDataUrl} alt="Generated QR Code" /> : <div className="text-gray-400 text-center">Introduce datos para generar el QR</div>}
                </div>
                <canvas ref={canvasRef} width="300" height="300" style={{ display: 'none' }}></canvas>
                <button onClick={handleDownload} disabled={!inputValue.trim()} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed">
                    <Download size={20} /> Descargar PNG
                </button>
            </div>
        </div>
    );
}
