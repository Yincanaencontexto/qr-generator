import { useState, useRef, useEffect } from 'react';
import QRCodeStyling, { DotType, CornerSquareType } from 'qr-code-styling';
import { Download, Link as LinkIcon, Type, Palette, Mail, MessageSquare, Wifi, Frame, Smartphone, ChevronDown } from 'lucide-react';
import { countryCodes, Country } from '../data/country-codes';

type QRType = 'url' | 'text' | 'email' | 'sms' | 'wifi' | 'phone';
type FrameType = 'none' | 'scan-me-1' | 'scan-me-2';

const dotStyleOptions: { name: string, value: DotType }[] = [ { name: 'Cuadrado', value: 'square' }, { name: 'Punto', value: 'dots' }, { name: 'Redondeado', value: 'rounded' }, { name: 'Extra Redondeado', value: 'extra-rounded' }, { name: 'Con Clase', value: 'classy' }, { name: 'Con Clase (Redondo)', value: 'classy-rounded' }];
const eyeStyleOptions: { name: string, value: CornerSquareType }[] = [ { name: 'Cuadrado', value: 'square' }, { name: 'Punto', value: 'dot' }, { name: 'Extra Redondo', value: 'extra-rounded' }];

export function QRGenerator() {
    const [qrType, setQrType] = useState<QRType>('url');
    const [qrData, setQrData] = useState('https://www.google.com');

    const [inputValue, setInputValue] = useState('https://www.google.com');
    const [emailData, setEmailData] = useState({ to: '', subject: '' });
    const [smsData, setSmsData] = useState({ number: '', message: '' });
    const [wifiData, setWifiData] = useState({ ssid: '', password: '', encryption: 'WPA' });
    const [phoneData, setPhoneData] = useState({ country: countryCodes[0], number: '' });

    const [colorDark, setColorDark] = useState('#000000');
    const [colorLight, setColorLight] = useState('#FFFFFF');
    const [logo, setLogo] = useState<string | null>(null);
    const [dotStyle, setDotStyle] = useState<DotType>('square');
    const [eyeStyle, setEyeStyle] = useState<CornerSquareType>('square');
    const [frame, setFrame] = useState<FrameType>('none');

    const [qrInstance] = useState(new QRCodeStyling({ width: 300, height: 300, margin: 5, type: 'canvas', imageOptions: { hideBackgroundDots: true, imageSize: 0.4, margin: 5 } }));
    const finalCanvasRef = useRef<HTMLCanvasElement>(null);
    const [finalImage, setFinalImage] = useState<string | null>(null);
    const [isDownloadMenuOpen, setDownloadMenuOpen] = useState(false);

    useEffect(() => {
        let finalData = '';
        switch (qrType) {
            case 'url': case 'text': finalData = inputValue; break;
            case 'email': finalData = `mailto:${emailData.to}?subject=${encodeURIComponent(emailData.subject)}`; break;
            case 'sms': finalData = `SMSTO:${smsData.number}:${encodeURIComponent(smsData.message)}`; break;
            case 'wifi': finalData = `WIFI:T:${wifiData.encryption};S:${wifiData.ssid};P:${wifiData.password};;`; break;
            case 'phone': finalData = `tel:${phoneData.country.dial_code}${phoneData.number}`; break;
        }
        setQrData(finalData);
        
        qrInstance.update({
            data: finalData || ' ',
            dotsOptions: { color: colorDark, type: dotStyle },
            cornersSquareOptions: { color: colorDark, type: eyeStyle },
            backgroundOptions: { color: colorLight },
            image: logo || undefined,
        });

        generateFinalImage();

    }, [inputValue, emailData, smsData, wifiData, phoneData, qrType, colorDark, colorLight, logo, dotStyle, eyeStyle, frame, qrInstance]);

    const generateFinalImage = async () => {
        const finalCanvas = finalCanvasRef.current;
        if (!finalCanvas) return;
        const ctx = finalCanvas.getContext('2d');
        if (!ctx) return;

        const frameSize = 400;
        finalCanvas.width = frameSize;
        finalCanvas.height = frameSize;
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, frameSize, frameSize);
        
        const qrImageUrl = await qrInstance.getImageUrl('png');
        if (!qrImageUrl) return;
        
        const image = new Image();
        image.src = qrImageUrl;
        image.onload = () => {
            const qrSize = 300;
            let qrX = (frameSize - qrSize) / 2;
            let qrY = (frameSize - qrSize) / 2;

            if (frame === 'none') {
                ctx.drawImage(image, qrX, qrY, qrSize, qrSize);
            } else {
                ctx.fillStyle = colorDark;
                ctx.font = 'bold 30px Arial';
                ctx.textAlign = 'center';

                if (frame === 'scan-me-1') {
                    const textY = 50;
                    qrY = textY + 15;
                    ctx.fillText('SCAN ME', frameSize / 2, textY);
                    ctx.drawImage(image, qrX, qrY, qrSize, qrSize);
                } else if (frame === 'scan-me-2') {
                    qrY = 30;
                    const textY = qrY + qrSize + 35;
                    ctx.drawImage(image, qrX, qrY, qrSize, qrSize);
                    ctx.fillText('SCAN ME', frameSize / 2, textY);
                }
            }
            setFinalImage(finalCanvas.toDataURL());
        };
    };

    const handlePngDownload = () => {
        const canvas = finalCanvasRef.current;
        if (canvas) {
            const link = document.createElement('a');
            link.download = 'qr-code-final.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        }
        setDownloadMenuOpen(false);
    };

    const handleSvgDownload = () => {
        qrInstance.download({ name: 'qr-code', extension: 'svg' });
        setDownloadMenuOpen(false);
    };
    
    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files && e.target.files[0]) { const reader = new FileReader(); reader.onload = (event) => setLogo(event.target?.result as string); reader.readAsDataURL(e.target.files[0]); } };
    const handleTypeChange = (newType: QRType) => { setQrType(newType); setInputValue(newType === 'url' ? 'https://' : '¡Hola Mundo!'); setEmailData({ to: '', subject: '' }); setSmsData({ number: '', message: '' }); setWifiData({ ssid: '', password: '', encryption: 'WPA' }); setPhoneData({ country: countryCodes[0], number: '' }); };
    
    const renderForm = () => {
        switch (qrType) {
            case 'url': return <div className="relative"> <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /> <input type="url" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="https://ejemplo.com" className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-brand-primary outline-none" /> </div>;
            case 'text': return <textarea value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Escribe tu texto aquí..." className="w-full p-2 border rounded-md focus:ring-2 focus:ring-brand-primary outline-none" rows={4} />;
            case 'email': return ( <div className="space-y-4"> <input type="email" value={emailData.to} onChange={(e) => setEmailData({...emailData, to: e.target.value})} placeholder="Email del destinatario" className="w-full p-2 border rounded-md"/> <input type="text" value={emailData.subject} onChange={(e) => setEmailData({...emailData, subject: e.target.value})} placeholder="Asunto (opcional)" className="w-full p-2 border rounded-md"/> </div> );
            case 'sms': return ( <div className="space-y-4"> <input type="tel" value={smsData.number} onChange={(e) => setSmsData({...smsData, number: e.target.value})} placeholder="Número de teléfono" className="w-full p-2 border rounded-md"/> <textarea value={smsData.message} onChange={(e) => setSmsData({...smsData, message: e.target.value})} placeholder="Mensaje (opcional)" className="w-full p-2 border rounded-md" rows={3}/> </div> );
            case 'wifi': return ( <div className="space-y-4"> <input type="text" value={wifiData.ssid} onChange={(e) => setWifiData({...wifiData, ssid: e.target.value})} placeholder="Nombre de la Red (SSID)" className="w-full p-2 border rounded-md"/> <input type="password" value={wifiData.password} onChange={(e) => setWifiData({...wifiData, password: e.target.value})} placeholder="Contraseña" className="w-full p-2 border rounded-md"/> <div> <label className="text-sm font-medium text-gray-700">Cifrado</label> <select value={wifiData.encryption} onChange={(e) => setWifiData({...wifiData, encryption: e.target.value})} className="w-full p-2 mt-1 border rounded-md bg-white"> <option value="WPA">WPA/WPA2</option> <option value="WEP">WEP</option> <option value="nopass">Ninguno</option> </select> </div> </div> );
            case 'phone': return ( <div className="flex gap-2"> <select className="p-2 border rounded-md bg-white max-w-[150px]" onChange={(e) => { const selectedCountry = countryCodes.find((c: Country) => c.code === e.target.value); if (selectedCountry) setPhoneData({...phoneData, country: selectedCountry}); }} value={phoneData.country.code}> {countryCodes.map((c: Country) => ( <option key={c.code} value={c.code}> {c.flag} {c.code} ({c.dial_code}) </option> ))} </select> <input type="tel" value={phoneData.number} onChange={(e) => setPhoneData({...phoneData, number: e.target.value})} placeholder="Número de teléfono" className="w-full p-2 border rounded-md"/> </div> );
            default: return null;
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
                    <button onClick={() => handleTypeChange('phone')} className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${qrType === 'phone' ? 'bg-brand-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}><Smartphone size={18} /> Teléfono</button>
                </div>
                <div className="bg-light-bg p-4 rounded-lg border"> <h2 className="font-semibold text-lg mb-4">Contenido del QR</h2> {renderForm()} </div>
                <div className="bg-light-bg p-4 rounded-lg border">
                    <h2 className="font-semibold text-lg mb-4 flex items-center gap-2"><Palette size={20} /> Personalización</h2>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div><label htmlFor="color-dark" className="block text-sm font-medium text-gray-700 mb-1">Color Puntos</label><input id="color-dark" type="color" value={colorDark} onChange={(e) => setColorDark(e.target.value)} className="w-full h-10 p-1 border rounded-md cursor-pointer" /></div>
                        <div><label htmlFor="color-light" className="block text-sm font-medium text-gray-700 mb-1">Color Fondo</label><input id="color-light" type="color" value={colorLight} onChange={(e) => setColorLight(e.target.value)} className="w-full h-10 p-1 border rounded-md cursor-pointer" /></div>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="logo-upload" className="block text-sm font-medium text-gray-700 mb-1">Logo (opcional)</label>
                        <input id="logo-upload" type="file" accept="image/png, image/jpeg, image/svg+xml" onChange={handleLogoUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20 cursor-pointer" />
                        {logo && <button onClick={() => setLogo(null)} className="text-xs text-red-500 hover:underline mt-2">Quitar logo</button>}
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Estilo Puntos</label>
                            <select onChange={(e) => setDotStyle(e.target.value as DotType)} value={dotStyle} className="w-full p-2 border rounded-md bg-white">
                                {dotStyleOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.name}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Estilo Ojos</label>
                            <select onChange={(e) => setEyeStyle(e.target.value as CornerSquareType)} value={eyeStyle} className="w-full p-2 border rounded-md bg-white">
                                {eyeStyleOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.name}</option>)}
                            </select>
                        </div>
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
                <div className="w-[350px] h-[350px] bg-white p-2 rounded-lg shadow-md mb-6 flex items-center justify-center">
                    {finalImage ? <img src={finalImage} alt="Generated QR Code" style={{maxWidth: '100%', maxHeight: '100%'}} /> : <div className="text-gray-400 text-center">Generando...</div>}
                </div>
                {/* Div oculto donde se dibuja el QR base, ya no es necesario */}
                {/* <div ref={previewRef} style={{ display: 'none' }}></div> */}
                <canvas ref={finalCanvasRef} style={{ display: 'none' }}></canvas>
                 <div className="relative w-full">
                    <button  onClick={() => setDownloadMenuOpen(!isDownloadMenuOpen)} disabled={!qrData.trim()}  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"> <Download size={20} /> Descargar <ChevronDown size={20} className={`transition-transform ${isDownloadMenuOpen ? 'rotate-180' : ''}`} /> </button>
                    {isDownloadMenuOpen && (
                        <div className="absolute bottom-full mb-2 w-full bg-white rounded-lg shadow-xl border overflow-hidden z-10">
                            <button onClick={handlePngDownload} className="w-full text-left px-4 py-3 hover:bg-gray-100">Descargar PNG (con marco)</button>
                            <button onClick={handleSvgDownload} className="w-full text-left px-4 py-3 hover:bg-gray-100 border-t">Descargar SVG (sin marco/logo)</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
