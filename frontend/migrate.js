const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = path.join(__dirname);
const SRC_DIR = path.join(FRONTEND_DIR, 'src');
const APP_DIR = path.join(SRC_DIR, 'app');
const PAGES_DIR = path.join(SRC_DIR, 'pages');
const COMPONENTS_DIR = path.join(SRC_DIR, 'components');
const LIB_DIR = path.join(SRC_DIR, 'lib');

const routes = [];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function camelCase(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
    return word.toUpperCase();
  }).replace(/[^a-zA-Z0-9]/g, '');
}

function getComponentName(routePath) {
  if (routePath === '/') return 'Home';
  const parts = routePath.split('/').filter(Boolean);
  const name = parts.map(p => {
    if (p.startsWith(':')) {
      return camelCase(p.substring(1)) + 'Page';
    }
    return camelCase(p);
  }).join('');
  return name;
}

function fixContent(content) {
  // Replace next/link
  content = content.replace(/import Link from ["']next\/link["']/g, 'import { Link } from "react-router-dom"');
  // Replace next/image
  content = content.replace(/import Image from ["']next\/image["']/g, '');
  content = content.replace(/<Image(.*?)src=(.*?)(?:\/?>|>.*?<\/Image>)/gs, (match, p1, src) => {
    // Keep it simple
    return `<img ${p1} src=${src} />`;
  });
  
  // Replace next/navigation
  if (content.includes('next/navigation')) {
    content = content.replace(/import\s+\{\s*([^}]+)\s*\}\s+from\s+["']next\/navigation["']/g, (match, imports) => {
      let routerImports = [];
      if (imports.includes('useRouter')) routerImports.push('useNavigate');
      if (imports.includes('usePathname')) routerImports.push('useLocation');
      if (imports.includes('useSearchParams')) routerImports.push('useSearchParams');
      if (imports.includes('useParams')) routerImports.push('useParams');
      return `import { ${routerImports.join(', ')} } from "react-router-dom"`;
    });

    content = content.replace(/const\s+(\w+)\s*=\s*useRouter\(\)/g, 'const $1 = useNavigate()');
    content = content.replace(/const\s+(\w+)\s*=\s*usePathname\(\)/g, 'const location = useLocation();\n  const $1 = location.pathname');
    content = content.replace(/router\.push\((.*?)\)/g, 'navigate($1)');
    content = content.replace(/useRouter/g, 'useNavigate'); // Fallback
    content = content.replace(/\brouter\b/g, 'navigate'); // Replace router variable usage
  }

  // Remove "use client"
  content = content.replace(/["']use client["']/g, '');

  // Next.js params
  // Next.js page props: { params: { id } }
  // React Router: const { id } = useParams()
  // Replace `export default function QuizPage({ params })`
  // with `export default function QuizPage() { const params = useParams();`
  content = content.replace(/export\s+default\s+function\s+(\w+)\s*\(\s*\{\s*params\s*\}\s*\)\s*\{/g, 
    'import { useParams } from "react-router-dom";\nexport default function $1() {\n  const params = useParams();');
  
  // Search params fallback (for login page useSearchParams)
  content = content.replace(/const\s+searchParams\s*=\s*useSearchParams\(\)/g, 'const [searchParams] = useSearchParams()');
  
  return content;
}

function processDirectory(dir, routePrefix = '') {
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Dynamic route like [id]
      let routePart = item;
      if (routePart.startsWith('[') && routePart.endsWith(']')) {
        routePart = ':' + routePart.slice(1, -1);
      }
      processDirectory(fullPath, `${routePrefix}/${routePart}`);
    } else if (item === 'page.js') {
      let routePath = routePrefix || '/';
      const content = fs.readFileSync(fullPath, 'utf8');
      
      const componentName = getComponentName(routePath);
      const targetFileName = `${componentName}.jsx`;
      const targetPath = path.join(PAGES_DIR, targetFileName);
      
      let fixedContent = fixContent(content);
      // Give component a proper name instead of anonymous default export if needed
      // but usually Next.js pages have named default exports.
      
      fs.writeFileSync(targetPath, fixedContent);
      
      routes.push({
        path: routePath,
        component: componentName,
        file: `./pages/${targetFileName}`
      });
    }
  });
}

function processComponents(dir) {
  const items = fs.readdirSync(dir);
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processComponents(fullPath);
    } else if (item.endsWith('.js') || item.endsWith('.jsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const fixedContent = fixContent(content);
      const newPath = fullPath.replace(/\.js$/, '.jsx');
      fs.writeFileSync(newPath, fixedContent);
      if (fullPath !== newPath) fs.unlinkSync(fullPath);
    }
  });
}

function generateAppJsx() {
  const imports = routes.map(r => `import ${r.component} from "${r.file}";`).join('\n');
  const routeElements = routes.map(r => `          <Route path="${r.path}" element={<${r.component} />} />`).join('\n');
  
  const content = `import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { ScrollToTop } from "@/components/scroll-to-top";
${imports}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <BrowserRouter>
        <Routes>
${routeElements}
        </Routes>
        <Toaster />
        <ScrollToTop />
      </BrowserRouter>
    </ThemeProvider>
  );
}
`;
  fs.writeFileSync(path.join(SRC_DIR, 'App.jsx'), content);
}

function generateMainJsx() {
  const content = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './app/globals.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;
  fs.writeFileSync(path.join(SRC_DIR, 'main.jsx'), content);
}

function run() {
  ensureDir(PAGES_DIR);
  
  // 1. Process App Router Pages
  if (fs.existsSync(APP_DIR)) {
    processDirectory(APP_DIR);
  }
  
  // 2. Process Components
  if (fs.existsSync(COMPONENTS_DIR)) {
    processComponents(COMPONENTS_DIR);
  }
  
  // 3. Generate App.jsx & main.jsx
  generateAppJsx();
  generateMainJsx();
  
  console.log("Migration script complete.");
}

run();
