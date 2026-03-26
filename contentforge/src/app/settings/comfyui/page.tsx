"use client";

import { useState } from "react";
import {
  Cpu,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Terminal,
  FolderTree,
  Download,
  Play,
  Box,
  HelpCircle,
  Copy,
  Check,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { cn } from "@/lib/utils/cn";

function CodeBlock({
  code,
  language = "bash",
}: {
  code: string;
  language?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative rounded-lg border border-zinc-700 bg-zinc-950">
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
        <span className="text-xs text-zinc-500">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          {copied ? (
            <Check className="h-3 w-3 text-emerald-400" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm text-zinc-300">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function StepCard({
  step,
  title,
  icon: Icon,
  children,
}: {
  step: number;
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50">
      <div className="flex items-center gap-3 border-b border-zinc-800 px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600/15 text-sm font-bold text-indigo-400">
          {step}
        </div>
        <Icon className="h-5 w-5 text-indigo-400" />
        <h3 className="text-base font-semibold text-zinc-100">{title}</h3>
      </div>
      <div className="space-y-4 p-5">{children}</div>
    </div>
  );
}

export default function ComfyUISetupPage() {
  const [testStatus, setTestStatus] = useState<
    "idle" | "testing" | "success" | "failed"
  >("idle");

  const testConnection = async () => {
    setTestStatus("testing");
    try {
      const res = await fetch("/api/comfyui/status");
      if (res.ok) {
        const data = await res.json();
        setTestStatus(data.online ? "success" : "failed");
      } else {
        setTestStatus("failed");
      }
    } catch {
      setTestStatus("failed");
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">ComfyUI Setup</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Step-by-step guide to set up ComfyUI with Wan 2.2 for video
            generation
          </p>
        </div>

        {/* Connection test card */}
        <div
          className={cn(
            "rounded-xl border p-5",
            testStatus === "success"
              ? "border-emerald-800/50 bg-emerald-950/20"
              : testStatus === "failed"
              ? "border-red-800/50 bg-red-950/20"
              : "border-zinc-800 bg-zinc-900/50"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Cpu
                className={cn(
                  "h-6 w-6",
                  testStatus === "success"
                    ? "text-emerald-400"
                    : testStatus === "failed"
                    ? "text-red-400"
                    : "text-zinc-400"
                )}
              />
              <div>
                <h2 className="text-base font-semibold text-zinc-100">
                  Connection Status
                </h2>
                <p className="text-sm text-zinc-400">
                  {testStatus === "success"
                    ? "ComfyUI is running and accessible"
                    : testStatus === "failed"
                    ? "Cannot reach ComfyUI. Follow the steps below to set it up."
                    : "Test your ComfyUI connection"}
                </p>
              </div>
            </div>
            <button
              onClick={testConnection}
              disabled={testStatus === "testing"}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                testStatus === "success"
                  ? "bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30"
                  : testStatus === "failed"
                  ? "bg-red-600/20 text-red-400 hover:bg-red-600/30"
                  : "bg-indigo-600 text-white hover:bg-indigo-500"
              )}
            >
              {testStatus === "testing" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : testStatus === "success" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : testStatus === "failed" ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {testStatus === "testing"
                ? "Testing..."
                : testStatus === "success"
                ? "Connected"
                : testStatus === "failed"
                ? "Retry"
                : "Test Connection"}
            </button>
          </div>
        </div>

        {/* Step 1: Install ComfyUI */}
        <StepCard step={1} title="Install ComfyUI" icon={Terminal}>
          <p className="text-sm text-zinc-400">
            Clone the ComfyUI repository and install dependencies.
          </p>
          <CodeBlock
            code={`# Clone ComfyUI
git clone https://github.com/comfyanonymous/ComfyUI.git
cd ComfyUI

# Create a virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\\Scripts\\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Install PyTorch with CUDA support (if using NVIDIA GPU)
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu124`}
          />
          <div className="rounded-lg border border-amber-800/50 bg-amber-950/20 p-3">
            <p className="text-xs text-amber-300">
              <strong>Note:</strong> ComfyUI requires Python 3.10+ and a GPU
              with at least 6GB VRAM for Wan 2.2 with GGUF quantization.
              Full-precision models need 24GB+ VRAM.
            </p>
          </div>
        </StepCard>

        {/* Step 2: Download Wan 2.2 */}
        <StepCard step={2} title="Download Wan 2.2 Model Weights" icon={Download}>
          <p className="text-sm text-zinc-400">
            Download the Wan 2.2 model weights. Choose a quantization based on
            your available VRAM.
          </p>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-zinc-200">
              GGUF Quantization Options
            </h4>
            <div className="overflow-hidden rounded-lg border border-zinc-700">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-700 bg-zinc-800/50">
                    <th className="px-4 py-2.5 text-left font-medium text-zinc-300">
                      Quantization
                    </th>
                    <th className="px-4 py-2.5 text-left font-medium text-zinc-300">
                      Size
                    </th>
                    <th className="px-4 py-2.5 text-left font-medium text-zinc-300">
                      VRAM
                    </th>
                    <th className="px-4 py-2.5 text-left font-medium text-zinc-300">
                      Quality
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  <tr>
                    <td className="px-4 py-2 text-zinc-300">Q8_0</td>
                    <td className="px-4 py-2 text-zinc-400">~14 GB</td>
                    <td className="px-4 py-2 text-zinc-400">~16 GB</td>
                    <td className="px-4 py-2 text-emerald-400">Best</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-zinc-300">Q5_K_M</td>
                    <td className="px-4 py-2 text-zinc-400">~9 GB</td>
                    <td className="px-4 py-2 text-zinc-400">~12 GB</td>
                    <td className="px-4 py-2 text-blue-400">Great</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-zinc-300">Q4_K_M</td>
                    <td className="px-4 py-2 text-zinc-400">~7 GB</td>
                    <td className="px-4 py-2 text-zinc-400">~8 GB</td>
                    <td className="px-4 py-2 text-amber-400">Good</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-zinc-300">Q3_K_M</td>
                    <td className="px-4 py-2 text-zinc-400">~5 GB</td>
                    <td className="px-4 py-2 text-zinc-400">~6 GB</td>
                    <td className="px-4 py-2 text-zinc-400">Acceptable</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <CodeBlock
            code={`# Install ComfyUI GGUF support
cd ComfyUI/custom_nodes
git clone https://github.com/city96/ComfyUI-GGUF.git
cd ..

# Download Wan 2.2 GGUF model (choose your quantization)
# Option 1: Using huggingface-cli
pip install huggingface_hub
huggingface-cli download city96/Wan2.2-T2V-14B-GGUF \\
  wan2.2-t2v-14b-Q5_K_M.gguf \\
  --local-dir models/diffusion_models

# Option 2: Direct download with wget
wget -P models/diffusion_models/ \\
  "https://huggingface.co/city96/Wan2.2-T2V-14B-GGUF/resolve/main/wan2.2-t2v-14b-Q5_K_M.gguf"

# Download required VAE and CLIP models
huggingface-cli download Comfy-Org/Wan_2.2_ComfyUI_repackaged \\
  split_files/text_encoders/open_clip_vit_h14.safetensors \\
  --local-dir models/

huggingface-cli download Comfy-Org/Wan_2.2_ComfyUI_repackaged \\
  split_files/text_encoders/umt5_xxl_fp8_e4m3fn_scaled.safetensors \\
  --local-dir models/

huggingface-cli download Comfy-Org/Wan_2.2_ComfyUI_repackaged \\
  split_files/vae/wan_2.2_vae.safetensors \\
  --local-dir models/`}
          />
        </StepCard>

        {/* Step 3: Directory Structure */}
        <StepCard step={3} title="Directory Structure" icon={FolderTree}>
          <p className="text-sm text-zinc-400">
            Ensure your model files are in the correct directories.
          </p>
          <CodeBlock
            language="plaintext"
            code={`ComfyUI/
├── models/
│   ├── diffusion_models/
│   │   └── wan2.2-t2v-14b-Q5_K_M.gguf    # Wan 2.2 GGUF model
│   ├── text_encoders/
│   │   ├── open_clip_vit_h14.safetensors   # CLIP text encoder
│   │   └── umt5_xxl_fp8_e4m3fn_scaled.safetensors  # UMT5 encoder
│   └── vae/
│       └── wan_2.2_vae.safetensors         # VAE decoder
├── custom_nodes/
│   └── ComfyUI-GGUF/                      # GGUF support node
├── main.py
└── ...`}
          />
        </StepCard>

        {/* Step 4: Start ComfyUI */}
        <StepCard step={4} title="Start ComfyUI in API Mode" icon={Play}>
          <p className="text-sm text-zinc-400">
            Start ComfyUI with the API server enabled so ContentForge can
            communicate with it.
          </p>
          <CodeBlock
            code={`# Start ComfyUI in API mode (accessible from ContentForge)
cd ComfyUI
python main.py --listen 0.0.0.0 --port 8188

# Additional useful flags:
#   --lowvram       Use low VRAM mode (for 6-8 GB GPUs)
#   --gpu-only      Keep everything on GPU (for 24GB+ VRAM)
#   --preview-method auto  Enable live generation previews
#   --disable-smart-memory  Use less memory optimization

# For production use with auto-restart:
python main.py --listen 0.0.0.0 --port 8188 --disable-auto-launch`}
          />
          <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-3">
            <p className="text-xs text-zinc-400">
              <strong className="text-zinc-200">Important:</strong> The{" "}
              <code className="rounded bg-zinc-700 px-1 py-0.5 text-indigo-300">
                --listen
              </code>{" "}
              flag makes ComfyUI accessible on all network interfaces. Use{" "}
              <code className="rounded bg-zinc-700 px-1 py-0.5 text-indigo-300">
                --listen 127.0.0.1
              </code>{" "}
              to restrict to localhost only.
            </p>
          </div>
        </StepCard>

        {/* Step 5: Docker Setup */}
        <StepCard step={5} title="Docker Setup (Alternative)" icon={Box}>
          <p className="text-sm text-zinc-400">
            Alternatively, run ComfyUI in a Docker container for easier setup
            and isolation.
          </p>
          <CodeBlock
            language="dockerfile"
            code={`# docker-compose.yml
version: "3.8"
services:
  comfyui:
    image: ghcr.io/ai-dock/comfyui:latest
    ports:
      - "8188:8188"
    volumes:
      - ./models:/workspace/ComfyUI/models
      - ./custom_nodes:/workspace/ComfyUI/custom_nodes
      - ./output:/workspace/ComfyUI/output
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
    environment:
      - CLI_ARGS=--listen 0.0.0.0 --port 8188`}
          />
          <CodeBlock
            code={`# Start with Docker Compose
docker compose up -d

# Check logs
docker compose logs -f comfyui

# Stop
docker compose down`}
          />
        </StepCard>

        {/* Step 6: Troubleshooting */}
        <StepCard step={6} title="Troubleshooting" icon={HelpCircle}>
          <div className="space-y-4">
            {[
              {
                q: "ComfyUI won't start / Python errors",
                a: "Ensure you're using Python 3.10+. Try recreating the virtual environment and reinstalling dependencies. Check that PyTorch is installed with the correct CUDA version for your GPU.",
              },
              {
                q: "Out of memory (OOM) errors",
                a: "Use a smaller GGUF quantization (Q4_K_M or Q3_K_M). Add --lowvram flag when starting ComfyUI. Close other GPU-intensive applications.",
              },
              {
                q: "ContentForge can't connect to ComfyUI",
                a: "Verify ComfyUI is running with --listen flag. Check the host and port in Settings match. Ensure no firewall is blocking port 8188. Try accessing http://localhost:8188 in your browser.",
              },
              {
                q: "GGUF model not detected",
                a: "Make sure ComfyUI-GGUF custom node is installed in custom_nodes/. Restart ComfyUI after installing custom nodes. Check the model file is in models/diffusion_models/.",
              },
              {
                q: "Slow generation speed",
                a: "Use a smaller quantization for faster inference. Ensure you're using GPU acceleration (not CPU). Lower resolution and steps in pipeline settings. Consider using --gpu-only if you have enough VRAM.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-lg border border-zinc-800 p-4"
              >
                <p className="text-sm font-medium text-zinc-200">{item.q}</p>
                <p className="mt-1.5 text-xs text-zinc-400">{item.a}</p>
              </div>
            ))}
          </div>
        </StepCard>

        {/* Final test */}
        <div className="flex items-center justify-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 py-8">
          <p className="text-sm text-zinc-400">
            Finished setup? Test your connection:
          </p>
          <button
            onClick={testConnection}
            disabled={testStatus === "testing"}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
          >
            {testStatus === "testing" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Test Connection
          </button>
          {testStatus === "success" && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              ComfyUI is online!
            </span>
          )}
          {testStatus === "failed" && (
            <span className="flex items-center gap-1.5 text-sm text-red-400">
              <AlertCircle className="h-4 w-4" />
              Not reachable
            </span>
          )}
        </div>
      </div>
    </AppShell>
  );
}
