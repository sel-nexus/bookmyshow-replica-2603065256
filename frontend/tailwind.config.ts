import type { Config } from 'tailwindcss';
const config: Config = { content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'], theme: { extend: { colors: { cinema: { 50:'#fff4f3', 500:'#d82d3d', 700:'#9f1e2a', 950:'#30080d' } }, fontFamily: { display:['Georgia','serif'], body:['Arial','sans-serif'] } } }, plugins: [] };
export default config;
