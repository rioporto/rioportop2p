import fs from 'fs';
import path from 'path';

export function getCriticalCSS(): string {
  try {
    const cssPath = path.join(process.cwd(), 'src', 'styles', 'critical.css');
    return fs.readFileSync(cssPath, 'utf8');
  } catch (error) {
    console.error('Failed to load critical CSS:', error);
    return '';
  }
}

export function CriticalCSS() {
  const css = getCriticalCSS();
  
  if (!css) return null;
  
  return (
    <style
      dangerouslySetInnerHTML={{ __html: css }}
      data-critical="true"
    />
  );
}