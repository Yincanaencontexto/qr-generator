import { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import { Download, Link as LinkIcon, Type, Palette, Mail, MessageSquare, Wifi, Frame } from 'lucide-react';

// Tipos de QR y niveles de corrección
type QRType = 'url' | 'text' | 'email' | 'sms' | 'wifi';
type QRErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';
type FrameType = 'none' | 'scan-me-1' | 'scan-me-2';

export function QRGenerator() {
    // --- ESTADOS ---
    const [qrType, setQrType] = useState<QRType>('url');
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
    const qrCanvasRef = useRef<HTMLCanvasElement>(null);
    const finalCanvasRef = useRef<HTMLCanvasElement>(null);

    // Estados para datos de entrada
    const [inputValue, setInputValue] = useState('https://www.google.com');
    const [emailData, setEmailData] = useState({ to: '', subject: '' });
    const [smsData, setSmsData] = useState({ number: '', message: '' });
    const [wifiData, setWifiData] = useState({ ssid: '', password: '', encryption: 'WPA' });

    // Estados de personalización
    const [colorDark, setColorDark] = useState('#000000');
    const [colorLight, setColorLight] = useState('#FFFFFF');
    const [logo, setLogo] = useState<string | null>(null);
    const [frame, setFrame] = useState<FrameType>('none');


    // --- EFECTO PRINCIPAL ---
    useEffect(() => {
        let finalData = '';
        let isEmpty = true;
        switch (qrType) {
            case 'url': case 'text': finalData = inputValue; isEmpty = !inputValue.trim(); break;
            case 'email': finalData = `mailto:${emailData.to}?subject=${encodeURIComponent(emailData.subject)}`; isEmpty = !emailData.to.trim(); break;
            case 'sms': finalData = `SMSTO:${smsData.number}:${encodeURIComponent(smsData.message)}`; isEmpty = !smsData.number.trim(); break;
            case 'wifi': finalData = `WIFI:T:${wifiData.encryption};S:${wifiData.ssid};P:${wifiData.password};;`; isEmpty = !wifiData.ssid.trim(); break;
        }
        if (isEmpty) {
            setQrCodeDataUrl('');
        } else {
            generateQR(finalData);
        }
    }, [inputValue, emailData, smsData, wifiData, qrType, colorDark, colorLight, logo, frame]);

    // --- FUNCIÓN PARA GENERAR EL CÓDIGO QR Y EL MARCO ---
    const generateQR = (data: string) => {
        const qrCanvas = qrCanvasRef.current;
        if (!qrCanvas) return;

        const options = { width: 300, margin: 2, errorCorrectionLevel: 'H' as QRErrorCorrectionLevel, color: { dark: colorDark, light: colorLight } };
        QRCode.toCanvas(qrCanvas, data, options, (error) => {
            if (error) { console.error(error); return; }
            if (logo) {
                const ctx = qrCanvas.getContext('2d'); if (!ctx) return;
                const logoImg = new Image(); logoImg.src = logo;
                logoImg.onload = () => {
                    const logoSize = qrCanvas.width * 0.25, x = (qrCanvas.width - logoSize) / 2, y = (qrCanvas.height - logoSize) / 2, borderSize = 5;
                    ctx.fillStyle = colorLight; ctx.fillRect(x - borderSize, y - borderSize, logoSize + borderSize * 2, logoSize + borderSize * 2);
                    ctx.drawImage(logoImg, x, y, logoSize, logoSize);
                    drawFinalImage();
                };
            } else {
                drawFinalImage();
            }
        });
    };

    const drawFinalImage = () => {
        const qrCanvas = qrCanvasRef.current;
        const finalCanvas = finalCanvasRef.current;
        if (!qrCanvas || !finalCanvas) return;
        const ctx = finalCanvas.getContext('2d');
        if (!ctx) return;

        finalCanvas.width = 400;
        finalCanvas.height = 400;

        ctx.fillStyle = colorLight;
        ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
        
        const qrSize = 300;
        let qrX = (finalCanvas.width - qrSize) / 2;
        let qrY = (finalCanvas.height - qrSize) / 2;

        if (frame === 'none') {
            ctx.drawImage(qrCanvas, qrX, qrY);
        } else {
            ctx.fillStyle = colorDark;
            ctx.font = 'bold 30px sans-serif';
            ctx.textAlign = 'center';

            if (frame === 'scan-me-1') {
                const textY = 40;
                qrY = textY + 10;
                ctx.fillText('SCAN ME', finalCanvas.width / 2, textY);
                ctx.drawImage(qrCanvas, qrX, qrY);
            } else if (frame === 'scan-me-2') {
                qrY = 20;
                const textY = qrY + qrSize + 40;
                ctx.drawImage(qrCanvas, qrX, qrY);
                ctx.fillText('SCAN ME', finalCanvas.width / 2, textY);
            }
        }
        setQrCodeDataUrl(finalCanvas.toDataURL());
    }

    // --- MANEJADORES DE EVENTOS ---
    const handleDownload = () => {
        const canvas = finalCanvasRef.current;
        if (canvas) {
            const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
            const downloadLink = document.createElement("a");
            downloadLink.href = pngUrl;
            downloadLink.download = `qr-code-final.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    };
    
    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => setLogo(event.target?.result as string);
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    
    const handleTypeChange = (newType: QRType) => {
        setQrType(newType);
        setInputValue(newType === 'url' ? 'https://' : '¡Hola Mundo!');
        setEmailData({ to: '', subject: '' });
        setSmsData({ number: '', message: '' });
        setWifiData({ ssid: '', password: '', encryption: 'WPA' });
    };
    
    // --- RENDERIZADO ---
    const renderForm = () => {
        switch (qrType) {
            case 'url':
                return <div className="relative"> <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /> <input type="url" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="https://ejemplo.com" className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-brand-primary outline-none" /> </div>;
            case 'text':
                return <textarea value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Escribe tu texto aquí..." className="w-full p-2 border rounded-md focus:ring-2 focus:ring-brand-primary outline-none" rows={4} />;
            case 'email':
                return ( <div className="space-y-4"> <input type="email" value={emailData.to} onChange={(e) => setEmailData({...emailData, to: e.target.value})} placeholder="Email del destinatario" className="w-full p-2 border rounded-md"/> <input type="text" value={emailData.subject} onChange={(e) => setEmailData({...emailData, subject: e.target.value})} placeholder="Asunto (opcional)" className="w-full p-2 border rounded-md"/> </div> );
            case 'sms':
                return ( <div className="space-y-4"> <input type="tel" value={smsData.number} onChange={(e) => setSmsData({...smsData, number: e.target.value})} placeholder="Número de teléfono" className="w-full p-2 border rounded-md"/> <textarea value={smsData.message} onChange={(e) => setSmsData({...smsData, message: e.target.value})} placeholder="Mensaje (opcional)" className="w-full p-2 border rounded-md" rows={3}/> </div> );
            case 'wifi':
                return ( <div className="space-y-4"> <input type="text" value={wifiData.ssid} onChange={(e) => setWifiData({...wifiData, ssid: e.target.value})} placeholder="Nombre de la Red (SSID)" className="w-full p-2 border rounded-md"/> <input type="password" value={wifiData.password} onChange={(e) => setWifiData({...wifiData, password: e.target.value})} placeholder="Contraseña" className="w-full p-2 border rounded-md"/> <div> <label className="text-sm font-medium text-gray-700">Cifrado</label> <select value={wifiData.encryption} onChange={(e) => setWifiData({...wifiData, encryption: e.target.value})} className="w-full p-2 mt-1 border rounded-md bg-white"> <option value="WPA">WPA/WPA2</option> <option value="WEP">WEP</option> <option value="nopass">Ninguno</option> </select> </div> </div> );
            default:
                return null;
        }
    };

    return (
        <div className="container max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-10 grid lg:grid-cols-2 gap-10">
            <div className="flex flex-col space-y-6">
                 <div> <h1 className="text-3xl font-bold text-dark-text mb-2">Generador de QR Profesional</h1> <p className="text-gray-500">Crea y personaliza tus códigos QR fácilmente.</p> </div>
                <div className="flex flex-wrap gap-2 border-b pb-4">
                    <button onClick={() => handleTypeChange('url')} className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${qrType === 'url' ? 'bg-brand-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}><LinkIcon size={18} /> URL</button>
                    <button onClick={() => handleTypeChange('text')} className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${qrType === 'text' ? 'bg-brand-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}><Type size={18} /> Texto</button>
                    <button onClick={() => handleTypeChange('email')} className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${qrType === 'email' ? 'bg-brand-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}><Mail size={18} /> Email</button>
                    <button onClick={() => handleTypeChange('sms')} className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${qrType === 'sms' ? 'bg-brand-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}><MessageSquare size={18} /> SMS</button>
                    <button onClick={() => handleTypeChange('wifi')} className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${qrType === 'wifi' ? 'bg-brand-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}><Wifi size={18} /> WiFi</button>
                </div>
                <div className="bg-light-bg p-4 rounded-lg border">
                    <h2 className="font-semibold text-lg mb-4">Contenido del QR</h2>
                    {renderForm()}
                </div>
                <div className="bg-light-bg p-4 rounded-lg border">
                    <h2 className="font-semibold text-lg mb-4 flex items-center gap-2"><Palette size={20} /> Personalización</h2>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div><label htmlFor="color-dark" className="block text-sm font-medium text-gray-700 mb-1">Color Puntos</label><input id="color-dark" type="color" value={colorDark} onChange={(e) => setColorDark(e.target.value)} className="w-full h-10 p-1 border rounded-md cursor-pointer" /></div>
                        <div><label htmlFor="color-light" className="block text-sm font-medium text-gray-700 mb-1">Color Fondo</label><input id="color-light" type="color" value={colorLight} onChange={(e) => setColorLight(e.target.value)} className="w-full h-10 p-1 border rounded-md cursor-pointer" /></div>
                    </div>
                    <div>
                        <label htmlFor="logo-upload" className="block text-sm font-medium text-gray-700 mb-1">Logo (opcional)</label>
                        <input id="logo-upload" type="file" accept="image/png, image/jpeg, image/svg+xml" onChange={handleLogoUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20 cursor-pointer" />
                        {logo && <button onClick={() => setLogo(null)} className="text-xs text-red-500 hover:underline mt-2">Quitar logo</button>}
                    </div>
                </div>
                 <div className="bg-light-bg p-4 rounded-lg border">
                    <h2 className="font-semibold text-lg mb-4 flex items-center gap-2"><Frame size={20} /> Marcos</h2>
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => setFrame('none')} className={`px-3 py-2 text-sm rounded-lg border-2 ${frame === 'none' ? 'border-brand-primary bg-brand-primary/10' : 'border-gray-200'}`}>Sin Marco</button>
                        <button onClick={() => setFrame('scan-me-1')} className={`px-3 py-2 text-sm rounded-lg border-2 ${frame === 'scan-me-1' ? 'border-brand-primary bg-brand-primary/10' : 'border-gray-200'}`}>Scan Me #1</button>
                        <button onClick={() => setFrame('scan-me-2')} className={`px-3 py-2 text-sm rounded-lg border-2 ${frame === 'scan-me-2' ? 'border-brand-primary bg-brand-primary/10' : 'border-gray-200'}`}>Scan Me #2</button>
                    </div>
                </div>
            </div>
            <div className="bg-light-bg rounded-lg p-6 flex flex-col items-center justify-center border-2 border-dashed">
                <h2 className="text-xl font-bold text-dark-text mb-4">Vista Previa</h2>
                <div className="w-80 h-80 bg-white p-2 rounded-lg shadow-md mb-6 flex items-center justify-center">
                    {qrCodeDataUrl ? <img src={qrCodeDataUrl} alt="Generated QR Code" style={{maxWidth: '100%', maxHeight: '100%'}} /> : <div className="text-gray-400 text-center">Introduce datos para generar el QR</div>}
                </div>
                <canvas ref={qrCanvasRef} width="300" height="300" style={{ display: 'none' }}></canvas>
                <canvas ref={finalCanvasRef} width="400" height="400" style={{ display: 'none' }}></canvas>
                <button onClick={handleDownload} disabled={!qrCodeDataUrl} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"><Download size={20} /> Descargar PNG</button>
            </div>
        </div>
    );
}
