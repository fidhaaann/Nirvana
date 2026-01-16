import { useVoiceInterface } from "@/hooks/use-voice";
import { VoiceVisualizer } from "@/components/voice-visualizer";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, RefreshCw, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";

export default function ReceptionPage() {
  const { state, transcript, messages, startListening, stopListening, resetConversation } = useVoiceInterface();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-[40%] -left-[10%] w-[400px] h-[400px] rounded-full bg-blue-400/5 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 w-full max-w-5xl mx-auto p-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20">
            R
          </div>
          <div>
            <h1 className="font-display font-bold text-lg leading-tight">ReceptionAI</h1>
            <p className="text-xs text-muted-foreground font-medium">Virtual Assistant</p>
          </div>
        </div>
        <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
          Admin Login
        </Link>
      </header>

      {/* Main Interface */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center w-full max-w-2xl mx-auto px-4 pb-12">
        
        {/* Status Indicator */}
        <div className="mb-8 w-full max-w-sm">
          <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl rounded-3xl p-6 min-h-[140px] flex flex-col items-center justify-center">
            <VoiceVisualizer state={state} />
            {state === "listening" && transcript && (
              <p className="mt-4 text-sm text-muted-foreground italic text-center animate-pulse">
                "{transcript}"
              </p>
            )}
          </div>
        </div>

        {/* Mic Button */}
        <div className="relative mb-12">
          {state === "listening" && (
            <div className="absolute inset-0 bg-red-500 rounded-full animate-pulse-ring opacity-20" />
          )}
          <button
            onMouseDown={startListening}
            onMouseUp={stopListening}
            onTouchStart={startListening}
            onTouchEnd={stopListening}
            className={cn(
              "relative w-32 h-32 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform active:scale-95",
              state === "listening" 
                ? "bg-red-500 shadow-red-500/40 text-white" 
                : "bg-gradient-to-br from-white to-slate-100 border border-white/50 text-slate-700 hover:shadow-xl hover:-translate-y-1"
            )}
          >
            {state === "listening" ? (
              <Mic className="w-12 h-12" />
            ) : (
              <MicOff className="w-12 h-12 text-muted-foreground" />
            )}
          </button>
          <p className="mt-6 text-center text-sm font-medium text-muted-foreground">
            Hold to Speak
          </p>
        </div>

        {/* Chat Log */}
        <div className="w-full bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 shadow-lg p-6 max-h-[300px] overflow-y-auto flex flex-col-reverse gap-4">
          {messages.length === 0 && (
            <div className="text-center py-8 text-muted-foreground flex flex-col items-center gap-3">
              <MessageSquare className="w-8 h-8 opacity-20" />
              <p>No conversation yet. Press and hold the button to start.</p>
            </div>
          )}
          
          <AnimatePresence mode="popLayout">
            {[...messages].reverse().map((msg, i) => (
              <motion.div
                key={messages.length - 1 - i}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={cn(
                  "p-4 rounded-2xl text-sm max-w-[85%]",
                  msg.role === 'user' 
                    ? "bg-white text-slate-800 self-end shadow-sm border border-slate-100 rounded-br-none" 
                    : "bg-primary text-white self-start shadow-md shadow-primary/10 rounded-bl-none"
                )}
              >
                {msg.text}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={resetConversation}
            className="text-muted-foreground hover:text-red-500"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset Conversation
          </Button>
        </div>
      </main>
    </div>
  );
}
