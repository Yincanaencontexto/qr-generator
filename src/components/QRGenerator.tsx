import { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
// <-- NUEVO: Añadidos los iconos para Email y SMS
import { Download, Link as LinkIcon, Type, Palette, Mail, MessageSquare } from 'lucide-react';

// <-- NUEVO: Ampliamos los tipos de QR soportados
type QRType = 'url' | 'text' | 'email' | 'sms';
type QRErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export function QRGenerator() {
    const [qrType, setQrType] = useState<QRType>('url');
    // Este estado ahora manejará solo los inputs simples (URL y Texto)
    const [inputValue, setInputValue] = useState('https://www.google.com');

    // <-- NUEVO: Estados específicos para los formularios complejos
    const [emailData, setEmailData] = useState({ to: '', subject: '' });
    const [smsData, setSmsData] = useState({ number: '', message: '' });

    const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [colorDark, setColorDark] = useState('#000000');
    const [colorLight, setColorLight] = useState('#FFFFFF');
    const [logo, setLogo] = useState<string | null>(null);

    // <-- NUEVO: Este efecto ahora construye el dato final del QR dependiendo del tipo
    useEffect(() => {
        let finalData = '';
        let isEmpty = true;

        switch (qrType) {
            case 'url':
            case 'text':
                finalData = inputValue;
                isEmpty = !inputValue.trim();
                break;
            case 'email':
                finalData = `mailto:${emailData.to}?subject=${encodeURIComponent(emailData.subject)}`;
                isEmpty = !emailData.to.trim();
                break;
            case 'sms':
                finalData = `SMSTO:${smsData.number}:${smsData.message}`;
                isEmpty = !smsData.number.trim();
                break;
        }

        if (isEmpty) {
            setQrCodeDataUrl('');
        } else {
            generateQR(finalData);
        }
    }, [inputValue, emailData, smsData, qrType, colorDark, colorLight, logo]);


    const generateQR = (data: string) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const options = {
            width: 300,
            margin: 2,
            errorCorrectionLevel: 'H' as QRErrorCorrectionLevel,
            color: { dark: colorDark, light: colorLight },
        };

        QRCode.toCanvas(canvas, data, options, (error) => {
            if (error) { console.error(error); return; }
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

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => { /* ... (sin cambios) ... */ };
    const handleDownload = () => { /* ... (sin cambios) ... */ };
    
    const handleTypeChange = (newType: QRType) => {
        setQrType(newType);
        // Reiniciar todos los valores para evitar datos cruzados
        setInputValue(newType === 'url' ? 'https://' : '¡Hola Mundo!');
        setEmailData({ to: '', subject: '' });
        setSmsData({ number: '', message: '' });
    };

    const renderForm = () => {
        switch (qrType) {
            case 'url':
                return <div className="relative"> <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /> <input type="url" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="https://ejemplo.com" className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-brand-primary outline-none" /> </div>;
            case 'text':
                return <textarea value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Escribe tu texto aquí..." className="w-full p-2 border rounded-md focus:ring-2 focus:ring-brand-primary outline-none" rows={4} />;
            // <-- NUEVO: Formularios para Email y SMS -->
            case 'email':
                return (
                    <div className="space-y-4">
                        <input type="email" value={emailData.to} onChange={(e) => setEmailData({...emailData, to: e.target.value})} placeholder="Email del destinatario" className="w-full p-2 border rounded-md"/>
                        <input type="text" value={emailData.subject} onChange={(e) => setEmailData({...emailData, subject: e.target.value})} placeholder="Asunto (opcional)" className="w-full p-2 border rounded-md"/>
                    </div>
                );
            case 'sms':
                return (
                    <div className="space-y-4">
                        <input type="tel" value={smsData.number} onChange={(e) => setSmsData({...smsData, number: e.target.value})} placeholder="Número de teléfono" className="w-full p-2 border rounded-md"/>
                        <textarea value={smsData.message} onChange={(e) => setSmsData({...smsData, message: e.target.value})} placeholder="Mensaje (opcional)" className="w-full p-2 border rounded-md" rows={3}/>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="container max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-10 grid md:grid-cols-2 gap-10">
            {/* Columna de Controles */}
            <div className="flex flex-col space-y-6">
                 <div> <h1 className="text-3xl font-bold text-dark-text mb-2">Generador de QR Profesional</h1> <p className="text-gray-500">Crea y personaliza tus códigos QR fácilmente.</p> </div>
                {/* <-- NUEVO: Botones añadidos para Email y SMS --> */}
                <div className="flex flex-wrap gap-2 border-b pb-4">
                    <button onClick={() => handleTypeChange('url')} className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${qrType === 'url' ? 'bg-brand-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}><LinkIcon size={18} /> URL</button>
                    <button onClick={() => handleTypeChange('text')} className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${qrType === 'text' ? 'bg-brand-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}><Type size={18} /> Texto</button>
                    <button onClick={() => handleTypeChange('email')} className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${qrType === 'email' ? 'bg-brand-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}><Mail size={18} /> Email</button>
                    <button onClick={() => handleTypeChange('sms')} className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${qrType === 'sms' ? 'bg-brand-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}><MessageSquare size={18} /> SMS</button>
                </div>
                <div className="bg-light-bg p-4 rounded-lg border">
                    <h2 className="font-semibold text-lg mb-4">Contenido del QR</h2>
                    {renderForm()}
                </div>
                <div className="bg-light-bg p-4 rounded-lg border">
                    <h2 className="font-semibold text-lg mb-4 flex items-center gap-2"><Palette size={20} /> Personalización</h2>
                    {/* ... (Contenido de personalización sin cambios) ... */}
                </div>
            </div>
            {/* Columna de Vista Previa */}
            <div className="bg-light-bg rounded-lg p-6 flex flex-col items-center justify-center border-2 border-dashed">
                {/* ... (Contenido de vista previa sin cambios) ... */}
            </div>
        </div>
    );
}
