const { execFile, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Simple, time-limited execution per supported language using temp files
// NOTE: This is a basic sandbox substitute. For production, use proper isolation.

const SUPPORTED = {
  javascript: {
    run: async (code) => runNode(code)
  },
  python: {
    run: async (code) => runPython(code)
  }
};

function runWithTimeout(child, timeoutMs) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      try { child.kill('SIGKILL'); } catch (_) {}
      resolve({ stdout: '', stderr: 'Execution timed out', exitCode: null, timedOut: true });
    }, timeoutMs);

    let stdout = '';
    let stderr = '';
    child.stdout && child.stdout.on('data', (d) => { stdout += d.toString(); });
    child.stderr && child.stderr.on('data', (d) => { stderr += d.toString(); });
    child.on('error', (err) => {
      clearTimeout(timer);
      resolve({ stdout, stderr: (stderr ? stderr + '\n' : '') + String(err), exitCode: 1, timedOut: false });
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({ stdout, stderr, exitCode: code, timedOut: false });
    });
  });
}

async function runNode(code) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'exec-js-'));
  const file = path.join(tmpDir, 'main.js');
  fs.writeFileSync(file, code, 'utf8');
  const child = spawn(process.execPath, [file], { cwd: tmpDir, stdio: ['ignore', 'pipe', 'pipe'] });
  const result = await runWithTimeout(child, 4000);
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
  return result;
}

async function runPython(code) {
  const python = process.env.PYTHON_PATH || 'python';
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'exec-py-'));
  const file = path.join(tmpDir, 'main.py');
  fs.writeFileSync(file, code, 'utf8');
  const child = spawn(python, [file], { cwd: tmpDir, stdio: ['ignore', 'pipe', 'pipe'] });
  const result = await runWithTimeout(child, 4000);
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
  return result;
}

const executeCode = async (req, res) => {
  try {
    const { language, code } = req.body || {};
    if (!language || !code) {
      return res.status(400).json({ success: false, message: 'language and code are required' });
    }

    const key = String(language).toLowerCase();
    if (!SUPPORTED[key]) {
      return res.status(400).json({ success: false, message: `Unsupported language: ${language}` });
    }

    const result = await SUPPORTED[key].run(code);
    return res.json({ success: true, ...result });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Execution failed', error: String(err) });
  }
};

module.exports = { executeCode };


