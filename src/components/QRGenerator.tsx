import { useState, useRef, useEffect } from 'react';
import QRCodeStyling, { DotType, CornerSquareType } from 'qr-code-styling';
import { Download, Link as LinkIcon, Mail, MessageSquare, Wifi, Smartphone, ChevronDown, ImageIcon, TextCursorInput, Paintbrush, ScanLine, QrCode, User } from 'lucide-react';
import { countryCodes, Country } from '../data/country-codes';

type QRType = 'url' | 'text' | 'email' | 'sms' | 'wifi' | 'phone' | 'vcard';

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
    const [vCardData, setVCardData] = useState({ firstName: '', lastName: '', phone: '', email: '', company: '', title: '', website: '' });

    const [colorDark, setColorDark] = useState('#000000');
    const [colorLight, setColorLight] = useState('#FFFFFF');
    const [eyeColor, setEyeColor] = useState('#000000');

    const [logo, setLogo] = useState<string | null>(null);
    const [dotStyle, setDotStyle] = useState<DotType>('square');
    const [eyeStyle, setEyeStyle] = useState<CornerSquareType>('square');

    const previewRef = useRef<HTMLDivElement>(null);
    const [qrInstance] = useState(new QRCodeStyling({ width: 300, height: 300, margin: 0, type: 'canvas', imageOptions: { hideBackgroundDots: true, imageSize: 0.4, margin: 5 } }));
    const [isDownloadMenuOpen, setDownloadMenuOpen] = useState(false);

    useEffect(() => {
        if (!qrInstance) return;
        let finalData = '';
        switch (qrType) {
            case 'url': case 'text': finalData = inputValue; break;
            case 'email': finalData = `mailto:${emailData.to}?subject=${encodeURIComponent(emailData.subject)}`; break;
            case 'sms': finalData = `SMSTO:${smsData.number}:${encodeURIComponent(smsData.message)}`; break;
            case 'wifi': finalData = `WIFI:T:${wifiData.encryption};S:${wifiData.ssid};P:${wifiData.password};;`; break;
            case 'phone': finalData = `tel:${phoneData.country.dial_code}${phoneData.number}`; break;
            case 'vcard': finalData = `BEGIN:VCARD\nVERSION:3.0\nN:${vCardData.lastName};${vCardData.firstName}\nFN:${vCardData.firstName} ${vCardData.lastName}\nORG:${vCardData.company}\nTITLE:${vCardData.title}\nTEL;TYPE=WORK,VOICE:${vCardData.phone}\nEMAIL:${vCardData.email}\nURL:${vCardData.website}\nEND:VCARD`; break;
        }
        setQrData(finalData);
        qrInstance.update({
            data: finalData || ' ',
            dotsOptions: { color: colorDark, type: dotStyle },
            cornersSquareOptions: { color: eyeColor, type: eyeStyle },
            backgroundOptions: { color: colorLight },
            image: logo || undefined,
        });
    }, [inputValue, emailData, smsData, wifiData, phoneData, vCardData, qrType, colorDark, colorLight, logo, dotStyle, eyeStyle, eyeColor, qrInstance]);

    useEffect(() => {
        if (previewRef.current) {
            previewRef.current.innerHTML = '';
            qrInstance.append(previewRef.current);
        }
    }, [qrInstance]);

    const handlePngDownload = () => { qrInstance?.download({ name: 'qr-code', extension: 'png' }); setDownloadMenuOpen(false); };
    const handleSvgDownload = () => { qrInstance?.download({ name: 'qr-code', extension: 'svg' }); setDownloadMenuOpen(false); };
    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files && e.target.files[0]) { const reader = new FileReader(); reader.onload = (event) => setLogo(event.target?.result as string); reader.readAsDataURL(e.target.files[0]); } };
    const handleTypeChange = (newType: QRType) => { setQrType(newType); setInputValue(newType === 'url' ? 'https://' : '¡Hola Mundo!'); setEmailData({ to: '', subject: '' }); setSmsData({ number: '', message: '' }); setWifiData({ ssid: '', password: '', encryption: 'WPA' }); setPhoneData({ country: countryCodes[0], number: '' }); setVCardData({ firstName: '', lastName: '', phone: '', email: '', company: '', title: '', website: '' }); };
    
    const renderForm = () => {
        switch (qrType) {
            case 'url': return <div className="relative"> <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /> <input type="url" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="https://ejemplo.com" className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-brand-primary outline-none" /> </div>;
            case 'text': return <textarea value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Escribe tu texto aquí..." className="w-full p-2 border rounded-md focus:ring-2 focus:ring-brand-primary outline-none" rows={4} />;
            case 'email': return ( <div className="space-y-4"> <input type="email" value={emailData.to} onChange={(e) => setEmailData({...emailData, to: e.target.value})} placeholder="Email del destinatario" className="w-full p-2 border rounded-md"/> <input type="text" value={emailData.subject} onChange={(e) => setEmailData({...emailData, subject: e.target.value})} placeholder="Asunto (opcional)" className="w-full p-2 border rounded-md"/> </div> );
            case 'sms': return ( <div className="space-y-4"> <input type="tel" value={smsData.number} onChange={(e) => setSmsData({...smsData, number: e.target.value})} placeholder="Número de teléfono" className="w-full p-2 border rounded-md"/> <textarea value={smsData.message} onChange={(e) => setSmsData({...smsData, message: e.target.value})} placeholder="Mensaje (opcional)" className="w-full p-2 border rounded-md" rows={3}/> </div> );
            case 'wifi': return ( <div className="space-y-4"> <input type="text" value={wifiData.ssid} onChange={(e) => setWifiData({...wifiData, ssid: e.target.value})} placeholder="Nombre de la Red (SSID)" className="w-full p-2 border rounded-md"/> <input type="password" value={wifiData.password} onChange={(e) => setWifiData({...wifiData, password: e.target.value})} placeholder="Contraseña" className="w-full p-2 border rounded-md"/> <div> <label className="text-sm font-medium text-gray-700">Cifrado</label> <select value={wifiData.encryption} onChange={(e) => setWifiData({...wifiData, encryption: e.target.value})} className="w-full p-2 mt-1 border rounded-md bg-white"> <option value="WPA">WPA/WPA2</option> <option value="WEP">WEP</option> <option value="nopass">Ninguno</option> </select> </div> </div> );
            case 'phone': return ( <div className="flex gap-2"> <select className="p-2 border rounded-md bg-white max-w-[150px]" onChange={(e) => { const selectedCountry = countryCodes.find((c: Country) => c.code === e.target.value); if (selectedCountry) setPhoneData({...phoneData, country: selectedCountry}); }} value={phoneData.country.code}> {countryCodes.map((c: Country) => ( <option key={c.code} value={c.code}> {c.flag} {c.code} ({c.dial_code}) </option> ))} </select> <input type="tel" value={phoneData.number} onChange={(e) => setPhoneData({...phoneData, number: e.target.value})} placeholder="Número de teléfono" className="w-full p-2 border rounded-md"/> </div> );
            case 'vcard': return ( <div className="space-y-4"> <div className="grid grid-cols-2 gap-4"> <input type="text" value={vCardData.firstName} onChange={(e) => setVCardData({...vCardData, firstName: e.target.value})} placeholder="Nombre" className="w-full p-2 border rounded-md"/> <input type="text" value={vCardData.lastName} onChange={(e) => setVCardData({...vCardData, lastName: e.target.value})} placeholder="Apellidos" className="w-full p-2 border rounded-md"/> </div> <input type="tel" value={vCardData.phone} onChange={(e) => setVCardData({...vCardData, phone: e.target.value})} placeholder="Teléfono" className="w-full p-2 border rounded-md"/> <input type="email" value={vCardData.email} onChange={(e) => setVCardData({...vCardData, email: e.target.value})} placeholder="Email" className="w-full p-2 border rounded-md"/> <input type="text" value={vCardData.company} onChange={(e) => setVCardData({...vCardData, company: e.target.value})} placeholder="Empresa" className="w-full p-2 border rounded-md"/> <input type="text" value={vCardData.title} onChange={(e) => setVCardData({...vCardData, title: e.target.value})} placeholder="Cargo" className="w-full p-2 border rounded-md"/> <input type="url" value={vCardData.website} onChange={(e) => setVCardData({...vCardData, website: e.target.value})} placeholder="Sitio Web" className="w-full p-2 border rounded-md"/> </div> );
            default: return null;
        }
    };

    return (
        <div className="w-full h-screen max-h-screen bg-gray-100 flex overflow-hidden">
            <div className="w-1/4 max-w-xs bg-white p-6 border-r flex flex-col">
                <div className="mb-8"> <div className="flex items-center gap-3"> <span className="bg-brand-primary p-2 rounded-lg text-white"><QrCode size={24}/></span> <h1 className="text-2xl font-bold text-gray-800">Generador QR</h1> </div> <p className="text-sm text-gray-500 mt-2"> Una herramienta creada por <a href="https://piedrahitasanchez.com/" target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-primary hover:underline">Piedrahita Sánchez</a>. </p> </div>
                <h2 className="text-lg font-semibold mb-4 text-gray-600">Tipo de QR</h2>
                <div className="space-y-2">
                    <button onClick={() => handleTypeChange('url')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${qrType === 'url' ? 'bg-brand-primary text-white shadow-lg' : 'bg-gray-100 hover:bg-gray-200'}`}><LinkIcon size={20}/> URL</button>
                    <button onClick={() => handleTypeChange('text')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${qrType === 'text' ? 'bg-brand-primary text-white shadow-lg' : 'bg-gray-100 hover:bg-gray-200'}`}><TextCursorInput size={20}/> Texto</button>
                    <button onClick={() => handleTypeChange('email')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${qrType === 'email' ? 'bg-brand-primary text-white shadow-lg' : 'bg-gray-100 hover:bg-gray-200'}`}><Mail size={20}/> Email</button>
                    <button onClick={() => handleTypeChange('sms')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${qrType === 'sms' ? 'bg-brand-primary text-white shadow-lg' : 'bg-gray-100 hover:bg-gray-200'}`}><MessageSquare size={20}/> SMS</button>
                    <button onClick={() => handleTypeChange('wifi')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${qrType === 'wifi' ? 'bg-brand-primary text-white shadow-lg' : 'bg-gray-100 hover:bg-gray-200'}`}><Wifi size={20}/> WiFi</button>
                    <button onClick={() => handleTypeChange('phone')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${qrType === 'phone' ? 'bg-brand-primary text-white shadow-lg' : 'bg-gray-100 hover:bg-gray-200'}`}><Smartphone size={20}/> Teléfono</button>
                    <button onClick={() => handleTypeChange('vcard')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${qrType === 'vcard' ? 'bg-brand-primary text-white shadow-lg' : 'bg-gray-100 hover:bg-gray-200'}`}><User size={20}/> vCard</button>
                </div>
            </div>
            <div className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-xl mx-auto space-y-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm"> <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><ScanLine size={22}/> Contenido</h3> {renderForm()} </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Paintbrush size={22}/> Diseño y Colores</h3>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                            <div><label className="text-sm font-medium text-gray-600">Puntos</label><input type="color" value={colorDark} onChange={(e) => setColorDark(e.target.value)} className="w-full h-10 mt-1 p-1 border rounded-md cursor-pointer"/></div>
                            <div><label className="text-sm font-medium text-gray-600">Fondo</label><input type="color" value={colorLight} onChange={(e) => setColorLight(e.target.value)} className="w-full h-10 mt-1 p-1 border rounded-md cursor-pointer"/></div>
                            <div><label className="text-sm font-medium text-gray-600">Ojos</label><input type="color" value={eyeColor} onChange={(e) => setEyeColor(e.target.value)} className="w-full h-10 mt-1 p-1 border rounded-md cursor-pointer"/></div>
                        </div>
                        <div className="mt-6 border-t pt-4">
                            <h4 className="text-md font-semibold text-gray-700 mb-2">Formas</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-sm font-medium text-gray-600">Estilo Puntos</label><select onChange={(e) => setDotStyle(e.target.value as DotType)} value={dotStyle} className="w-full p-2 mt-1 border rounded-md bg-white">{dotStyleOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.name}</option>)}</select></div>
                                <div><label className="text-sm font-medium text-gray-600">Estilo Ojos</label><select onChange={(e) => setEyeStyle(e.target.value as CornerSquareType)} value={eyeStyle} className="w-full p-2 mt-1 border rounded-md bg-white">{eyeStyleOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.name}</option>)}</select></div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm"> <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><ImageIcon size={22}/> Logo</h3> <input type="file" accept="image/png, image/jpeg" onChange={handleLogoUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20"/> {logo && <button onClick={() => setLogo(null)} className="text-xs text-red-500 hover:underline mt-2">Quitar logo</button>} </div>
                </div>
            </div>
            <div className="w-1/3 bg-gray-200 p-8 flex flex-col items-center justify-center">
                 <h2 className="text-2xl font-bold mb-6">Vista Previa</h2>
                 <div ref={previewRef} className="w-[340px] h-[340px] bg-white rounded-lg shadow-xl p-4 flex items-center justify-center"></div>
                 <div className="relative w-full max-w-xs mt-8">
                    <button onClick={() => setDownloadMenuOpen(!isDownloadMenuOpen)} disabled={!qrData.trim()} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:scale-105 transition-transform disabled:opacity-50"> <Download size={20}/> Descargar <ChevronDown size={20} className={`transition-transform ${isDownloadMenuOpen ? 'rotate-180' : ''}`}/> </button>
                    {isDownloadMenuOpen && ( <div className="absolute bottom-full mb-2 w-full bg-white rounded-lg shadow-xl border z-10"> <button onClick={handlePngDownload} className="w-full text-left px-4 py-3 hover:bg-gray-100">Descargar PNG</button> <button onClick={handleSvgDownload} className="w-full text-left px-4 py-3 hover:bg-gray-100 border-t">Descargar SVG</button> </div> )}
                 </div>
            </div>
        </div>
    );
}
