import type {Metadata,Viewport} from 'next';import '@fontsource/manrope/latin-400.css';import '@fontsource/manrope/latin-500.css';import '@fontsource/manrope/latin-600.css';import '@fontsource/manrope/latin-700.css';import '@fontsource/noto-sans-tc/400.css';import '@fontsource/noto-sans-tc/500.css';import './globals.css';
export const metadata:Metadata={title:'我們的記帳本',description:'我們的共同記帳與財務中控。',manifest:'/manifest.webmanifest'};
export const viewport:Viewport={width:'device-width',initialScale:1,viewportFit:'cover',themeColor:'#173D39'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="zh-Hant"><body>{children}</body></html>}
